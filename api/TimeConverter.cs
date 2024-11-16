namespace api;

public static class TimeConverter
{
    public static DateTime EpochToDateTime(long epochNanoseconds)
    {
        // Define the Unix epoch
        DateTime epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // Convert nanoseconds to seconds
        double epochSeconds = epochNanoseconds / 1_000_000_000.0;

        // Add the seconds to the epoch DateTime
        DateTime dateTime = epoch.AddSeconds(epochSeconds);

        return dateTime;
    }    
}