namespace Demo.Models;

public class TimeSelectorViewModel : TimeBaseViewModel
{
    // On pourrait ajouter ici une liste de Steps autorisés
    public List<int> AvailableSteps { get; set; } = new() { 1, 7, 30 };
}