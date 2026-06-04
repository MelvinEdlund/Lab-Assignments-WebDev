using backend.Dtos.Auth;

namespace backend.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<(bool success, string? error)> ChangePasswordAsync(int userId, ChangePasswordDto dto);
}
