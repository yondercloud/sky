// Astronomical calculations for Sun and Moon positions
// Using SunCalc library for accurate calculations
// SunCalc: https://github.com/mourner/suncalc

// For browser usage, this expects SunCalc to be loaded separately
// For Node.js usage (tests), we require it
let SunCalc;
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    try {
        SunCalc = require('suncalc');
    } catch (e) {
        console.error('SunCalc not found. Install with: npm install suncalc');
    }
} else if (typeof window !== 'undefined' && window.SunCalc) {
    // Browser environment with SunCalc loaded
    SunCalc = window.SunCalc;
}

const Astronomy = {
    // Constants
    RAD: Math.PI / 180,
    DEG: 180 / Math.PI,

    // Calculate Sun position (azimuth and altitude)
    getSunPosition(date, lat, lng) {
        if (!SunCalc) {
            console.error('SunCalc library not loaded');
            return { azimuth: 0, altitude: 0 };
        }

        const pos = SunCalc.getPosition(date, lat, lng);

        return {
            // SunCalc returns azimuth from south, convert to from north (0° = north)
            azimuth: (pos.azimuth * this.DEG + 180) % 360,
            altitude: pos.altitude * this.DEG
        };
    },

    // Calculate Moon position (azimuth and altitude)
    getMoonPosition(date, lat, lng) {
        if (!SunCalc) {
            console.error('SunCalc library not loaded');
            return { azimuth: 0, altitude: 0, distance: 0 };
        }

        const pos = SunCalc.getMoonPosition(date, lat, lng);

        return {
            // SunCalc returns azimuth from south, convert to from north (0° = north)
            azimuth: (pos.azimuth * this.DEG + 180) % 360,
            altitude: pos.altitude * this.DEG,
            distance: pos.distance
        };
    },

    // Calculate Moon illumination and phase
    getMoonIllumination(date) {
        if (!SunCalc) {
            console.error('SunCalc library not loaded');
            return { fraction: 0, phase: 0, angle: 0 };
        }

        const illum = SunCalc.getMoonIllumination(date);

        return {
            fraction: illum.fraction,
            phase: illum.phase,
            angle: illum.angle * this.DEG
        };
    },

    // Get moon phase name
    getMoonPhaseName(phase) {
        if (phase < 0.03) return 'New Moon';
        if (phase < 0.22) return 'Waxing Crescent';
        if (phase < 0.28) return 'First Quarter';
        if (phase < 0.47) return 'Waxing Gibbous';
        if (phase < 0.53) return 'Full Moon';
        if (phase < 0.72) return 'Waning Gibbous';
        if (phase < 0.78) return 'Last Quarter';
        if (phase < 0.97) return 'Waning Crescent';
        return 'New Moon';
    },

    // Get direction name from azimuth
    getDirectionName(azimuth) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(azimuth / 22.5) % 16;
        return directions[index];
    }
};
