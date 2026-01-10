# Sun & Moon Position Animator

A web application that visualizes the position of the sun and moon in the sky with real-time astronomical calculations.

## Features

- **Horizon View**: Visual representation of the sky facing south with ability to pan east/west
- **Real-time Calculations**: Accurate sun and moon positions based on astronomical algorithms
- **Time Controls**:
  - Start with current time
  - Advance/rewind by hours or days
  - Animated time progression
- **Location Configuration**: Set latitude, longitude, and timezone
- **Interactive Controls**:
  - Click and drag to pan the view
  - Button controls for precise navigation
  - Moon phase visualization
  - Directional compass labels

## Usage

Simply open `index.html` in a web browser. No build process or server required.

### Controls

- **Location Panel**: Configure your geographic coordinates
- **Time Control**: Adjust the current viewing time
- **View Control**: Pan left/right to see eastern or western sky
- **Animation**: Auto-advance time at configurable speed

### Default Location

The app defaults to Bellevue, WA (47.6101°N, 122.2015°W) in the Pacific timezone. Update the latitude and longitude fields to view the sky from your location.

## Technical Details

- Pure JavaScript with HTML5 Canvas
- Astronomical calculations based on simplified but accurate formulas
- Responsive design for desktop and mobile
- No external dependencies

## Files

- `index.html` - Main application page with UI
- `astronomy.js` - Astronomical calculation algorithms
- `app.js` - Application logic and rendering engine