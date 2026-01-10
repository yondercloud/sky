// Simple timezone conversion test that can be run with node

function testConversion(year, month, day, hour, minute, timezone) {
    console.log(`\n=== Testing: ${year}-${month}-${day} ${hour}:${minute} in ${timezone} ===`);

    // Step 1: Create UTC guess
    const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    console.log(`UTC Guess: ${utcGuess.toISOString()}`);

    // Step 2: Format in target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const formatted = formatter.format(utcGuess);
    console.log(`UTC Guess formatted in ${timezone}: ${formatted}`);

    const parts = formatter.formatToParts(utcGuess);
    const tzYear = parseInt(parts.find(p => p.type === 'year').value);
    const tzMonth = parseInt(parts.find(p => p.type === 'month').value);
    const tzDay = parseInt(parts.find(p => p.type === 'day').value);
    const tzHour = parseInt(parts.find(p => p.type === 'hour').value);
    const tzMinute = parseInt(parts.find(p => p.type === 'minute').value);

    console.log(`Parsed back: ${tzYear}-${tzMonth}-${tzDay} ${tzHour}:${tzMinute}`);

    // Step 3: Calculate difference
    const wantedUTC = Date.UTC(year, month - 1, day, hour, minute, 0);
    const gotUTC = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, 0);
    const diff = wantedUTC - gotUTC;

    console.log(`Wanted (as UTC timestamp): ${new Date(wantedUTC).toISOString()}`);
    console.log(`Got (as UTC timestamp): ${new Date(gotUTC).toISOString()}`);
    console.log(`Difference: ${diff / (1000 * 60 * 60)} hours`);

    // Step 4: Apply correction
    const result = new Date(utcGuess.getTime() + diff);
    console.log(`Result: ${result.toISOString()}`);

    // Verify
    const verify = formatter.format(result);
    console.log(`Verify (result in ${timezone}): ${verify}`);

    return result;
}

console.log('='.repeat(60));
console.log('TIMEZONE CONVERSION TESTS');
console.log('='.repeat(60));

// Test sunrise time
testConversion(2026, 1, 10, 7, 54, 'America/Los_Angeles');

// Test noon
testConversion(2026, 1, 10, 12, 0, 'America/Los_Angeles');

// Test sunset time
testConversion(2026, 1, 10, 16, 38, 'America/Los_Angeles');
