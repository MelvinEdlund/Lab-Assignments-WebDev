using System.Security.Claims;
using backend.Dtos.Auction;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuctionsController : ControllerBase
{
    private readonly AuctionService _service;

    public AuctionsController(AuctionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetOpen([FromQuery] string? search)
    {
        var result = await _service.GetOpenAsync(search);
        return Ok(result);
    }

    [HttpGet("closed")]
    public async Task<IActionResult> GetClosed([FromQuery] string? search)
    {
        var result = await _service.GetClosedAsync(search);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(CreateAuctionDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _service.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateAuctionDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var (result, error) = await _service.UpdateAsync(id, dto, userId);
        if (error != null) return BadRequest(new { message = error });
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var success = await _service.SetActiveAsync(id, false);
        return success ? NoContent() : NotFound();
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> Activate(int id)
    {
        var success = await _service.SetActiveAsync(id, true);
        return success ? NoContent() : NotFound();
    }
}