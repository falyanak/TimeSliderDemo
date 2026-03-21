using System.Runtime.CompilerServices;
using Demo.Models;
using Microsoft.AspNetCore.Mvc;

namespace Demo.Controllers;

public class TimeController : Controller
{
    // Page principale (vue Razor)
    public IActionResult Index()
    {

        var now = DateTime.Now;
        int nbYears = -5;

        var startDate = now.AddYears(nbYears);
        var endDate = now; // 2026-03-21

        var points = GetDummyData(startDate, endDate);

        var viewModel = new TimeSliderViewModel
        {
            StartDate = startDate.ToString("yyyy-MM-dd"),
            EndDate = endDate.ToString("yyyy-MM-dd"),
            RangeDays = 60,
            Data = points
        };

        return View(viewModel);
    }

    public List<TimePoint> GetDummyData(DateTime start, DateTime end)
    {
        var data = new List<TimePoint>();
        var random = new Random();
        double lastValue = 50;

        for (var date = start; date <= end; date = date.AddDays(1))
        {
            // Simulation d'une variation douce (Marche aléatoire)
            lastValue += (random.NextDouble() - 0.5) * 10;

            data.Add(new TimePoint
            {
                t = date.ToString("yyyy-MM-dd"),
                v = Math.Round(lastValue, 2)
            });
        }
        return data;
    }

    public IActionResult GetFilter(DateTime startDate, DateTime endDate)
    {
        return Content($"StartDate = {startDate} et endDate = {endDate}");
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