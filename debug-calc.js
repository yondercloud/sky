// Debug astronomical calculations step by step

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const J2000 = 2451545.0;

function toJulian(date) {
    return date / 86400000 + 2440587.5;
}

function getSunEclipticLongitude(d) {
    const M = (357.5291 + 0.98560028 * d) * RAD;
    const C = (1.9148 * Math.sin(M) + 0.0200 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) * RAD;
    const L = (280.4665 + 0.98564736 * d) * RAD;
    return L + C + Math.PI;
}

function eclipticToEquatorial(lambda, beta) {
    const e = 23.4397 * RAD;
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);
    const sinBeta = Math.sin(beta);
    const cosBeta = Math.cos(beta);
    const sinE = Math.sin(e);
    const cosE = Math.cos(e);

    const ra = Math.atan2(sinLambda * cosE - Math.tan(beta) * sinE, cosLambda);
    const dec = Math.asin(sinBeta * cosE + cosBeta * sinE * sinLambda);

    return { ra, dec };
}

function getSiderealTime(d, lw) {
    const degrees = 280.16 + 360.9856235 * d;
    const normalized = ((degrees % 360) + 360) % 360; // Normalize to 0-360°
    return normalized * RAD - lw;
}

function getAzimuth(H, phi, dec) {
    return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)) + Math.PI;
}

function getAltitude(H, phi, dec) {
    return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
}

// Test with noon in Seattle
const noonUTC = new Date('2026-01-10T20:00:00.000Z');
const lat = 47.6062;
const lng = -122.3321;

console.log('='.repeat(70));
console.log('DEBUGGING NOON CALCULATION');
console.log('Seattle: 47.6062°N, 122.3321°W');
console.log('Time: 2026-01-10 12:00 PM Pacific (20:00 UTC)');
console.log('='.repeat(70));

const lw = -lng * RAD;
const phi = lat * RAD;
console.log(`\nlw (west longitude): ${lw} radians = ${lw * DEG}°`);
console.log(`phi (latitude): ${phi} radians = ${phi * DEG}°`);

const jd = toJulian(noonUTC);
console.log(`\nJulian Date: ${jd}`);

const d = jd - J2000;
console.log(`Days since J2000: ${d}`);

const eclipticLongitude = getSunEclipticLongitude(d);
console.log(`\nSun's ecliptic longitude: ${eclipticLongitude} radians = ${(eclipticLongitude * DEG) % 360}°`);

const equatorialCoords = eclipticToEquatorial(eclipticLongitude, 0);
console.log(`Sun's RA: ${equatorialCoords.ra} radians = ${(equatorialCoords.ra * DEG + 360) % 360}°`);
console.log(`Sun's Dec: ${equatorialCoords.dec} radians = ${equatorialCoords.dec * DEG}°`);

const gstDegrees = 280.16 + 360.9856235 * d;
const gstNorm = ((gstDegrees % 360) + 360) % 360;
console.log(`\nGreenwich Sidereal Time: ${gstDegrees}° -> normalized: ${gstNorm}°`);

const lst = getSiderealTime(d, lw);
const lstDegrees = ((lst * DEG) + 360) % 360;
console.log(`Local Sidereal Time: ${lstDegrees}°`);

const H = lst - equatorialCoords.ra;
console.log(`\nHour Angle: ${H} radians = ${H * DEG}°`);
console.log(`Hour Angle (hours): ${H * DEG / 15} hours`);

const azimuth = getAzimuth(H, phi, equatorialCoords.dec);
const altitude = getAltitude(H, phi, equatorialCoords.dec);

console.log(`\nFINAL RESULTS:`);
console.log(`Azimuth: ${(azimuth * DEG)}° (should be ~180° for south)`);
console.log(`Altitude: ${altitude * DEG}° (should be ~15-20° for winter noon)`);

// Try to see what happens at different times
console.log('\n' + '='.repeat(70));
console.log('TESTING DIFFERENT TIMES');
console.log('='.repeat(70));

for (let hour = 0; hour < 24; hour += 3) {
    const testDate = new Date(`2026-01-10T${String(hour).padStart(2, '0')}:00:00.000Z`);
    const jd2 = toJulian(testDate);
    const d2 = jd2 - J2000;
    const el2 = getSunEclipticLongitude(d2);
    const ec2 = eclipticToEquatorial(el2, 0);
    const lst2 = getSiderealTime(d2, lw);
    const H2 = lst2 - ec2.ra;
    const az2 = getAzimuth(H2, phi, ec2.dec);
    const alt2 = getAltitude(H2, phi, ec2.dec);

    console.log(`${String(hour).padStart(2, '0')}:00 UTC => Az: ${(az2 * DEG).toFixed(1)}°, Alt: ${(alt2 * DEG).toFixed(1)}°`);
}
