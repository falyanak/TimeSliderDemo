namespace Demo.Models;

public class TimePoint
{
    /// <summary>
    /// La date au format ISO (ex: "2026-03-21")
    /// </summary>
    public string t { get; set; } = string.Empty;

    /// <summary>
    /// La valeur numérique associée
    /// </summary>
    public double v { get; set; }
}