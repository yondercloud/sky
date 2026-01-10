// Test astronomical calculations using the new SunCalc-based astronomy.js
const fs = require('fs');

// Load and evaluate astronomy.js
const astronomyCode = fs.readFileSync('astronomy.js', 'utf8');
eval(astronomyCode.replace('const Astronomy', 'global.Astronomy'));

const seattle = { lat: 47.6062, lng: -122.3321 };

console.log('='.repeat(70));
console.log('ASTRONOMICAL CALCULATIONS TEST');
console.log('Seattle, WA - January 10, 2026');
console.log('Expected: Sunrise ~7:54 AM, Sunset ~4:38 PM');
console.log('='.repeat(70));

// Test sunrise (7:54 AM Pacific = 15:54 UTC)
console.log('\n=== SUNRISE TEST (7:54 AM Pacific) ===');
const sunriseTime = new Date('2026-01-10T15:54:00.000Z');
const sunrisePos = Astronomy.getSunPosition(sunriseTime, seattle.lat, seattle.lng);
console.log(`UTC Time: ${sunriseTime.toISOString()}`);
console.log(`Sun Azimuth: ${sunrisePos.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(sunrisePos.azimuth)})`);
console.log(`Sun Altitude: ${sunrisePos.altitude.toFixed(2)}°`);
console.log(`Expected: Azimuth ~120-130° (SE), Altitude ~0°`);
const sunriseOK = sunrisePos.azimuth >= 100 && sunrisePos.azimuth <= 140 && Math.abs(sunrisePos.altitude) < 2;
console.log(`Status: ${sunriseOK ? '✓ PASS' : '✗ FAIL'}`);

// Test noon (12:00 PM Pacific = 20:00 UTC)
console.log('\n=== NOON TEST (12:00 PM Pacific) ===');
const noonTime = new Date('2026-01-10T20:00:00.000Z');
const noonPos = Astronomy.getSunPosition(noonTime, seattle.lat, seattle.lng);
console.log(`UTC Time: ${noonTime.toISOString()}`);
console.log(`Sun Azimuth: ${noonPos.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(noonPos.azimuth)})`);
console.log(`Sun Altitude: ${noonPos.altitude.toFixed(2)}°`);
console.log(`Expected: Azimuth ~180° (S), Altitude ~15-20° (low winter sun)`);
const noonOK = noonPos.azimuth >= 160 && noonPos.azimuth <= 200 && noonPos.altitude >= 10 && noonPos.altitude <= 25;
console.log(`Status: ${noonOK ? '✓ PASS' : '✗ FAIL'}`);

// Test sunset (4:38 PM Pacific = 00:38 UTC next day)
console.log('\n=== SUNSET TEST (4:38 PM Pacific) ===');
const sunsetTime = new Date('2026-01-11T00:38:00.000Z');
const sunsetPos = Astronomy.getSunPosition(sunsetTime, seattle.lat, seattle.lng);
console.log(`UTC Time: ${sunsetTime.toISOString()}`);
console.log(`Sun Azimuth: ${sunsetPos.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(sunsetPos.azimuth)})`);
console.log(`Sun Altitude: ${sunsetPos.altitude.toFixed(2)}°`);
console.log(`Expected: Azimuth ~230-240° (SW), Altitude ~0°`);
const sunsetOK = sunsetPos.azimuth >= 220 && sunsetPos.azimuth <= 260 && Math.abs(sunsetPos.altitude) < 2;
console.log(`Status: ${sunsetOK ? '✓ PASS' : '✗ FAIL'}`);

// Test 4:30 PM (before sunset)
console.log('\n=== 4:30 PM TEST (before sunset) ===');
const time430 = new Date('2026-01-11T00:30:00.000Z');
const pos430 = Astronomy.getSunPosition(time430, seattle.lat, seattle.lng);
console.log(`UTC Time: ${time430.toISOString()}`);
console.log(`Sun Azimuth: ${pos430.azimuth.toFixed(2)}° (${Astronomy.getDirectionName(pos430.azimuth)})`);
console.log(`Sun Altitude: ${pos430.altitude.toFixed(2)}°`);
console.log(`Expected: Still above horizon, in the SW`);
const time430OK = pos430.altitude > 0 && pos430.azimuth >= 220 && pos430.azimuth <= 260;
console.log(`Status: ${time430OK ? '✓ PASS' : '✗ FAIL'}`);

// Check if sun is rising at sunrise
console.log('\n=== CHECKING SUN MOVEMENT AT SUNRISE ===');
const before = new Date(sunriseTime.getTime() - 5 * 60 * 1000);
const after = new Date(sunriseTime.getTime() + 5 * 60 * 1000);
const posBefore = Astronomy.getSunPosition(before, seattle.lat, seattle.lng);
const posAfter = Astronomy.getSunPosition(after, seattle.lat, seattle.lng);
const isRising = posAfter.altitude > posBefore.altitude;
console.log(`5 min before: Altitude = ${posBefore.altitude.toFixed(2)}°`);
console.log(`At sunrise:   Altitude = ${sunrisePos.altitude.toFixed(2)}°`);
console.log(`5 min after:  Altitude = ${posAfter.altitude.toFixed(2)}°`);
console.log(`Status: ${isRising ? '✓ RISING' : '✗ NOT RISING'}`);

// Check if sun is setting at sunset
console.log('\n=== CHECKING SUN MOVEMENT AT SUNSET ===');
const before2 = new Date(sunsetTime.getTime() - 5 * 60 * 1000);
const after2 = new Date(sunsetTime.getTime() + 5 * 60 * 1000);
const posBefore2 = Astronomy.getSunPosition(before2, seattle.lat, seattle.lng);
const posAfter2 = Astronomy.getSunPosition(after2, seattle.lat, seattle.lng);
const isSetting = posAfter2.altitude < posBefore2.altitude;
console.log(`5 min before: Altitude = ${posBefore2.altitude.toFixed(2)}°`);
console.log(`At sunset:    Altitude = ${sunsetPos.altitude.toFixed(2)}°`);
console.log(`5 min after:  Altitude = ${posAfter2.altitude.toFixed(2)}°`);
console.log(`Status: ${isSetting ? '✓ SETTING' : '✗ NOT SETTING'}`);

console.log('\n' + '='.repeat(70));

// Summary
const totalTests = 6;
const passedTests = [sunriseOK, noonOK, sunsetOK, time430OK, isRising, isSetting].filter(x => x).length;
console.log(`\nRESULTS: ${passedTests}/${totalTests} tests passed`);
if (passedTests === totalTests) {
    console.log('✓ ALL TESTS PASSED!');
} else {
    console.log('✗ SOME TESTS FAILED');
}
