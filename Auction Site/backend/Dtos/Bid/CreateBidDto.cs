using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.Bid;

public class CreateBidDto
{
    [Range(1, double.MaxValue, ErrorMessage = "Bud måste vara minst 1.")]
    public decimal Amount { get; set; }
}