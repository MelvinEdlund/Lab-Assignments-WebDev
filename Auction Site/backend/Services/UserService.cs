using backend.Dtos.User;
using backend.Interfaces;
using backend.Models;

namespace backend.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;

    public UserService(IUserRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<UserResponseDto>> GetAllAsync()
    {
        var users = await _repo.GetAllAsync();
        return users.Select(MapToDto).ToList();
    }

    public async Task<bool> SetActiveAsync(int id, bool isActive)
    {
        var user = await _repo.GetByIdAsync(id);
        if (user == null) return false;

        user.IsActive = isActive;
        await _repo.UpdateAsync(user);
        return true;
    }

    private static UserResponseDto MapToDto(User u) => new()
    {
        Id = u.Id,
        Username = u.Username,
        Email = u.Email,
        IsAdmin = u.IsAdmin,
        IsActive = u.IsActive
    };
}