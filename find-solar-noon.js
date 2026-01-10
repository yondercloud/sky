// Find solar noon (when hour angle H = 0)
const fs = require('fs');
const astronomyCode = fs.readFileSync('astronomy.js', 'utf8');

// Inject debug version that exposes H
const modifiedCode = astronomyCode.replace(
    'const H = this.getSiderealTime(d, lw) - equatorialCoords.ra;',
    'const H = this.getSiderealTime(d, lw) - equatorialCoords.ra; this.lastH = H;'
);

eval(modifiedCode.replace('const Astronomy', 'global.Astronomy'));

const seattle = { lat: 47.6062, lng: -122.3321 };

console.log('Finding solar noon (H=0) in Seattle on Jan 10, 2026...\n');

let minH = Infinity;
let minTime = null;

// Check every 15 minutes
for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
        const utcTime = new Date(`2026-01-10T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00.000Z`);
        const sunPos = Astronomy.getSunPosition(utcTime, seattle.lat, seattle.lng);
        const H = Astronomy.lastH;

        const pacificHour = (hour - 8 + 24) % 24;
        const Hdeg = H * 180 / Math.PI;

        // Normalize H to -180 to 180
        let Hnorm = Hdeg;
        while (Hnorm > 180) Hnorm -= 360;
        while (Hnorm < -180) Hnorm += 360;

        if (Math.abs(Hnorm) < Math.abs(minH)) {
            minH = Hnorm;
            minTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')} UTC (${String(pacificHour).padStart(2, '0')}:${String(min).padStart(2, '0')} Pacific)`;
        }

        if (Math.abs(Hnorm) < 10) {
            console.log(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')} UTC (${String(pacificHour).padStart(2, '0')}:${String(min).padStart(2, '0')} Pacific) - H: ${Hnorm.toFixed(2)}°, Az: ${sunPos.azimuth.toFixed(2)}°, Alt: ${sunPos.altitude.toFixed(2)}°`);
        }
    }
}

console.log(`\nClosest to solar noon: ${minTime}, H=${minH.toFixed(2)}°`);
console.log('\nSolar noon should be around 12:09 PM Pacific (longitude correction from PST standard meridian)');
