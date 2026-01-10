// Find actual sunrise/sunset times with current calculations
const fs = require('fs');

// Load and evaluate astronomy.js
const astronomyCode = fs.readFileSync('astronomy.js', 'utf8');
eval(astronomyCode.replace('const Astronomy', 'global.Astronomy'));

const seattle = { lat: 47.6062, lng: -122.3321 };

console.log('Searching for actual sunrise/sunset times in Seattle on Jan 10, 2026...\n');

// Search for when sun altitude is near 0°
for (let hour = 0; hour < 24; hour++) {
    const utcTime = new Date(`2026-01-10T${String(hour).padStart(2, '0')}:00:00.000Z`);
    const sunPos = Astronomy.getSunPosition(utcTime, seattle.lat, seattle.lng);

    if (Math.abs(sunPos.altitude) < 5) {
        console.log(`${String(hour).padStart(2, '0')}:00 UTC - Alt: ${sunPos.altitude.toFixed(2)}°, Az: ${sunPos.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(sunPos.azimuth)})`);
    }
}

console.log('\n' + '='.repeat(70));
console.log('Checking every 15 minutes around expected sunrise (15:00-16:30 UTC)');
console.log('='.repeat(70) + '\n');

for (let hour = 15; hour < 17; hour++) {
    for (let min = 0; min < 60; min += 15) {
        const utcTime = new Date(`2026-01-10T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00.000Z`);
        const sunPos = Astronomy.getSunPosition(utcTime, seattle.lat, seattle.lng);

        // Calculate Pacific time
        const pacificHour = (hour - 8 + 24) % 24;

        console.log(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')} UTC (${String(pacificHour).padStart(2, '0')}:${String(min).padStart(2, '0')} Pacific) - Alt: ${sunPos.altitude.toFixed(2)}°, Az: ${sunPos.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(sunPos.azimuth)})`);
    }
}
