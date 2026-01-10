// Test with reference SunCalc library
const SunCalc = require('suncalc');

const seattle = { lat: 47.6062, lng: -122.3321 };

console.log('Testing with official SunCalc library\n');
console.log('Seattle, WA - January 10, 2026\n');

// Sunrise time
console.log('=== SUNRISE (7:54 AM Pacific = 15:54 UTC) ===');
const sunriseTime = new Date('2026-01-10T15:54:00.000Z');
const sunrisePos = SunCalc.getPosition(sunriseTime, seattle.lat, seattle.lng);
console.log(`Time: ${sunriseTime.toISOString()}`);
console.log(`Azimuth: ${(sunrisePos.azimuth * 180 / Math.PI + 180).toFixed(2)}°`);
console.log(`Altitude: ${(sunrisePos.altitude * 180 / Math.PI).toFixed(2)}°`);

// Noon
console.log('\n=== NOON (12:00 PM Pacific = 20:00 UTC) ===');
const noonTime = new Date('2026-01-10T20:00:00.000Z');
const noonPos = SunCalc.getPosition(noonTime, seattle.lat, seattle.lng);
console.log(`Time: ${noonTime.toISOString()}`);
console.log(`Azimuth: ${(noonPos.azimuth * 180 / Math.PI + 180).toFixed(2)}°`);
console.log(`Altitude: ${(noonPos.altitude * 180 / Math.PI).toFixed(2)}°`);

// Sunset time
console.log('\n=== SUNSET (4:38 PM Pacific = 00:38 UTC next day) ===');
const sunsetTime = new Date('2026-01-11T00:38:00.000Z');
const sunsetPos = SunCalc.getPosition(sunsetTime, seattle.lat, seattle.lng);
console.log(`Time: ${sunsetTime.toISOString()}`);
console.log(`Azimuth: ${(sunsetPos.azimuth * 180 / Math.PI + 180).toFixed(2)}°`);
console.log(`Altitude: ${(sunsetPos.altitude * 180 / Math.PI).toFixed(2)}°`);

// Get actual sunrise/sunset times
console.log('\n=== ACTUAL SUNRISE/SUNSET TIMES ===');
const times = SunCalc.getTimes(new Date('2026-01-10'), seattle.lat, seattle.lng);
console.log(`Sunrise: ${times.sunrise.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'})}`);
console.log(`Sunset: ${times.sunset.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'})}`);
console.log(`Solar Noon: ${times.solarNoon.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'})}`);
