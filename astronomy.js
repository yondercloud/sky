// Astronomical calculations for Sun and Moon positions
// Based on simplified astronomical algorithms

const Astronomy = {
    // Constants
    RAD: Math.PI / 180,
    DEG: 180 / Math.PI,
    J2000: 2451545.0,

    // Convert date to Julian Date
    toJulian(date) {
        return date / 86400000 + 2440587.5;
    },

    // Calculate Sun position (azimuth and altitude)
    getSunPosition(date, lat, lng) {
        const lw = lng * this.RAD; // FIXED: use lng directly (negative for west, positive for east)
        const phi = lat * this.RAD;
        const d = this.toJulian(date) - this.J2000;

        const eclipticLongitude = this.getSunEclipticLongitude(d);
        const equatorialCoords = this.eclipticToEquatorial(eclipticLongitude, 0);

        const H = this.getSiderealTime(d, lw) - equatorialCoords.ra;
        const azimuth = this.getAzimuth(H, phi, equatorialCoords.dec);
        const altitude = this.getAltitude(H, phi, equatorialCoords.dec);

        return {
            azimuth: azimuth * this.DEG,
            altitude: altitude * this.DEG
        };
    },

    // Calculate Moon position (azimuth and altitude)
    getMoonPosition(date, lat, lng) {
        const lw = lng * this.RAD; // FIXED: use lng directly (negative for west, positive for east)
        const phi = lat * this.RAD;
        const d = this.toJulian(date) - this.J2000;

        const moonCoords = this.getMoonCoordinates(d);
        const H = this.getSiderealTime(d, lw) - moonCoords.ra;
        const azimuth = this.getAzimuth(H, phi, moonCoords.dec);
        const altitude = this.getAltitude(H, phi, moonCoords.dec);

        // Parallax correction
        const pa = 0.0002327 / moonCoords.dist;
        const h = altitude - pa * Math.cos(altitude);

        return {
            azimuth: azimuth * this.DEG,
            altitude: h * this.DEG,
            distance: moonCoords.dist
        };
    },

    // Calculate Moon illumination and phase
    getMoonIllumination(date) {
        const d = this.toJulian(date) - this.J2000;
        const sunCoords = this.getSunCoordinates(d);
        const moonCoords = this.getMoonCoordinates(d);

        const sdist = 149598000; // Sun distance in km
        const phi = Math.acos(
            Math.sin(sunCoords.dec) * Math.sin(moonCoords.dec) +
            Math.cos(sunCoords.dec) * Math.cos(moonCoords.dec) *
            Math.cos(sunCoords.ra - moonCoords.ra)
        );

        const inc = Math.atan2(sdist * Math.sin(phi), moonCoords.dist - sdist * Math.cos(phi));
        const angle = Math.atan2(
            Math.cos(sunCoords.dec) * Math.sin(sunCoords.ra - moonCoords.ra),
            Math.sin(sunCoords.dec) * Math.cos(moonCoords.dec) -
            Math.cos(sunCoords.dec) * Math.sin(moonCoords.dec) *
            Math.cos(sunCoords.ra - moonCoords.ra)
        );

        const fraction = (1 + Math.cos(inc)) / 2;
        const phase = 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI;

        return {
            fraction: fraction,
            phase: phase,
            angle: angle * this.DEG
        };
    },

    // Helper: Get sun's ecliptic longitude
    getSunEclipticLongitude(d) {
        const M = (357.5291 + 0.98560028 * d) * this.RAD; // Mean anomaly
        const C = (1.9148 * Math.sin(M) + 0.0200 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) * this.RAD; // Equation of center
        const L = (280.4665 + 0.98564736 * d) * this.RAD; // Mean longitude
        return L + C + Math.PI; // Ecliptic longitude
    },

    // Helper: Get sun's equatorial coordinates
    getSunCoordinates(d) {
        const L = this.getSunEclipticLongitude(d);
        return this.eclipticToEquatorial(L, 0);
    },

    // Helper: Get moon's geocentric coordinates
    getMoonCoordinates(d) {
        const L = (218.316 + 13.176396 * d) * this.RAD; // Ecliptic longitude
        const M = (134.963 + 13.064993 * d) * this.RAD; // Mean anomaly
        const F = (93.272 + 13.229350 * d) * this.RAD; // Argument of latitude

        const l = L + 6.289 * this.RAD * Math.sin(M); // Longitude
        const b = 5.128 * this.RAD * Math.sin(F); // Latitude
        const dt = 385001 - 20905 * Math.cos(M); // Distance to moon in km

        return {
            ...this.eclipticToEquatorial(l, b),
            dist: dt
        };
    },

    // Helper: Convert ecliptic to equatorial coordinates
    eclipticToEquatorial(lambda, beta) {
        const e = 23.4397 * this.RAD; // Obliquity of the ecliptic
        const sinLambda = Math.sin(lambda);
        const cosLambda = Math.cos(lambda);
        const sinBeta = Math.sin(beta);
        const cosBeta = Math.cos(beta);
        const sinE = Math.sin(e);
        const cosE = Math.cos(e);

        const ra = Math.atan2(sinLambda * cosE - Math.tan(beta) * sinE, cosLambda);
        const dec = Math.asin(sinBeta * cosE + cosBeta * sinE * sinLambda);

        return {
            ra: ra,
            dec: dec
        };
    },

    // Helper: Get sidereal time (Local Sidereal Time)
    getSiderealTime(d, lw) {
        const degrees = 280.16 + 360.9856235 * d;
        // Normalize GST to 0-360° before converting to radians
        const gstNorm = ((degrees % 360) + 360) % 360;
        return gstNorm * this.RAD - lw;
    },

    // Helper: Calculate azimuth from hour angle
    getAzimuth(H, phi, dec) {
        return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)) + Math.PI;
    },

    // Helper: Calculate altitude from hour angle
    getAltitude(H, phi, dec) {
        return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
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
