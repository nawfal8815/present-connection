
using Microsoft.EntityFrameworkCore;
using RoomReservation.Api.Data;
using RoomReservation.Api.Models;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Http.HttpResults;

FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.GetApplicationDefault()
});

await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(
    "cgHGCjRqP7S2NPJRLx6dH0JbGxu2",
    new Dictionary<string, object>
    {
        ["isAdmin"] = true
    }
);

Console.WriteLine("Admin claim assigned.");

var builder = WebApplication.CreateBuilder(args);

// Register EF Core InMemory.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("RoomReservationDb"));

// Allow your Vite React frontend to call this API.
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

static string? LogAndGetToken(HttpRequest request)
{
    var authorization = request.Headers.Authorization.ToString();

    if (!authorization.StartsWith(
            "Bearer ",
            StringComparison.OrdinalIgnoreCase))
    {
        Console.WriteLine("No Bearer token received.");
        return null;
    }

    var token = authorization["Bearer ".Length..].Trim();

    return token;
}

static async Task<bool> IsAdminAsync(string? token)
{
    if (string.IsNullOrWhiteSpace(token))
        return false;

    try
    {
        var decodedToken =
            await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);

        Console.WriteLine($"UID: {decodedToken.Uid}");

        return decodedToken.Claims.TryGetValue("isAdmin", out var value)
            && value is bool isAdmin
            && isAdmin;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Token verification failed: {ex.Message}");
        return false;
    }
}

var app = builder.Build();

app.UseCors("ReactFrontend");

// Create the in-memory database and insert initial rooms.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    SeedData.Initialize(db);
}

app.MapGet("/", () => Results.Ok(new
{
    message = "Room Reservation API is running"
}));

app.MapGet("/api/rooms", async (AppDbContext db) =>
    await db.Rooms
        .AsNoTracking()
        .OrderBy(room => room.Id)
        .ToListAsync());

app.MapPost("/api/reservations", (Reservation request, AppDbContext db) =>
{
    // check if userid is not there
    if (string.IsNullOrWhiteSpace(request.UserId))
    {
        return Results.BadRequest("UserId is required.");
    }

    //asign ID:
    if (request.Id == null)
    {
        var usedIds = db.Reservations
            .Select(r => r.Id)
            .ToHashSet();

        int id = 1;
        while (usedIds.Contains(id))
            id++;

        request.Id = id;
    }

    // checking for missing title
    int MaxLength = builder.Configuration
    .GetValue<int>("ReservationSettings:TitleMaxLength");
    if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length > MaxLength)
    {
        return Results.BadRequest("Title of the reservation is missing or too long.");
    }

    //Check for the overlapping
    var conflicts = db.Reservations
    .Where(r => r.RoomId == request.RoomId
    && r.Status != Reservation.StatusTypes.CANCELLED
    && request.StartTime < r.EndTime
    && request.EndTime > r.StartTime)
    .Select(r => new { r.StartTime, r.EndTime })
    .ToList();

    bool IsSameUser = db.Reservations.Any(r =>
        r.UserId == request.UserId &&
        request.StartTime < r.EndTime &&
        request.EndTime > r.StartTime
    );

    if (conflicts.Count > 0)
    {
        return Results.Conflict(new
        {
            code = "ROOM_OVERLAP",
            message = "This room is already booked for part of that period.",
            conflicts,
        });
    }

    if (IsSameUser)
    {
        return Results.BadRequest("You have another reservation that overlaps with this one.");
    }


    // Check for maximum duration, Booking horizon,  Valid time range
    int maxDurationDays = builder.Configuration
    .GetValue<int>("ReservationSettings:MaxDurationDays");
    int maxBookingHorizonDays = builder.Configuration
    .GetValue<int>("ReservationSettings:MaxBookingHorizonDays");
    bool exceedsMaxDuration = request.EndTime - request.StartTime >= TimeSpan.FromDays(maxDurationDays);
    bool exceedsBookingHorizon = request.StartTime < DateTime.Now.AddDays(maxBookingHorizonDays);
    bool invalidTimeRange =
    request.StartTime < DateTime.Today.AddDays(1);

    if (invalidTimeRange)
    {
        return Results.BadRequest(
            "The reservation must start tomorrow or later, and end after it starts."
        );
    }


    if (exceedsMaxDuration)
    {
        return Results.BadRequest("Reservation's duration cant be more than 7 days.");
    }

    if (exceedsBookingHorizon)
    {
        return Results.BadRequest("Reservations cannot start more than 90 days in advance.");
    }

    // check for capacity and if its active
    var room = db.Rooms.FirstOrDefault(r => r.Id == request.RoomId);

    if (room == null)
    {
        return Results.NotFound("Room not found.");
    }

    if (!room.IsActive)
    {
        return Results.BadRequest("This room is inactive and cannot be booked.");
    }

    if (request.Attendees > room.Capacity || request.Attendees <= 0)
    {
        return Results.BadRequest("The number of attendees exceeds the room capacity or null.");
    }

    request.Status = Reservation.StatusTypes.BOOKED;
    db.Reservations.Add(request);
    db.SaveChanges();

    return Results.Ok(request);
});

app.MapGet("/api/admin/users", async (HttpRequest request, AppDbContext db) =>
{
    var token = LogAndGetToken(request);

    if (!await IsAdminAsync(token))
    {
        return Results.Json(
            new { message = "You are not authorized to access the users list." },
            statusCode: StatusCodes.Status403Forbidden);
    }

    var users = new List<object>();

    await foreach (
        var user in FirebaseAuth.DefaultInstance.ListUsersAsync(null))
    {
        var count = await db.Reservations
            .AsNoTracking()
            .CountAsync(r => r.UserId == user.Uid);
        users.Add(new User
        {
            Id = user.Uid,
            Email = user.Email,
            DisplayName = user.DisplayName,
            IsDisabled = user.Disabled,
            ActiveReservations = count,
        });
    }

    return Results.Ok(users);
});

app.MapGet("/api/admin/reservations", async (
    HttpRequest request,
    AppDbContext db) =>
{
    var token = LogAndGetToken(request);
    if (!await IsAdminAsync(token))
        return Results.Json(
            new { message = "You are not authorized to access reservations." },
            statusCode: StatusCodes.Status403Forbidden);

    var reservations = await db.Reservations
        .AsNoTracking()
        .ToListAsync();

    return Results.Ok(reservations);
});

app.Run();

