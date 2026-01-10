# Sun & Moon Position Animator

A web application that visualizes the position of the sun and moon in the sky with real-time astronomical calculations using the proven [SunCalc](https://github.com/mourner/suncalc) library.

## Features

- **360° Panoramic Sky View**: Full panoramic display showing the entire sky from horizon to zenith
- **Accurate Astronomical Calculations**: Precise sun and moon positions powered by the SunCalc library
- **Time Controls**:
  - Start with current time in your timezone
  - Advance/rewind by hours or days
  - Animated time progression with configurable speed
  - Live local time display
- **Location Configuration**: Set latitude, longitude, and timezone with timezone-aware calculations
- **Interactive Controls**:
  - Click and drag to pan across the full 360° view
  - Button controls for precise navigation
  - Accurate moon phase visualization with shadow rendering
  - 8-point compass rose (N, NE, E, SE, S, SW, W, NW)

## Usage

Simply open `index.html` in a web browser. No build process or server required.

### Controls

- **Location Panel**: Configure your geographic coordinates and timezone
- **Time Control**: Set time with timezone-aware display, see live local time
- **View Control**: Pan across the full 360° panoramic sky view - drag to rotate
- **Animation**: Auto-advance time at configurable speed (minutes per second)

### Default Location

The app defaults to Bellevue, WA (47.6101°N, 122.2015°W) in the Pacific timezone. Update the latitude and longitude fields to view the sky from your location.

## Technical Details

- **Frontend**: Pure JavaScript with HTML5 Canvas rendering
- **Astronomical Calculations**: [SunCalc library](https://github.com/mourner/suncalc) for accurate sun and moon positions
- **Timezone Handling**: Intl.DateTimeFormat API for proper timezone conversions
- **Responsive Design**: Works on desktop and mobile with touch support
- **No Build Required**: Static site with no dependencies to install

### Astronomical Accuracy

The app uses the SunCalc library which provides:
- Accurate sun position calculations (azimuth and altitude)
- Precise moon position and phase calculations
- Accounts for Earth's orbit, axial tilt, and observer location
- Validated against known sunrise/sunset times

### Testing

A comprehensive test suite is included:
- `test.html` - Browser-based test suite with 10 unit tests
- `test-astronomy.js` - Node.js tests for astronomical calculations
- Tests verify timezone conversions, sun/moon positions, and rising/setting behavior

## Files

### Core Application
- `index.html` - Main application page with UI and controls
- `app.js` - Application logic, rendering engine, and event handlers
- `astronomy.js` - Wrapper around SunCalc with consistent API
- `suncalc.js` - SunCalc library for astronomical calculations (8.3KB)

### Configuration
- `vercel.json` - Deployment configuration for static site hosting
- `.vercelignore` - Excludes development files from deployment

### Testing (Development Only)
- `test.html` - Interactive test suite with visual results
- `test-astronomy.js` - Automated astronomical calculation tests
- `test-timezone.js` - Timezone conversion verification
- `test-suncalc.js` - SunCalc library integration tests
- `debug.html` - Debugging interface for calculations
- Various helper scripts for development and debugging