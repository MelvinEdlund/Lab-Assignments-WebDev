using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Auction;

public class UpdateAuctionDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime EndDate { get; set; }
}