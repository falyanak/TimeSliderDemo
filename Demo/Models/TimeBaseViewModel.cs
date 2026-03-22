using System.Text.Json;

namespace Demo.Models;

public abstract class TimeBaseViewModel
{
    public string StartDate { get; set; } = "2020-01-01";
    public string EndDate { get; set; } = DateTime.Now.ToString("yyyy-MM-dd");
    public List<TimePoint> Data { get; set; } = new();

    public int RangeDays { get; set; } = 60;

    // Propriété calculée pour injecter le JSON dans le data-attribute du HTML
    public string JsonData => JsonSerializer.Serialize(Data);
}