using backend.Models;

namespace backend.Interfaces;

public interface IAuctionRepository
{
    Task<List<Auction>> GetOpenAsync(string? search);
    Task<List<Auction>> GetClosedAsync(string? search);
    Task<List<Auction>> GetAllAdminAsync();
    Task<List<Auction>> GetByUserIdAsync(int userId);
    Task<Auction?> GetByIdAsync(int id);
    Task<Auction> CreateAsync(Auction auction);
    Task<Auction?> UpdateAsync(Auction auction);
    Task<bool> DeleteAsync(int id);

}