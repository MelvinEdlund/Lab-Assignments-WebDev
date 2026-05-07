using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Repositories;

public class BidRepository : IBidRepository
{
    private readonly AppDbContext _db;

    public BidRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Bid>> GetByAuctionIdAsync(int auctionId)
    {
        return await _db.Bids
            .Include(b => b.User)
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.Amount)
            .ToListAsync();
    }

    public async Task<Bid?> GetHighestBidAsync(int auctionId)
    {
        return await _db.Bids
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.Amount)
            .FirstOrDefaultAsync();
    }

    public async Task<Bid?> GetLatestBidAsync(int auctionId)
    {
        return await _db.Bids
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<Bid> CreateAsync(Bid bid)
    {
        _db.Bids.Add(bid);
        await _db.SaveChangesAsync();
        return bid;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var bid = await _db.Bids.FindAsync(id);
        if (bid == null) return false;
        _db.Bids.Remove(bid);
        await _db.SaveChangesAsync();
        return true;
    }
}