namespace backend.Dtos.Bid;

public class BidResponseDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int AuctionId { get; set; }
}