
using RoomReservation.Api.Models;

namespace RoomReservation.Api.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {   

        if (!db.Reservations.Any())
        {
            var Reservations = new List<Reservation>
            {        
            };
            
        }
        if (db.Rooms.Any())
            return;
    

        var rooms = new List<Room>
        {
            new() { Name = "Atlas", Capacity = 4, Floor = 1, Equipment = new() { "Whiteboard" }, IsActive = true },
            new() { Name = "Orion", Capacity = 6, Floor = 1, Equipment = new() { "Projector", "Whiteboard" }, IsActive = true },
            new() { Name = "Nova", Capacity = 8, Floor = 1, Equipment = new() { "TV screen" }, IsActive = true },
            new() { Name = "Apollo", Capacity = 10, Floor = 1, Equipment = new() { "Video conferencing", "TV screen" }, IsActive = true },
            new() { Name = "Luna", Capacity = 12, Floor = 1, Equipment = new() { "Projector", "Whiteboard" }, IsActive = true },

            new() { Name = "Mercury", Capacity = 4, Floor = 2, Equipment = new() { "TV screen" }, IsActive = true },
            new() { Name = "Venus", Capacity = 6, Floor = 2, Equipment = new() { "Whiteboard", "TV screen" }, IsActive = true },
            new() { Name = "Mars", Capacity = 8, Floor = 2, Equipment = new() { "Projector" }, IsActive = true },
            new() { Name = "Jupiter", Capacity = 10, Floor = 2, Equipment = new() { "Video conferencing", "Whiteboard" }, IsActive = true },
            new() { Name = "Saturn", Capacity = 14, Floor = 2, Equipment = new() { "Projector", "TV screen" }, IsActive = true },

            new() { Name = "Neptune", Capacity = 4, Floor = 3, Equipment = new() { "Whiteboard" }, IsActive = true },
            new() { Name = "Pluto", Capacity = 6, Floor = 3, Equipment = new() { "Projector" }, IsActive = true },
            new() { Name = "Cosmos", Capacity = 8, Floor = 3, Equipment = new() { "TV screen", "Whiteboard" }, IsActive = true },
            new() { Name = "Galaxy", Capacity = 12, Floor = 3, Equipment = new() { "Video conferencing", "Projector" }, IsActive = true },
            new() { Name = "Eclipse", Capacity = 16, Floor = 3, Equipment = new() { "TV screen", "Whiteboard", "Video conferencing" }, IsActive = true },

            new() { Name = "Horizon", Capacity = 4, Floor = 4, Equipment = new() { "TV screen" }, IsActive = true },
            new() { Name = "Summit", Capacity = 8, Floor = 4, Equipment = new() { "Projector", "Whiteboard" }, IsActive = true },
            new() { Name = "Zenith", Capacity = 12, Floor = 4, Equipment = new() { "Video conferencing" }, IsActive = true },
            new() { Name = "Pioneer", Capacity = 20, Floor = 4, Equipment = new() { "Projector", "TV screen", "Whiteboard", "Video conferencing" }, IsActive = true },
            new() { Name = "Renovation Room", Capacity = 10, Floor = 4, Equipment = new() { "Whiteboard" }, IsActive = true }
        };

        db.Rooms.AddRange(rooms);
        db.SaveChanges();
    }
}

