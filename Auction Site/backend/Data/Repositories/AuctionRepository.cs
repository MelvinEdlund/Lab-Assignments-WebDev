using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Repositories;

public class AuctionRepository : IAuctionRepository
{
    private readonly AppDbContext _db;

    public AuctionRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Auction>> GetOpenAsync(string? search)
    {
        var now = DateTime.UtcNow;
        return await _db.Auctions
            .Include(a => a.User)
            .Include(a => a.Bids)
            .Where(a => a.EndDate > now && a.IsActive &&
                        (search == null || a.Title.Contains(search)))
            .OrderByDescending(a => a.StartDate)
            .ToListAsync();
    }

    public async Task<List<Auction>> GetClosedAsync(string? search)
    {
        var now = DateTime.UtcNow;
        return await _db.Auctions
            .Include(a => a.User)
            .Include(a => a.Bids)
            .Where(a => a.EndDate <= now && a.IsActive &&
                        (search == null || a.Title.Contains(search)))
            .OrderByDescending(a => a.EndDate)
            .ToListAsync();
    }
    public async Task<List<Auction>> GetAllAdminAsync()
    {
        return await _db.Auctions
            .Include(a => a.User)
            .Include(a => a.Bids)
            .OrderByDescending(a => a.StartDate)
            .ToListAsync();
    }
    public async Task<List<Auction>> GetByUserIdAsync(int userId)
    {
        return await _db.Auctions
            .Include(a => a.User)
            .Include(a => a.Bids)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.StartDate)
            .ToListAsync();
    }

    public async Task<Auction?> GetByIdAsync(int id)
    {
        return await _db.Auctions
            .Include(a => a.User)
            .Include(a => a.Bids)
                .ThenInclude(b => b.User)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<Auction> CreateAsync(Auction auction)
    {
        _db.Auctions.Add(auction);
        await _db.SaveChangesAsync();
        return auction;
    }

    public async Task<Auction?> UpdateAsync(Auction auction)
    {
        _db.Auctions.Update(auction);
        await _db.SaveChangesAsync();
        return auction;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var auction = await _db.Auctions.FindAsync(id);
        if (auction == null) return false;
        _db.Auctions.Remove(auction);
        await _db.SaveChangesAsync();
        return true;
    }
}