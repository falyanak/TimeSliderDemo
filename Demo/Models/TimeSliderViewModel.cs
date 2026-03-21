using System.Text.Json;

namespace Demo.Models;

public class TimeSliderViewModel
{
    public string StartDate { get; set; } = "2020-01-01";
    public string EndDate { get; set; } = DateTime.Now.ToString("yyyy-MM-dd");
    public int RangeDays { get; set; } = 60;
    public List<TimePoint> Data { get; set; } = new();

    // Helper pour sérialiser proprement en HTML
    public string JsonData => JsonSerializer.Serialize(Data);
}