using System.Security.Claims;
using backend.Dtos.Bid;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BidsController : ControllerBase
{
    private readonly IBidService _service;

    public BidsController(IBidService service)
    {
        _service = service;
    }

    [HttpGet("auction/{auctionId}")]
    public async Task<IActionResult> GetByAuction(int auctionId)
    {
        var result = await _service.GetByAuctionIdAsync(auctionId);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("auction/{auctionId}")]
    public async Task<IActionResult> Create(int auctionId, CreateBidDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (result, error) = await _service.CreateAsync(dto, auctionId, userId);
        if (error != null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("{bidId}/auction/{auctionId}")]
    public async Task<IActionResult> Delete(int bidId, int auctionId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (success, error) = await _service.DeleteAsync(bidId, auctionId, userId);
        if (!success) return BadRequest(new { message = error });
        return NoContent();
    }
}