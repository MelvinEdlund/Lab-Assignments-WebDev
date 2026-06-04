using backend.Dtos.Bid;

namespace backend.Interfaces;

public interface IBidService
{
    Task<List<BidResponseDto>> GetByAuctionIdAsync(int auctionId);
    Task<(BidResponseDto? dto, string? error)> CreateAsync(CreateBidDto dto, int auctionId, int userId);
    Task<(bool success, string? error)> DeleteAsync(int bidId, int auctionId, int userId);
}
