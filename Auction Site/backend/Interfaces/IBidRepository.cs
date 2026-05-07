using backend.Models;

namespace backend.Interfaces;

public interface IBidRepository
{
    Task<List<Bid>> GetByAuctionIdAsync(int auctionId);
    Task<Bid?> GetHighestBidAsync(int auctionId);
    Task<Bid?> GetLatestBidAsync(int auctionId);
    Task<Bid> CreateAsync(Bid bid);
    Task<bool> DeleteAsync(int id);
}