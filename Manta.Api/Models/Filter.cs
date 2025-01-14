using System.ComponentModel.DataAnnotations.Schema;

namespace Manta.Api.Models;

public class Filter
{
    public int Id { get; set; }
    
    [Column("filter")]
    public string? Text { get; set; }
    
    [Column("last_used")]
    public DateTime LastUsed { get; set; }
}