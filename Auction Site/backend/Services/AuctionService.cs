using backend.Dtos.Auction;
using backend.Interfaces;
using backend.Models;

namespace backend.Services;

public class AuctionService
{
    private readonly IAuctionRepository _repo;

    public AuctionService(IAuctionRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<AuctionResponseDto>> GetOpenAsync(string? search)
    {
        var auctions = await _repo.GetOpenAsync(search);
        return auctions.Select(MapToDto).ToList();
    }

    public async Task<List<AuctionResponseDto>> GetClosedAsync(string? search)
    {
        var auctions = await _repo.GetClosedAsync(search);
        return auctions.Select(MapToDto).ToList();
    }

    public async Task<AuctionResponseDto?> GetByIdAsync(int id)
    {
        var auction = await _repo.GetByIdAsync(id);
        return auction == null ? null : MapToDto(auction);
    }

    public async Task<AuctionResponseDto> CreateAsync(CreateAuctionDto dto, int userId)
    {
        var auction = new Auction
        {
            Title = dto.Title,
            Description = dto.Description,
            StartingPrice = dto.StartingPrice,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            UserId = userId
        };

        var created = await _repo.CreateAsync(auction);
        var withUser = await _repo.GetByIdAsync(created.Id);
        return MapToDto(withUser!);
    }

    public async Task<(AuctionResponseDto? dto, string? error)> UpdateAsync(int id, UpdateAuctionDto dto, int userId)
    {
        var auction = await _repo.GetByIdAsync(id);

        if (auction == null) return (null, "Auktionen hittades inte.");
        if (auction.UserId != userId) return (null, "Du kan bara uppdatera dina egna auktioner.");
        if (!auction.IsOpen) return (null, "Stängda auktioner kan inte uppdateras.");

        auction.Title = dto.Title;
        auction.Description = dto.Description;
        auction.EndDate = dto.EndDate;

        await _repo.UpdateAsync(auction);
        return (MapToDto(auction), null);
    }

    public async Task<bool> SetActiveAsync(int id, bool isActive)
    {
        var auction = await _repo.GetByIdAsync(id);
        if (auction == null) return false;

        auction.IsActive = isActive;
        await _repo.UpdateAsync(auction);
        return true;
    }

    private static AuctionResponseDto MapToDto(Auction a) => new()
    {
        Id = a.Id,
        Title = a.Title,
        Description = a.Description,
        StartingPrice = a.StartingPrice,
        HighestBid = a.Bids.Any() ? a.Bids.Max(b => b.Amount) : null,
        StartDate = a.StartDate,
        EndDate = a.EndDate,
        IsOpen = a.IsOpen,
        IsActive = a.IsActive,
        UserId = a.UserId,
        Username = a.User?.Username ?? ""
    };
}