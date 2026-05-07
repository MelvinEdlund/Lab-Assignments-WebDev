using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Auction;

public class CreateAuctionDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Range(1, double.MaxValue, ErrorMessage = "Startpris måste vara minst 1.")]
    public decimal StartingPrice { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }
}