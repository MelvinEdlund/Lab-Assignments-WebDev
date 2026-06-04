using backend.Dtos.Auction;

namespace backend.Interfaces;

public interface IAuctionService
{
    Task<List<AuctionResponseDto>> GetOpenAsync(string? search);
    Task<List<AuctionResponseDto>> GetClosedAsync(string? search);
    Task<List<AuctionResponseDto>> GetAllAdminAsync();
    Task<List<AuctionResponseDto>> GetMineAsync(int userId);
    Task<AuctionResponseDto?> GetByIdAsync(int id);
    Task<AuctionResponseDto> CreateAsync(CreateAuctionDto dto, int userId);
    Task<(AuctionResponseDto? dto, string? error)> UpdateAsync(int id, UpdateAuctionDto dto, int userId);
    Task<bool> SetActiveAsync(int id, bool isActive);
}
