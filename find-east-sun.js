// Find when sun is in the east
const fs = require('fs');
const astronomyCode = fs.readFileSync('astronomy.js', 'utf8');
eval(astronomyCode.replace('const Astronomy', 'global.Astronomy'));

const seattle = { lat: 47.6062, lng: -122.3321 };

console.log('Finding when sun is in the EAST (azimuth 90-140°) on Jan 10, 2026...\n');

// Check every hour for full day
for (let hour = 0; hour < 24; hour++) {
    const utcTime = new Date(`2026-01-10T${String(hour).padStart(2, '0')}:00:00.000Z`);
    const sunPos = Astronomy.getSunPosition(utcTime, seattle.lat, seattle.lng);

    const pacificHour = (hour - 8 + 24) % 24;
    const isEast = sunPos.azimuth >= 90 && sunPos.azimuth <= 140;

    console.log(`${String(hour).padStart(2, '0')}:00 UTC (${String(pacificHour).padStart(2, '0')}:00 Pacific) - Az: ${sunPos.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(sunPos.azimuth)}), Alt: ${sunPos.altitude.toFixed(2)}° ${isEast ? '<-- EAST!' : ''}`);
}

console.log('\n' + '='.repeat(70));
console.log('Detailed search around when sun is near horizon in EAST');
console.log('='.repeat(70) + '\n');

// Fine search
for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
        const utcTime = new Date(`2026-01-10T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00.000Z`);
        const sunPos = Astronomy.getSunPosition(utcTime, seattle.lat, seattle.lng);

        const pacificHour = (hour - 8 + 24) % 24;
        const isEast = sunPos.azimuth >= 100 && sunPos.azimuth <= 140;
        const nearHorizon = Math.abs(sunPos.altitude) < 2;

        if (isEast && nearHorizon) {
            console.log(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')} UTC (${String(pacificHour).padStart(2, '0')}:${String(min).padStart(2, '0')} Pacific) - Az: ${sunPos.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(sunPos.azimuth)}), Alt: ${sunPos.altitude.toFixed(2)}° <-- SUNRISE CANDIDATE!`);
        }
    }
}
