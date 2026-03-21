using Microsoft.AspNetCore.Mvc;

namespace Demo.Controllers;

public class TimeController : Controller
{
    // Page principale (vue Razor)
    public IActionResult Index()
    {
        var start = new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = DateTime.UtcNow.Date;

        var data = GenerateData(start, end);

        ViewBag.Start = start.ToString("O"); // ISO UTC
        ViewBag.End = end.ToString("O");
        ViewBag.Data = System.Text.Json.JsonSerializer.Serialize(data);

        return View();
    }

    // API JSON (utile pour évolution clean archi)
    [HttpGet]
    [Route("api/time")]
    public IActionResult Get([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var start = (from ?? new DateTime(2020, 1, 1)).ToUniversalTime().Date;
        var end = (to ?? DateTime.UtcNow).ToUniversalTime().Date;

        if (end < start)
            return BadRequest("Invalid range");

        var data = GenerateData(start, end);

        return Json(data);
    }

    // --- CORE LOGIC (isolée) ---
    private static List<TimePointDto> GenerateData(DateTime start, DateTime end)
    {
        var result = new List<TimePointDto>();

        var totalDays = (end - start).Days;

        for (int i = 0; i <= totalDays; i++)
        {
            var date = start.AddDays(i);

            result.Add(new TimePointDto
            {
                Date = date,
                Value = Math.Sin(date.DayOfYear / 10.0) * 100
            });
        }

        return result;
    }
}

// --- DTO ---
public class TimePointDto
{
    public DateTime Date { get; set; } // UTC
    public double Value { get; set; }
}