using backend.Dtos.User;

namespace backend.Interfaces;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllAsync();
    Task<bool> SetActiveAsync(int id, bool isActive);
}
