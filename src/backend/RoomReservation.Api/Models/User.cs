namespace RoomReservation.Api.Models;

public class User
{
    public string Id { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public bool IsDisabled { get; set; } = false;
    public string Email { get; set; } = "";
    public int ActiveReservations {get; set; } = 0;
}