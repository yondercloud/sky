// Test astronomical calculations
// This requires the astronomy.js functions to be converted to Node.js

const Astronomy = {
    RAD: Math.PI / 180,
    DEG: 180 / Math.PI,
    J2000: 2451545.0,

    toJulian(date) {
        return date / 86400000 + 2440587.5;
    },

    getSunPosition(date, lat, lng) {
        const lw = -lng * this.RAD; // longitude west is positive
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

    getSunEclipticLongitude(d) {
        const M = (357.5291 + 0.98560028 * d) * this.RAD;
        const C = (1.9148 * Math.sin(M) + 0.0200 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) * this.RAD;
        const L = (280.4665 + 0.98564736 * d) * this.RAD;
        return L + C + Math.PI;
    },

    eclipticToEquatorial(lambda, beta) {
        const e = 23.4397 * this.RAD;
        const sinLambda = Math.sin(lambda);
        const cosLambda = Math.cos(lambda);
        const sinBeta = Math.sin(beta);
        const cosBeta = Math.cos(beta);
        const sinE = Math.sin(e);
        const cosE = Math.cos(e);

        const ra = Math.atan2(sinLambda * cosE - Math.tan(beta) * sinE, cosLambda);
        const dec = Math.asin(sinBeta * cosE + cosBeta * sinE * sinLambda);

        return { ra, dec };
    },

    getSiderealTime(d, lw) {
        // Based on SunCalc - do NOT normalize before subtracting lw
        return this.RAD * (280.16 + 360.9856235 * d) - lw;
    },

    getAzimuth(H, phi, dec) {
        return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)) + Math.PI;
    },

    getAltitude(H, phi, dec) {
        return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
    },

    getDirectionName(azimuth) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(azimuth / 22.5) % 16;
        return directions[index];
    }
};

// Seattle coordinates
const seattle = { lat: 47.6062, lng: -122.3321 };

console.log('='.repeat(70));
console.log('ASTRONOMICAL CALCULATIONS TEST');
console.log('Seattle, WA - January 10, 2026');
console.log('Expected: Sunrise ~7:54 AM, Sunset ~4:38 PM');
console.log('='.repeat(70));

// Test sunrise (7:54 AM Pacific = 15:54 UTC)
console.log('\n=== SUNRISE TEST (7:54 AM Pacific) ===');
const sunriseUTC = new Date('2026-01-10T15:54:00.000Z');
const sunrisePos = Astronomy.getSunPosition(sunriseUTC, seattle.lat, seattle.lng);
console.log(`UTC Time: ${sunriseUTC.toISOString()}`);
console.log(`Sun Azimuth: ${sunrisePos.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(sunrisePos.azimuth)})`);
console.log(`Sun Altitude: ${sunrisePos.altitude.toFixed(2)}°`);
console.log(`Expected: Azimuth ~120-130° (SE), Altitude ~0°`);
console.log(`Status: ${sunrisePos.altitude >= -1 && sunrisePos.altitude <= 1 ? '✓ PASS' : '✗ FAIL'}`);

// Test noon (12:00 PM Pacific = 20:00 UTC)
console.log('\n=== NOON TEST (12:00 PM Pacific) ===');
const noonUTC = new Date('2026-01-10T20:00:00.000Z');
const noonPos = Astronomy.getSunPosition(noonUTC, seattle.lat, seattle.lng);
console.log(`UTC Time: ${noonUTC.toISOString()}`);
console.log(`Sun Azimuth: ${noonPos.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(noonPos.azimuth)})`);
console.log(`Sun Altitude: ${noonPos.altitude.toFixed(2)}°`);
console.log(`Expected: Azimuth ~180° (S), Altitude ~15-20° (low winter sun)`);
console.log(`Status: ${noonPos.altitude >= 10 && noonPos.altitude <= 25 ? '✓ PASS' : '✗ FAIL'}`);

// Test sunset (4:38 PM Pacific = 00:38 UTC next day)
console.log('\n=== SUNSET TEST (4:38 PM Pacific) ===');
const sunsetUTC = new Date('2026-01-11T00:38:00.000Z');
const sunsetPos = Astronomy.getSunPosition(sunsetUTC, seattle.lat, seattle.lng);
console.log(`UTC Time: ${sunsetUTC.toISOString()}`);
console.log(`Sun Azimuth: ${sunsetPos.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(sunsetPos.azimuth)})`);
console.log(`Sun Altitude: ${sunsetPos.altitude.toFixed(2)}°`);
console.log(`Expected: Azimuth ~230-240° (SW), Altitude ~0°`);
console.log(`Status: ${sunsetPos.altitude >= -1 && sunsetPos.altitude <= 1 ? '✓ PASS' : '✗ FAIL'}`);

// Test 4:30 PM (before sunset)
console.log('\n=== 4:30 PM TEST (before sunset) ===');
const time430UTC = new Date('2026-01-11T00:30:00.000Z');
const pos430 = Astronomy.getSunPosition(time430UTC, seattle.lat, seattle.lng);
console.log(`UTC Time: ${time430UTC.toISOString()}`);
console.log(`Sun Azimuth: ${pos430.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(pos430.azimuth)})`);
console.log(`Sun Altitude: ${pos430.altitude.toFixed(2)}°`);
console.log(`Expected: Still above horizon, in the SW`);
console.log(`Status: ${pos430.altitude > 0 ? '✓ PASS' : '✗ FAIL'}`);

// Check if sun is rising at sunrise
console.log('\n=== CHECKING SUN MOVEMENT AT SUNRISE ===');
const before = new Date(sunriseUTC.getTime() - 5 * 60 * 1000);
const after = new Date(sunriseUTC.getTime() + 5 * 60 * 1000);
const posBefore = Astronomy.getSunPosition(before, seattle.lat, seattle.lng);
const posAfter = Astronomy.getSunPosition(after, seattle.lat, seattle.lng);
console.log(`5 min before: Altitude = ${posBefore.altitude.toFixed(2)}°`);
console.log(`At sunrise:   Altitude = ${sunrisePos.altitude.toFixed(2)}°`);
console.log(`5 min after:  Altitude = ${posAfter.altitude.toFixed(2)}°`);
console.log(`Status: ${posAfter.altitude > posBefore.altitude ? '✓ RISING' : '✗ NOT RISING'}`);

// Check if sun is setting at sunset
console.log('\n=== CHECKING SUN MOVEMENT AT SUNSET ===');
const before2 = new Date(sunsetUTC.getTime() - 5 * 60 * 1000);
const after2 = new Date(sunsetUTC.getTime() + 5 * 60 * 1000);
const posBefore2 = Astronomy.getSunPosition(before2, seattle.lat, seattle.lng);
const posAfter2 = Astronomy.getSunPosition(after2, seattle.lat, seattle.lng);
console.log(`5 min before: Altitude = ${posBefore2.altitude.toFixed(2)}°`);
console.log(`At sunset:    Altitude = ${sunsetPos.altitude.toFixed(2)}°`);
console.log(`5 min after:  Altitude = ${posAfter2.altitude.toFixed(2)}°`);
console.log(`Status: ${posAfter2.altitude < posBefore2.altitude ? '✓ SETTING' : '✗ NOT SETTING'}`);

console.log('\n' + '='.repeat(70));
