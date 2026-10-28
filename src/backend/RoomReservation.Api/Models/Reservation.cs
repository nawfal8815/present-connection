namespace RoomReservation.Api.Models;

public class Reservation {
    public int? Id {get; set; }
    public int RoomId { get; set; }
    public string UserId {get; set; } = "";
    public DateTime StartTime { get; set; }
    public DateTime EndTime {get; set; }
    public int Attendees {get; set; }
    public enum StatusTypes {DEFAULT, COMPLETED, BOOKED, CANCELLED}
    public StatusTypes Status {get; set;} = StatusTypes.DEFAULT;
    public string Title {get; set; } = "";

}


