using backend.Models;

namespace backend.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
