// Compare our calculations with SunCalc step by step
const SunCalc = require('suncalc');
const fs = require('fs');

// Load our astronomy.js
const astronomyCode = fs.readFileSync('astronomy.js', 'utf8');
eval(astronomyCode.replace('const Astronomy', 'global.Astronomy'));

const seattle = { lat: 47.6062, lng: -122.3321 };
const noonTime = new Date('2026-01-10T20:00:00.000Z');

console.log('=== COMPARING CALCULATIONS AT NOON ===\n');

// Our implementation
console.log('OUR IMPLEMENTATION:');
const ourPos = Astronomy.getSunPosition(noonTime, seattle.lat, seattle.lng);
console.log(`Azimuth: ${ourPos.azimuth.toFixed(2)}°`);
console.log(`Altitude: ${ourPos.altitude.toFixed(2)}°`);

// SunCalc
console.log('\nSUNCALC:');
const sunCalcPos = SunCalc.getPosition(noonTime, seattle.lat, seattle.lng);
const sunCalcAz = (sunCalcPos.azimuth * 180 / Math.PI + 180);
const sunCalcAlt = (sunCalcPos.altitude * 180 / Math.PI);
console.log(`Azimuth: ${sunCalcAz.toFixed(2)}°`);
console.log(`Altitude: ${sunCalcAlt.toFixed(2)}°`);

console.log('\nDIFFERENCE:');
console.log(`Azimuth difference: ${(ourPos.azimuth - sunCalcAz).toFixed(2)}°`);
console.log(`Altitude difference: ${(ourPos.altitude - sunCalcAlt).toFixed(2)}°`);

// Now let's manually calculate step-by-step
console.log('\n=== STEP-BY-STEP CALCULATION ===\n');

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const J2000 = 2451545.0;

const lat = seattle.lat;
const lng = seattle.lng;

// Step 1: Julian date
const jd = noonTime / 86400000 + 2440587.5;
const d = jd - J2000;
console.log(`Julian Date: ${jd}`);
console.log(`Days since J2000: ${d}`);

// Step 2: Longitude and latitude
const lw = -lng * RAD;
const phi = lat * RAD;
console.log(`\nlw (our formula): ${lw} radians = ${lw * DEG}°`);
console.log(`phi: ${phi} radians = ${phi * DEG}°`);

// Step 3: Sun's ecliptic longitude
const M = (357.5291 + 0.98560028 * d) * RAD;
const C = (1.9148 * Math.sin(M) + 0.0200 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) * RAD;
const L = (280.4665 + 0.98564736 * d) * RAD;
const sunLambda = L + C + Math.PI;
console.log(`\nSun's ecliptic longitude: ${(sunLambda * DEG) % 360}°`);

// Step 4: Equatorial coordinates
const e = 23.4397 * RAD;
const sunRA = Math.atan2(Math.sin(sunLambda) * Math.cos(e), Math.cos(sunLambda));
const sunDec = Math.asin(Math.sin(e) * Math.sin(sunLambda));
console.log(`Sun's RA: ${((sunRA * DEG + 360) % 360).toFixed(2)}°`);
console.log(`Sun's Dec: ${(sunDec * DEG).toFixed(2)}°`);

// Step 5: Sidereal time (NO normalization)
const gstRaw = 280.16 + 360.9856235 * d;
const lst = (gstRaw * RAD) - lw;
console.log(`\nGST (raw, no normalization): ${gstRaw}°`);
console.log(`LST: ${lst} radians`);
console.log(`LST in degrees: ${(lst * DEG) % 360}°`);

// Step 6: Hour angle
const H = lst - sunRA;
console.log(`\nHour angle H: ${H} radians`);
console.log(`H in degrees: ${(H * DEG) % 360}°`);
console.log(`H in hours: ${(H * DEG / 15).toFixed(2)}`);

// Step 7: Azimuth and altitude
const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(sunDec) * Math.cos(phi)) + Math.PI;
const alt = Math.asin(Math.sin(phi) * Math.sin(sunDec) + Math.cos(phi) * Math.cos(sunDec) * Math.cos(H));

console.log(`\nFinal azimuth: ${(az * DEG).toFixed(2)}°`);
console.log(`Final altitude: ${(alt * DEG).toFixed(2)}°`);
console.log(`\nShould be: Az ≈ 175.74°, Alt ≈ 20.36°`);
