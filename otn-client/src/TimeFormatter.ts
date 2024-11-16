class TimeFormatter {
    static FormatTime = (milliseconds: number, zeroValue: string = '0') => {
    if (milliseconds >= 1000.0) {
        // Seconds
        const seconds = milliseconds / 1000.0;
        return `${seconds.toFixed(2)} s`;
    }
    else if (milliseconds >= 1.0) {
        // Milliseconds
        return `${milliseconds.toFixed(2)} ms`;
    } else if (milliseconds < 1.0 && milliseconds > 0.0) {
      // Microsecnds
      const microseconds = milliseconds * 1000.0;
      return `${microseconds.toFixed(2)} µs`;
    } else {
        return zeroValue;
    }
  };
}

export default TimeFormatter;