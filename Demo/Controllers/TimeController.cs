using Demo.Models;
using Microsoft.AspNetCore.Mvc;

namespace Demo.Controllers;

public class TimeController : Controller
{
    public IActionResult Index(bool useSlider = false)
    {
        var start = DateTime.Now.AddYears(-5);
        var end = DateTime.Now;
        var data = GetDummyData(start, end);

        if (useSlider)
        {
            return View("IndexSlider", new TimeSliderViewModel
            {
                StartDate = start.ToString("yyyy-MM-dd"),
                EndDate = end.ToString("yyyy-MM-dd"),
                RangeDays = 60,
                Data = data
            });
        }

        return View("IndexForm", new TimeFormViewModel
        {
            StartDate = start.ToString("yyyy-MM-dd"),
            EndDate = end.ToString("yyyy-MM-dd"),
            RangeDays = 60,
            Data = data
        });
    }

    // Cette méthode reçoit la soumission du formulaire Mobile ET du Slider
    [HttpPost]
    public IActionResult ApplyFilter(TimeSliderViewModel model)
    {
        if (!DateTime.TryParse(model.StartDate, out var start) ||
            !DateTime.TryParse(model.EndDate, out var end))
        {
            return BadRequest("Dates invalides");
        }

        if (end < start)
        {
            ModelState.AddModelError("", "La fin doit être après le début.");
            return View("Index", model);
        }

        // Ici on recharge les données filtrées
        model.Data = GetDummyData(start, end);

        return View("Index", model);
    }

    // Nouvelle méthode pour les appels AJAX du graphique
    [HttpGet]
    public IActionResult GetData(string start, string end)
    {
        if (!DateTime.TryParse(start, out var startDate) ||
            !DateTime.TryParse(end, out var endDate))
        {
            return BadRequest("Dates invalides");
        }

        // On réutilise ton helper existant
        var dataPoints = GetDummyData(startDate, endDate);

        // On retourne directement le JSON attendu par le JS
        return Json(dataPoints);
    }

    // --- Helpers (Logique préservée) ---
    public List<TimePoint> GetDummyData(DateTime start, DateTime end)
    {
        var data = new List<TimePoint>();
        var random = new Random();
        double lastValue = 50;

        for (var date = start; date <= end; date = date.AddDays(1))
        {
            lastValue += (random.NextDouble() - 0.5) * 10;
            data.Add(new TimePoint { t = date.ToString("yyyy-MM-dd"), v = Math.Round(lastValue, 2) });
        }
        return data;
    }
}