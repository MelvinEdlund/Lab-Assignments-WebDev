using backend.Dtos.Bid;
using backend.Interfaces;
using backend.Models;

namespace backend.Services;

public class BidService : IBidService
{
    private readonly IBidRepository _bidRepo;
    private readonly IAuctionRepository _auctionRepo;

    public BidService(IBidRepository bidRepo, IAuctionRepository auctionRepo)
    {
        _bidRepo = bidRepo;
        _auctionRepo = auctionRepo;
    }

    public async Task<List<BidResponseDto>> GetByAuctionIdAsync(int auctionId)
    {
        var bids = await _bidRepo.GetByAuctionIdAsync(auctionId);
        return bids.Select(MapToDto).ToList();
    }

    public async Task<(BidResponseDto? dto, string? error)> CreateAsync(CreateBidDto dto, int auctionId, int userId)
    {
        var auction = await _auctionRepo.GetByIdAsync(auctionId);

        if (auction == null) return (null, "Auktionen hittades inte.");
        if (!auction.IsOpen) return (null, "Auktionen är stängd.");
        if (auction.UserId == userId) return (null, "Du kan inte buda på din egen auktion.");

        var highest = await _bidRepo.GetHighestBidAsync(auctionId);
        decimal minimumBid = highest?.Amount ?? auction.StartingPrice;

        if (dto.Amount <= minimumBid)
            return (null, $"Budet måste vara högre än {minimumBid} kr.");

        var bid = new Bid
        {
            Amount = dto.Amount,
            AuctionId = auctionId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _bidRepo.CreateAsync(bid);

        var bids = await _bidRepo.GetByAuctionIdAsync(auctionId);
        var withUser = bids.First(b => b.Id == created.Id);
        return (MapToDto(withUser), null);
    }

    public async Task<(bool success, string? error)> DeleteAsync(int bidId, int auctionId, int userId)
    {
        var auction = await _auctionRepo.GetByIdAsync(auctionId);
        if (auction == null) return (false, "Auktionen hittades inte.");
        if (!auction.IsOpen) return (false, "Kan inte ta bort bud på avslutad auktion.");

        var latest = await _bidRepo.GetLatestBidAsync(auctionId);
        if (latest == null || latest.Id != bidId) return (false, "Du kan bara ta bort det senaste budet.");
        if (latest.UserId != userId) return (false, "Du kan bara ta bort dina egna bud.");

        await _bidRepo.DeleteAsync(bidId);
        return (true, null);
    }

    private static BidResponseDto MapToDto(Bid b) => new()
    {
        Id = b.Id,
        Amount = b.Amount,
        CreatedAt = b.CreatedAt,
        UserId = b.UserId,
        Username = b.User?.Username ?? "",
        AuctionId = b.AuctionId
    };
}