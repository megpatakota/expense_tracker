/**
 * Playful Wave Animation
 * A fun, flowing background effect with pastel colors
 * Integrated with site-style-config.js for color harmony
 */

document.addEventListener('DOMContentLoaded', () => {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'background-animation';
    
    // Set styles for canvas
    Object.assign(canvas.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: '0.95' // More visible for fun effect
    });
    
    // Insert canvas as the first child of body
    document.body.insertBefore(canvas, document.body.firstChild);
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const resizeCanvas = () => {
        const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        ctx.scale(pixelRatio, pixelRatio);
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Get colors from Tailwind config - simplified to 4 colors
    const getAnimationColors = () => {
        // Default playful colors if config not available
        const defaultColors = [
            { r: 245, g: 198, b: 222, a: 0.7 }, // Pink
            { r: 194, g: 227, b: 247, a: 0.7 }, // Blue
            { r: 224, g: 197, b: 247, a: 0.7 }, // Purple
            { r: 186, g: 231, b: 192, a: 0.7 }  // Mint
        ];
        
        try {
            // Check if Tailwind config exists
            if (!window.tailwind || !window.tailwind.config || !window.tailwind.config.theme) {
                return defaultColors;
            }
            
            const colors = window.tailwind.config.theme.extend.colors;
            
            if (!colors.animation) {
                return defaultColors;
            }
            
            const paletteColors = [];
            
            // Convert hex to RGB
            const hexToRgb = (hex) => {
                hex = hex.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                return { r, g, b };
            };
            
            // Extract the 4 colors from animation section
            Object.keys(colors.animation).forEach(key => {
                if (colors.animation[key].startsWith('#')) {
                    const { r, g, b } = hexToRgb(colors.animation[key]);
                    // Slightly higher opacity for more fun appearance
                    paletteColors.push({ r, g, b, a: 0.65 + Math.random() * 0.15 });
                }
            });
            
            return paletteColors.length > 0 ? paletteColors : defaultColors;
        } catch (error) {
            console.log('Error extracting colors:', error);
            return defaultColors;
        }
    };
    
    // Configuration - more playful settings
    const config = {
        particleCount: 100,         // Good number for balance
        trailLength: 18,            // Longer trails for fun effect
        waveAmplitude: 1.2,         // Higher amplitude for more playful motion
        waveFrequency: 0.018,       // Slightly higher frequency
        waveSpeed: 0.0003,          // Same speed for nice flow
        cursorInfluence: 180,       // Larger influence radius
        cursorStrength: 0.8,        // Stronger cursor effect for fun interaction
        speedRange: { min: 0.3, max: 0.9 }, // Balanced speed
        colorPalette: getAnimationColors(),
        // Wave motion parameters
        waveMotion: {
            layers: 2,              // Fewer layers for cleaner look
            phaseShift: 0.6,        // More pronounced phase shift
            verticalFactor: 2.8     // Higher vertical stretching for playful waves
        }
    };
    
    // Cursor tracking
    const cursor = {
        x: null,
        y: null,
        prevX: null,
        prevY: null,
        active: false,
        speed: 0
    };
    
    // Update cursor
    const updateCursor = (e) => {
        cursor.prevX = cursor.x;
        cursor.prevY = cursor.y;
        
        if (e.touches) {
            cursor.x = e.touches[0].clientX;
            cursor.y = e.touches[0].clientY;
        } else {
            cursor.x = e.clientX;
            cursor.y = e.clientY;
        }
        
        if (cursor.prevX && cursor.prevY) {
            const dx = cursor.x - cursor.prevX;
            const dy = cursor.y - cursor.prevY;
            cursor.speed = Math.sqrt(dx*dx + dy*dy);
        }
        
        cursor.active = true;
        
        clearTimeout(cursor.timeout);
        cursor.timeout = setTimeout(() => {
            cursor.active = false;
            cursor.speed = 0;
        }, 1500);
    };
    
    // Event listeners
    window.addEventListener('mousemove', updateCursor, { passive: true });
    window.addEventListener('touchmove', updateCursor, { passive: true });
    
    // Only create bursts on click (not on page load)
    window.addEventListener('click', (e) => {
        createBurst(e.clientX, e.clientY);
    });
    
    // Touch support for bursts
    window.addEventListener('touchend', (e) => {
        if (e.touches.length === 0 && e.changedTouches.length > 0) {
            createBurst(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
    });
    
    // Generate wave pattern
    const waveGrid = [];
    const gridSize = 30;
    const rows = Math.ceil(window.innerHeight / gridSize) + 1;
    const cols = Math.ceil(window.innerWidth / gridSize) + 1;
    
    // Initialize wave grid
    const initWaveGrid = () => {
        for (let y = 0; y < rows; y++) {
            waveGrid[y] = [];
            for (let x = 0; x < cols; x++) {
                waveGrid[y][x] = {
                    x: x * gridSize,
                    y: y * gridSize,
                    offset: Math.random() * Math.PI * 2
                };
            }
        }
    };
    
    initWaveGrid();
    window.addEventListener('resize', initWaveGrid);
    
    // Get flow angle - more playful wave pattern
    const getWaveFlowAngle = (x, y, time) => {
        const gridX = Math.floor(x / gridSize);
        const gridY = Math.floor(y / gridSize);
        
        const safeX = Math.min(Math.max(0, gridX), cols - 1);
        const safeY = Math.min(Math.max(0, gridY), rows - 1);
        
        let angle = 0;
        
        for (let layer = 0; layer < config.waveMotion.layers; layer++) {
            const frequency = config.waveFrequency * (1 + layer * 0.3); // More varied frequencies
            const phaseOffset = layer * config.waveMotion.phaseShift;
            
            // More playful horizontal wave
            const horizontalWave = Math.sin(
                (y * frequency) + 
                (time * config.waveSpeed * (1 + layer * 0.15)) + 
                waveGrid[safeY][safeX].offset + 
                phaseOffset
            ) * config.waveAmplitude;
            
            // More playful vertical wave
            const verticalWave = Math.cos(
                (x * frequency * 0.65) + 
                (time * config.waveSpeed * (1 - layer * 0.08)) + 
                waveGrid[safeY][safeX].offset + 
                phaseOffset + 1.5
            ) * config.waveAmplitude * config.waveMotion.verticalFactor;
            
            const layerAngle = Math.atan2(verticalWave, horizontalWave);
            const layerWeight = 1 / (layer + 1);
            angle += layerAngle * layerWeight;
        }
        
        angle /= config.waveMotion.layers * 0.6; // Less normalization for more varied angles
        
        return angle;
    };
    
    // Create a burst of particles - modified for sharper burst effect
    const burstParticles = [];
    function createBurst(x, y) {
        const burstSize = 14 + Math.floor(Math.random() * 8);
        
        for (let i = 0; i < burstSize; i++) {
            // Create sharper burst pattern with more consistent distribution
            const angle = (i / burstSize) * Math.PI * 2 + Math.random() * 0.3; // Less randomness for sharper shape
            const speed = 0.8 + Math.random() * 1.2; // Slightly more consistent speed
            const size = 2.5 + Math.random() * 3; // Slightly smaller for sharper look
            const life = 45 + Math.random() * 40; // Slightly shorter life
            
            burstParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                life: life,
                maxLife: life,
                // Reduced wave parameters for less wobbly motion
                waveParams: {
                    amplitude: 0.02 + Math.random() * 0.04, // Less amplitude for sharper movement
                    frequency: 0.1 + Math.random() * 0.1,
                    phase: Math.random() * Math.PI * 2
                },
                // Pick one of the 4 colors
                color: config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)]
            });
        }
    }
    
    // Update and draw burst particles
    function updateBurstParticles(time) {
        for (let i = burstParticles.length - 1; i >= 0; i--) {
            const p = burstParticles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            
            // Add slight wave motion - reduced for sharper appearance
            const waveX = Math.sin(time * 0.001 + p.waveParams.phase) * p.waveParams.amplitude * 2;
            const waveY = Math.cos(time * 0.001 + p.waveParams.phase + 1.3) * p.waveParams.amplitude;
            
            p.x += waveX;
            p.y += waveY;
            
            // Slightly slower deceleration for more directed motion
            p.vx *= 0.985;
            p.vy *= 0.985;
            
            p.life--;
            
            // Draw with crisp glow effect
            const alpha = (p.life / p.maxLife) * p.color.a;
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add sharper glow - smaller glow radius
            const glowAlpha = alpha * 0.7; // Higher alpha for more defined glow
            const glowSize = p.size * 1.8; // Smaller multiplier for tighter glow (was 2.2)
            const gradient = ctx.createRadialGradient(p.x, p.y, p.size * 0.5, p.x, p.y, glowSize);
            gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${glowAlpha})`);
            gradient.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
            
            if (p.life <= 0) {
                burstParticles.splice(i, 1);
            }
        }
    }
    
    // Flow particle with trail - more playful ribbon-like appearance
    class FlowParticle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.size = 1.5 + Math.random() * 2.5; // Slightly larger for visibility
            this.speed = config.speedRange.min + Math.random() * (config.speedRange.max - config.speedRange.min);
            // Use one of the 4 colors
            this.color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
            
            // Trail for ribbon-like appearance
            this.trail = [];
            for (let i = 0; i < config.trailLength; i++) {
                this.trail.push({x: this.x, y: this.y});
            }
            
            // Individual wave parameters
            this.waveParams = {
                amplitude: 0.08 + Math.random() * 0.2, // More varied motion
                frequency: 0.02 + Math.random() * 0.04,
                phase: Math.random() * Math.PI * 2
            };
        }
        
        update(time) {
            let angle = getWaveFlowAngle(this.x, this.y, time);
            
            // Apply fun cursor interaction
            if (cursor.active && cursor.x) {
                const dx = this.x - cursor.x;
                const dy = this.y - cursor.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.cursorInfluence) {
                    // Create a more playful spiral effect
                    const cursorAngle = Math.atan2(dy, dx) + Math.PI/2;
                    
                    const influence = (1 - distance / config.cursorInfluence) * 
                                     config.cursorStrength * 
                                     (1 + Math.min(cursor.speed, 15) / 15);
                    
                    angle = angle * (1 - influence) + cursorAngle * influence;
                    
                    // More speed boost for playful interaction
                    this.speed += influence * 0.35;
                }
            }
            
            // Add more playful individual wave motion
            angle += Math.sin(time * 0.001 + this.waveParams.phase) * this.waveParams.amplitude;
            
            // Update position
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
            
            // Return speed to normal
            this.speed = this.speed * 0.98 + 
                        (config.speedRange.min + Math.random() * 
                        (config.speedRange.max - config.speedRange.min)) * 0.02;
            
            // Update trail
            this.trail.pop();
            this.trail.unshift({x: this.x, y: this.y});
            
            // Reset if off-screen
            if (this.x < -50 || this.x > window.innerWidth + 50 || 
                this.y < -50 || this.y > window.innerHeight + 50) {
                this.reset();
            }
        }
        
        draw() {
            if (this.trail.length > 1) {
                // Create playful ribbon effect
                ctx.beginPath();
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                
                // Use curves for smoother appearance
                for (let i = 1; i < this.trail.length - 2; i++) {
                    const xc = (this.trail[i].x + this.trail[i+1].x) / 2;
                    const yc = (this.trail[i].y + this.trail[i+1].y) / 2;
                    
                    ctx.quadraticCurveTo(
                        this.trail[i].x, 
                        this.trail[i].y, 
                        xc, 
                        yc
                    );
                }
                
                // Handle the last curve segment
                const lastIndex = this.trail.length - 2;
                ctx.quadraticCurveTo(
                    this.trail[lastIndex].x,
                    this.trail[lastIndex].y,
                    this.trail[lastIndex + 1].x,
                    this.trail[lastIndex + 1].y
                );
                
                // Create gradient effect
                const gradient = ctx.createLinearGradient(
                    this.trail[0].x, this.trail[0].y,
                    this.trail[this.trail.length-1].x, this.trail[this.trail.length-1].y
                );
                
                gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`);
                gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = this.size;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            }
        }
    }
    
    // Create particles
    const particles = Array.from({ length: config.particleCount }, () => new FlowParticle());
    let time = 0;
    
    // Animation loop
    function animate() {
        // Clear with slight fade for visible trails
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'; // Very light fade for longer trails
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update(time);
            particle.draw();
        });
        
        // Update and draw burst particles
        updateBurstParticles(time);
        
        // Slower time increment for half speed
        time += 0.5;
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // No automatic bursts on page load (removed the initial burst effects)
});