namespace backend.Dtos.Auction;

public class AuctionResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
    public decimal? HighestBid { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsOpen { get; set; }
    public bool IsActive { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
}