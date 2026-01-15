// Main application logic
const app = {
    canvas: null,
    ctx: null,
    currentTime: new Date(),
    viewAzimuth: 180, // Start facing south
    isAnimating: false,
    animationInterval: null,
    dragStart: null,

    // Initialize the application
    init() {
        this.canvas = document.getElementById('skyCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas resolution
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize time input
        this.resetToNow();

        // Setup event listeners
        this.setupEventListeners();

        // Initial render
        this.update();
    },

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvasWidth = rect.width;
        this.canvasHeight = rect.height;
        this.update();
    },

    setupEventListeners() {
        // Time input change
        document.getElementById('current-time').addEventListener('change', (e) => {
            // Interpret the datetime-local value as being in the selected timezone
            const timezone = document.getElementById('timezone').value;
            const localTimeStr = e.target.value;
            this.currentTime = this.parseTimeInTimezone(localTimeStr, timezone);
            this.update();
        });

        // Timezone change
        document.getElementById('timezone').addEventListener('change', () => {
            this.updateTimeInput();
            this.update();
        });

        // Location change
        document.getElementById('latitude').addEventListener('change', () => this.update());
        document.getElementById('longitude').addEventListener('change', () => this.update());

        // Canvas drag to pan
        this.canvas.addEventListener('mousedown', (e) => {
            this.dragStart = { x: e.clientX, azimuth: this.viewAzimuth };
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.dragStart) {
                const delta = e.clientX - this.dragStart.x;
                this.viewAzimuth = this.dragStart.azimuth - (delta / this.canvasWidth) * 360;
                this.viewAzimuth = ((this.viewAzimuth % 360) + 360) % 360;
                this.updateViewAzimuthDisplay();
                this.update();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.dragStart = null;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.dragStart = null;
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.dragStart = { x: touch.clientX, azimuth: this.viewAzimuth };
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.dragStart) {
                const touch = e.touches[0];
                const delta = touch.clientX - this.dragStart.x;
                this.viewAzimuth = this.dragStart.azimuth - (delta / this.canvasWidth) * 360;
                this.viewAzimuth = ((this.viewAzimuth % 360) + 360) % 360;
                this.updateViewAzimuthDisplay();
                this.update();
            }
        });

        this.canvas.addEventListener('touchend', () => {
            this.dragStart = null;
        });
    },

    resetToNow() {
        this.currentTime = new Date();
        this.updateTimeInput();
        this.update();
    },

    updateTimeInput() {
        const timezone = document.getElementById('timezone').value;
        const timeStr = this.formatTimeInTimezone(this.currentTime, timezone);
        document.getElementById('current-time').value = timeStr;
    },

    // Convert a datetime-local string in a specific timezone to UTC Date object
    parseTimeInTimezone(localTimeStr, timezone) {
        // Parse the YYYY-MM-DDTHH:mm string
        const [datePart, timePart] = localTimeStr.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);

        try {
            // We want to find the UTC time that corresponds to the given local time in the specified timezone
            // Strategy: Start with a UTC guess, see what time it is in the target timezone, then adjust

            // Initial guess: interpret the input as UTC
            let utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

            // Now see what time this UTC moment is in the target timezone
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const parts = formatter.formatToParts(utcGuess);
            const tzYear = parseInt(parts.find(p => p.type === 'year').value);
            const tzMonth = parseInt(parts.find(p => p.type === 'month').value);
            const tzDay = parseInt(parts.find(p => p.type === 'day').value);
            const tzHour = parseInt(parts.find(p => p.type === 'hour').value);
            const tzMinute = parseInt(parts.find(p => p.type === 'minute').value);

            // Calculate the difference (in milliseconds) between what we want and what we got
            // Both calculations use UTC to be timezone-independent
            const wantedUTC = Date.UTC(year, month - 1, day, hour, minute, 0);
            const gotUTC = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute, 0);
            const diff = wantedUTC - gotUTC;

            // Apply the correction to our guess
            return new Date(utcGuess.getTime() + diff);
        } catch (e) {
            console.error('Timezone parsing error:', e);
            // Fallback: treat the input as UTC
            return new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
        }
    },

    // Format a UTC Date object as a datetime-local string in a specific timezone
    formatTimeInTimezone(date, timezone) {
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            const parts = formatter.formatToParts(date);
            const year = parts.find(p => p.type === 'year').value;
            const month = parts.find(p => p.type === 'month').value;
            const day = parts.find(p => p.type === 'day').value;
            const hour = parts.find(p => p.type === 'hour').value;
            const minute = parts.find(p => p.type === 'minute').value;

            return `${year}-${month}-${day}T${hour}:${minute}`;
        } catch (e) {
            console.error('Timezone formatting error:', e);
            // Fallback to ISO string
            return date.toISOString().slice(0, 16);
        }
    },

    adjustTime(hours) {
        this.currentTime = new Date(this.currentTime.getTime() + hours * 60 * 60 * 1000);
        this.updateTimeInput();
        this.update();
    },

    adjustTimeByMonths(months) {
        const newDate = new Date(this.currentTime);
        const originalDay = newDate.getDate();
        const originalMonth = newDate.getMonth();
        const originalYear = newDate.getFullYear();

        // Calculate new month and year
        const newMonth = originalMonth + months;
        newDate.setMonth(newMonth);

        // Check if the day got adjusted (e.g., Jan 31 -> Feb 31 becomes Mar 3)
        // If so, we need to set it to the last day of the target month
        if (newDate.getDate() !== originalDay) {
            // Set to last day of the target month by going to day 0 of next month
            newDate.setDate(0);
        }

        this.currentTime = newDate;
        this.updateTimeInput();
        this.update();
    },

    panView(degrees) {
        this.viewAzimuth = ((this.viewAzimuth + degrees) % 360 + 360) % 360;
        this.updateViewAzimuthDisplay();
        this.update();
    },

    resetView() {
        this.viewAzimuth = 180; // South
        this.updateViewAzimuthDisplay();
        this.update();
    },

    updateViewAzimuthDisplay() {
        document.getElementById('view-azimuth').textContent = Math.round(this.viewAzimuth) + '°';
        const direction = Astronomy.getDirectionName(this.viewAzimuth);
        document.getElementById('current-view').textContent = direction;
    },

    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        const btn = document.getElementById('animate-btn');

        if (this.isAnimating) {
            btn.textContent = 'Stop Animation';
            btn.style.background = 'linear-gradient(to bottom, #ff4444, #cc0000)';
            this.startAnimation();
        } else {
            btn.textContent = 'Start Animation';
            btn.style.background = 'linear-gradient(to bottom, #4a5568, #2d3748)';
            this.stopAnimation();
        }
    },

    startAnimation() {
        this.animationInterval = setInterval(() => {
            const speed = parseInt(document.getElementById('speed').value) || 60;
            this.currentTime = new Date(this.currentTime.getTime() + speed * 60 * 1000);
            this.updateTimeInput();
            this.update();
        }, 40);
    },

    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    },

    getLocation() {
        const lat = parseFloat(document.getElementById('latitude').value);
        const lng = parseFloat(document.getElementById('longitude').value);
        return { lat, lng };
    },

    update() {
        const { lat, lng } = this.getLocation();

        // Calculate sun and moon positions
        const sunPos = Astronomy.getSunPosition(this.currentTime, lat, lng);
        const moonPos = Astronomy.getMoonPosition(this.currentTime, lat, lng);
        const moonIllum = Astronomy.getMoonIllumination(this.currentTime);

        // Update time display
        this.updateLocalTimeDisplay();

        // Update info display
        this.updateInfo(sunPos, moonPos, moonIllum);

        // Render the sky
        this.render(sunPos, moonPos, moonIllum);
    },

    updateLocalTimeDisplay() {
        const timezone = document.getElementById('timezone').value;
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            const timeStr = formatter.format(this.currentTime);
            document.getElementById('local-time-display').textContent = timeStr;
        } catch (e) {
            console.error('Error formatting local time:', e);
            document.getElementById('local-time-display').textContent = this.currentTime.toLocaleString();
        }
    },

    updateInfo(sunPos, moonPos, moonIllum) {
        document.getElementById('sun-azimuth').textContent =
            `${Math.round(sunPos.azimuth)}° (${Astronomy.getDirectionName(sunPos.azimuth)})`;
        document.getElementById('sun-altitude').textContent =
            `${Math.round(sunPos.altitude)}°`;
        document.getElementById('moon-azimuth').textContent =
            `${Math.round(moonPos.azimuth)}° (${Astronomy.getDirectionName(moonPos.azimuth)})`;
        document.getElementById('moon-altitude').textContent =
            `${Math.round(moonPos.altitude)}°`;
        document.getElementById('moon-phase').textContent =
            `${Astronomy.getMoonPhaseName(moonIllum.phase)} (${Math.round(moonIllum.fraction * 100)}%)`;

        // Update date/time in info display
        const timezone = document.getElementById('timezone').value;
        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            document.getElementById('info-datetime').textContent = formatter.format(this.currentTime);
        } catch (e) {
            document.getElementById('info-datetime').textContent = this.currentTime.toLocaleString();
        }
    },

    render(sunPos, moonPos, moonIllum) {
        const ctx = this.ctx;
        const width = this.canvasWidth;
        const height = this.canvasHeight;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Determine sky color based on sun altitude
        this.drawSky(ctx, width, height, sunPos.altitude);

        // Draw horizon line
        this.drawHorizon(ctx, width, height);

        // Draw compass directions
        this.drawCompass(ctx, width, height);

        // Draw grid
        this.drawGrid(ctx, width, height);

        // Draw sun (now shows full 360 degrees)
        if (sunPos.altitude > -5) {
            this.drawSun(ctx, width, height, sunPos);
        }

        // Draw moon (now shows full 360 degrees)
        if (moonPos.altitude > -5) {
            this.drawMoon(ctx, width, height, moonPos, moonIllum, sunPos);
        }

        // Labels removed for cleaner display
    },

    drawSky(ctx, width, height, sunAltitude) {
        // Create gradient based on sun altitude
        let skyGradient;
        const horizonY = height * 0.85; // Moved down to show more sky

        if (sunAltitude > 0) {
            // Daytime - blue sky
            const brightness = Math.min(sunAltitude / 30, 1);
            skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
            skyGradient.addColorStop(0, `rgb(${10 + brightness * 125}, ${50 + brightness * 150}, ${100 + brightness * 155})`);
            skyGradient.addColorStop(1, `rgb(${100 + brightness * 135}, ${150 + brightness * 105}, ${200 + brightness * 55})`);
        } else if (sunAltitude > -6) {
            // Twilight
            const twilight = (sunAltitude + 6) / 6;
            skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
            skyGradient.addColorStop(0, `rgb(${10 + twilight * 40}, ${30 + twilight * 80}, ${60 + twilight * 140})`);
            skyGradient.addColorStop(1, `rgb(${80 + twilight * 120}, ${50 + twilight * 150}, ${30 + twilight * 170})`);
        } else {
            // Night - dark sky
            skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
            skyGradient.addColorStop(0, 'rgb(0, 4, 40)');
            skyGradient.addColorStop(1, 'rgb(0, 20, 60)');
        }

        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, horizonY);

        // Ground
        const groundGradient = ctx.createLinearGradient(0, horizonY, 0, height);
        groundGradient.addColorStop(0, 'rgb(50, 40, 30)');
        groundGradient.addColorStop(1, 'rgb(20, 15, 10)');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, horizonY, width, height - horizonY);
    },

    drawHorizon(ctx, width, height) {
        const horizonY = height * 0.85;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width, horizonY);
        ctx.stroke();
    },

    drawCompass(ctx, width, height) {
        const horizonY = height * 0.85;
        const directions = [
            { angle: 0, label: 'N' },
            { angle: 45, label: 'NE' },
            { angle: 90, label: 'E' },
            { angle: 135, label: 'SE' },
            { angle: 180, label: 'S' },
            { angle: 225, label: 'SW' },
            { angle: 270, label: 'W' },
            { angle: 315, label: 'NW' }
        ];

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';

        directions.forEach(dir => {
            const x = this.azimuthToX(dir.angle, width);
            ctx.fillText(dir.label, x, horizonY + 20);
        });
    },

    drawGrid(ctx, width, height) {
        const horizonY = height * 0.85;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Vertical lines (azimuth)
        for (let az = 0; az < 360; az += 15) {
            if (this.isInView(az)) {
                const x = this.azimuthToX(az, width);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }

        // Horizontal lines (altitude)
        for (let alt = 0; alt <= 90; alt += 15) {
            const y = this.altitudeToY(alt, horizonY);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    },

    drawSun(ctx, width, height, sunPos) {
        const horizonY = height * 0.85;
        const x = this.azimuthToX(sunPos.azimuth, width);
        const y = this.altitudeToY(sunPos.altitude, horizonY);

        // Sun glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
        gradient.addColorStop(0, 'rgba(255, 255, 150, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 230, 100, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 40, y - 40, 80, 80);

        // Sun disk
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Sun rays
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(angle) * 25, y + Math.sin(angle) * 25);
            ctx.lineTo(x + Math.cos(angle) * 35, y + Math.sin(angle) * 35);
            ctx.stroke();
        }
    },

    drawMoon(ctx, width, height, moonPos, moonIllum, sunPos) {
        const horizonY = height * 0.85;
        const x = this.azimuthToX(moonPos.azimuth, width);
        const y = this.altitudeToY(moonPos.altitude, horizonY);

        // Use the parallactic angle from SunCalc, which represents the angle of the
        // moon's bright limb from the north point of the disk. Convert to radians and
        // adjust for our canvas coordinate system (rotate by 90° and negate for Y-axis flip)
        const angleToSun = -(moonIllum.angle + 90) * (Math.PI / 180);

        // Moon glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
        gradient.addColorStop(0, 'rgba(220, 220, 255, 0.6)');
        gradient.addColorStop(0.4, 'rgba(200, 200, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(180, 180, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 30, y - 30, 60, 60);

        // Moon disk
        ctx.fillStyle = '#E0E0E0';
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();

        // Moon phase shadow
        if (moonIllum.fraction < 0.99) {
            ctx.fillStyle = 'rgba(0, 0, 50, 0.7)';
            ctx.beginPath();

            if (moonIllum.phase < 0.5) {
                // Waxing - shadow on left (relative to sun direction)
                ctx.arc(x, y, 15, angleToSun + Math.PI / 2, angleToSun - Math.PI / 2, false);
                if (moonIllum.fraction <= 0.5) {
                    // Crescent: ellipse curves toward illuminated side (right)
                    const ellipseWidth = 15 * (1 - moonIllum.fraction * 2);
                    ctx.ellipse(x, y, ellipseWidth, 15, angleToSun, -Math.PI / 2, Math.PI / 2, false);
                } else {
                    // Gibbous: ellipse curves toward shadow side (left)
                    const ellipseWidth = 15 * (moonIllum.fraction * 2 - 1);
                    ctx.ellipse(x, y, ellipseWidth, 15, angleToSun, -Math.PI / 2, Math.PI / 2, true);
                }
            } else {
                // Waning - shadow on right (relative to sun direction)
                ctx.arc(x, y, 15, angleToSun - Math.PI / 2, angleToSun + Math.PI / 2, false);
                if (moonIllum.fraction <= 0.5) {
                    // Crescent: ellipse curves toward illuminated side (left)
                    const ellipseWidth = 15 * (1 - moonIllum.fraction * 2);
                    ctx.ellipse(x, y, ellipseWidth, 15, angleToSun, Math.PI / 2, -Math.PI / 2, false);
                } else {
                    // Gibbous: ellipse curves toward shadow side (right)
                    const ellipseWidth = 15 * (moonIllum.fraction * 2 - 1);
                    ctx.ellipse(x, y, ellipseWidth, 15, angleToSun, Math.PI / 2, -Math.PI / 2, true);
                }
            }
            ctx.fill();
        }
    },

    drawLabels(ctx, width, height, sunPos, moonPos) {
        const horizonY = height * 0.6;

        // Sun label
        if (this.isInView(sunPos.azimuth) && sunPos.altitude > -5) {
            const x = this.azimuthToX(sunPos.azimuth, width);
            const y = this.altitudeToY(sunPos.altitude, horizonY);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x - 30, y + 25, 60, 20);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SUN', x, y + 39);
        }

        // Moon label
        if (this.isInView(moonPos.azimuth) && moonPos.altitude > -5) {
            const x = this.azimuthToX(moonPos.azimuth, width);
            const y = this.altitudeToY(moonPos.altitude, horizonY);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x - 30, y + 25, 60, 20);
            ctx.fillStyle = '#E0E0E0';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('MOON', x, y + 39);
        }
    },

    isInView(azimuth) {
        // Now showing full 360 degrees - everything is in view
        return true;
    },

    azimuthToX(azimuth, width) {
        // Map azimuth relative to view center to x position
        let relativeAz = azimuth - this.viewAzimuth;
        if (relativeAz > 180) relativeAz -= 360;
        if (relativeAz < -180) relativeAz += 360;

        // Map -180 to 180 degrees to 0 to width (full 360 degree view)
        return width / 2 + (relativeAz / 360) * width;
    },

    altitudeToY(altitude, horizonY) {
        // Map altitude (0-90 degrees) to y position (horizonY to 0)
        return horizonY - (altitude / 90) * horizonY;
    }
};

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}
