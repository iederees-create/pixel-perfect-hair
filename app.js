/* ==========================================
   Pixel Perfect Hair Studio - Pro Max Engine
   Interactive 3D Simulation, Particles & Quiz
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  init3DTiltEffect();
  initAmbientParticles();
  const lab = init3DStylingLab();
  initAIDiagnosticQuiz(lab);
  initAIChatbot();
  initHairTracker();
  initStylistSelector();
});

// Shared state for booking flow
const globalBookingState = {
  stylist: '',
  service: '',
  price: '',
  diagnosticRecommended: false
};

/* ==========================================
   Theme Switcher & Mobile Menu
   ========================================== */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  if (toggle) {
    toggle.checked = savedTheme === 'dark';
    toggle.addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      const label = document.querySelector('.theme-switch-label');
      if (label) {
        label.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
      }
    });
  }
}

function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active');
      mobileNav.classList.toggle('active');
      const bars = toggleBtn.querySelectorAll('.bar');
      if (toggleBtn.classList.contains('active')) {
        bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
      } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
      }
    });

    mobileNav.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        toggleBtn.classList.remove('active');
        mobileNav.classList.remove('active');
        toggleBtn.querySelectorAll('.bar').forEach(bar => bar.style.transform = 'none');
        toggleBtn.querySelectorAll('.bar')[1].style.opacity = '1';
      });
    });
  }
}

/* ==========================================
   3D Tilt Card Effects
   ========================================== */
function init3DTiltEffect() {
  const cards = document.querySelectorAll('.tilt-effect');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((centerY - y) / centerY) * 12;
      const rotateY = ((x - centerX) / centerX) * 12;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================
   Ambient Particle Background
   ========================================== */
function initAmbientParticles() {
  const canvas = document.getElementById('bg-particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  const mouse = { x: null, y: null, radius: 120 };

  window.addEventListener('resize', () => {
    width = (canvas.width = window.innerWidth);
    height = (canvas.height = window.innerHeight);
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 1;
      this.baseX = this.x;
      this.baseY = this.y;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = Math.random() * 0.4 - 0.2;
      this.alpha = Math.random() * 0.4 + 0.15;
    }

    update() {
      // Passive drift
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around bounds
      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;

      // Mouse repulsion
      if (mouse.x !== null && mouse.y !== null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          let angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 2;
          this.y += Math.sin(angle) * force * 2;
        }
      }
    }

    draw() {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = isDark 
        ? `rgba(212, 163, 115, ${this.alpha})` 
        : `rgba(200, 90, 60, ${this.alpha * 0.7})`;
      ctx.fill();
    }
  }

  function setup() {
    particles = [];
    const count = Math.min(100, Math.floor((width * height) / 18000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loop);
  }

  setup();
  loop();
}

/* ==========================================
   3D Styling Lab Engine
   ========================================== */
function init3DStylingLab() {
  const canvas = document.getElementById('hair-canvas');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const canvasWrapper = canvas.parentElement;
  
  // Controls & UI
  const styleSelect = document.getElementById('hair-style');
  const lengthSlider = document.getElementById('hair-length');
  const colorSlider = document.getElementById('hair-color');
  const windSlider = document.getElementById('wind-speed');
  const bioOverlayCheckbox = document.getElementById('biometric-overlay');
  const resetBtn = document.getElementById('reset-hair-btn');
  const scannerBeam = document.getElementById('scanner-beam');
  
  const lengthVal = document.getElementById('hair-length-val');
  const colorVal = document.getElementById('hair-color-val');
  const windVal = document.getElementById('wind-speed-val');
  const colorVectorText = document.getElementById('color-vector-desc');
  const telemetryStrands = document.getElementById('telemetry-strands');
  const fpsTelemetry = document.getElementById('rendering-telemetry');
  const modeTelemetry = document.getElementById('telemetry-mode');

  // Interactive Tools selection
  let currentTool = 'rotate'; // rotate, scissor, comb
  const toolRotate = document.getElementById('tool-rotate');
  const toolScissor = document.getElementById('tool-scissor');
  const toolComb = document.getElementById('tool-comb');

  function setTool(tool) {
    currentTool = tool;
    // Update active classes
    [toolRotate, toolScissor, toolComb].forEach(btn => btn?.classList.remove('active'));
    canvasWrapper.className = 'canvas-wrapper';
    
    if (tool === 'rotate') {
      toolRotate?.classList.add('active');
      if (modeTelemetry) modeTelemetry.textContent = 'Camera Rotate';
      const helper = document.getElementById('viewport-helper');
      if (helper) helper.textContent = 'Click & Drag to Rotate Model';
    } else if (tool === 'scissor') {
      toolScissor?.classList.add('active');
      canvasWrapper.classList.add('cursor-scissor');
      if (modeTelemetry) modeTelemetry.textContent = 'Interactive Cut';
      const helper = document.getElementById('viewport-helper');
      if (helper) helper.textContent = 'Click & Drag over Hair to Trim';
    } else if (tool === 'comb') {
      toolComb?.classList.add('active');
      canvasWrapper.classList.add('cursor-comb');
      if (modeTelemetry) modeTelemetry.textContent = 'Interactive Style';
      const helper = document.getElementById('viewport-helper');
      if (helper) helper.textContent = 'Click & Drag to Brush Strands';
    }
  }

  [
    { btn: toolRotate, type: 'rotate' },
    { btn: toolScissor, type: 'scissor' },
    { btn: toolComb, type: 'comb' }
  ].forEach(item => {
    item.btn?.addEventListener('click', () => setTool(item.type));
  });

  // Projection math vars
  let yaw = 0.5;
  let pitch = 0.2;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let spinVelocityX = 0.005;
  let spinVelocityY = 0;

  const scale = 140;
  const distance = 4;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 - 20;

  // Generate biometric face vertices
  const headVertices = [];
  const headLines = [];

  for (let lat = 0; lat < 12; lat++) {
    const theta = (lat * Math.PI) / 12;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const y = cosTheta * 1.1;
    
    const circleStartIndex = headVertices.length;
    for (let lon = 0; lon < 16; lon++) {
      const phi = (lon * 2 * Math.PI) / 16;
      const x = sinTheta * Math.cos(phi) * 0.95;
      const z = sinTheta * Math.sin(phi) * 0.95;
      headVertices.push({ x, y, z });
      
      const curr = circleStartIndex + lon;
      const next = circleStartIndex + ((lon + 1) % 16);
      headLines.push([curr, next]);
      if (lat > 0) {
        headLines.push([curr, curr - 16]);
      }
    }
  }

  // Biometric extra details (nose bridge, eyes, symmetry lines)
  const faceDetails = [
    // Left eye circle
    [{ x: -0.25, y: 0.15, z: 0.8 }, { x: -0.35, y: 0.2, z: 0.75 }, { x: -0.4, y: 0.15, z: 0.75 }, { x: -0.3, y: 0.1, z: 0.8 }, { x: -0.25, y: 0.15, z: 0.8 }],
    // Right eye circle
    [{ x: 0.25, y: 0.15, z: 0.8 }, { x: 0.35, y: 0.2, z: 0.75 }, { x: 0.4, y: 0.15, z: 0.75 }, { x: 0.3, y: 0.1, z: 0.8 }, { x: 0.25, y: 0.15, z: 0.8 }],
    // Nose bridge
    [{ x: 0, y: 0.25, z: 0.85 }, { x: 0, y: -0.1, z: 0.95 }, { x: -0.1, y: -0.15, z: 0.9 }, { x: 0.1, y: -0.15, z: 0.9 }, { x: 0, y: -0.1, z: 0.95 }],
    // Mouth contour
    [{ x: -0.2, y: -0.4, z: 0.85 }, { x: 0, y: -0.35, z: 0.9 }, { x: 0.2, y: -0.4, z: 0.85 }, { x: 0, y: -0.45, z: 0.9 }, { x: -0.2, y: -0.4, z: 0.85 }]
  ];

  // Initialize hair roots
  const hairRoots = [];
  for (let lat = 1; lat < 6; lat++) {
    const theta = (lat * Math.PI) / 12;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const y = cosTheta * 1.15;

    for (let lon = 0; lon < 24; lon++) {
      const phi = (lon * 2 * Math.PI) / 24;
      const x = sinTheta * Math.cos(phi) * 1.0;
      const z = sinTheta * Math.sin(phi) * 1.0;
      
      const angle = Math.atan2(z, x);
      if (angle > -0.7 && angle < 0.7) continue; // Face area cutout
      
      hairRoots.push({ x, y, z });
    }
  }

  // Dynamic state for each hair strand
  let hairStrands = [];
  function generateHairData() {
    hairStrands = hairRoots.map((root, index) => {
      return {
        root: { ...root },
        maxSteps: 12,
        combOffset: { x: 0, y: 0, z: 0 },
        index: index
      };
    });
    if (telemetryStrands) telemetryStrands.textContent = hairStrands.length;
  }
  generateHairData();

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      generateHairData();
    });
  }

  // Mouse & tool drag events
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    lastMouseX = e.clientX - rect.left;
    lastMouseY = e.clientY - rect.top;
    spinVelocityX = 0;
    spinVelocityY = 0;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const deltaX = mouseX - lastMouseX;
    const deltaY = mouseY - lastMouseY;

    if (currentTool === 'rotate') {
      yaw += deltaX * 0.007;
      pitch += deltaY * 0.007;
      pitch = Math.max(-1.2, Math.min(1.2, pitch));
      spinVelocityX = deltaX * 0.0015;
      spinVelocityY = deltaY * 0.0015;
    } else if (currentTool === 'scissor') {
      // Scissors cut detection: find any projected hair node near mouse coordinates and trim it
      trimHairAtPoint(mouseX, mouseY);
    } else if (currentTool === 'comb') {
      // Comb offset displacement: push nearest hair nodes in drag direction
      combHairAtPoint(mouseX, mouseY, deltaX, deltaY);
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  });

  // Touch Support
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      const rect = canvas.getBoundingClientRect();
      lastMouseX = e.touches[0].clientX - rect.left;
      lastMouseY = e.touches[0].clientY - rect.top;
      spinVelocityX = 0;
      spinVelocityY = 0;
    }
  });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.touches[0].clientX - rect.left;
    const mouseY = e.touches[0].clientY - rect.top;
    const deltaX = mouseX - lastMouseX;
    const deltaY = mouseY - lastMouseY;

    if (currentTool === 'rotate') {
      yaw += deltaX * 0.007;
      pitch += deltaY * 0.007;
      pitch = Math.max(-1.2, Math.min(1.2, pitch));
      spinVelocityX = deltaX * 0.0015;
      spinVelocityY = deltaY * 0.0015;
    } else if (currentTool === 'scissor') {
      trimHairAtPoint(mouseX, mouseY);
    } else if (currentTool === 'comb') {
      combHairAtPoint(mouseX, mouseY, deltaX, deltaY);
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  });

  function rotate3D(point, yawAngle, pitchAngle) {
    const x1 = point.x * Math.cos(yawAngle) - point.z * Math.sin(yawAngle);
    const z1 = point.x * Math.sin(yawAngle) + point.z * Math.cos(yawAngle);
    const y2 = point.y * Math.cos(pitchAngle) - z1 * Math.sin(pitchAngle);
    const z2 = point.y * Math.sin(pitchAngle) + z1 * Math.cos(pitchAngle);
    return { x: x1, y: y2, z: z2 };
  }

  function project(point) {
    const rotated = rotate3D(point, yaw, pitch);
    const denom = rotated.z + distance;
    const screenX = centerX + (rotated.x * scale) / denom;
    const screenY = centerY - (rotated.y * scale) / denom;
    return { x: screenX, y: screenY, z: rotated.z };
  }

  // Scissor cut logic
  function trimHairAtPoint(mx, my) {
    const length = parseFloat(lengthSlider.value);
    const style = styleSelect.value;
    const steps = style === 'afro' ? 8 : 12;

    hairStrands.forEach((strand) => {
      // Loop nodes starting from roots to tips
      for (let step = 1; step <= strand.maxSteps; step++) {
        const segmentPct = step / steps;
        let dy = -length * 0.12 * segmentPct;
        if (style === 'afro') dy = -length * 0.04 * segmentPct;

        const node3D = {
          x: strand.root.x + strand.combOffset.x,
          y: strand.root.y + dy + strand.combOffset.y,
          z: strand.root.z + strand.combOffset.z
        };

        const proj = project(node3D);
        const dist = Math.sqrt((proj.x - mx) ** 2 + (proj.y - my) ** 2);
        
        // If cursor gets within 16px of a node, trim the strand from that step outwards
        if (dist < 16 && step < strand.maxSteps) {
          strand.maxSteps = Math.max(1, step - 1);
          break;
        }
      }
    });
  }

  // Combing push logic
  function combHairAtPoint(mx, my, dx, dy) {
    const length = parseFloat(lengthSlider.value);
    const style = styleSelect.value;
    const steps = style === 'afro' ? 8 : 12;

    hairStrands.forEach((strand) => {
      // Get the tip node position
      const segmentPct = strand.maxSteps / steps;
      let targetY = -length * 0.12 * segmentPct;
      if (style === 'afro') targetY = -length * 0.04 * segmentPct;

      const node3D = {
        x: strand.root.x + strand.combOffset.x,
        y: strand.root.y + targetY + strand.combOffset.y,
        z: strand.root.z + strand.combOffset.z
      };

      const proj = project(node3D);
      const dist = Math.sqrt((proj.x - mx) ** 2 + (proj.y - my) ** 2);
      
      // If tip is near mouse pointer, apply offset relative to drag speed
      if (dist < 32) {
        const factor = 0.003;
        strand.combOffset.x += dx * factor;
        strand.combOffset.y -= dy * factor; // Y is inverted in screen coords
      }
    });
  }

  // Animation Loop variables
  let time = 0;
  let lastTime = performance.now();
  let frames = 0;

  function draw() {
    time += 0.04;
    frames++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      if (fpsTelemetry) fpsTelemetry.textContent = `FPS: ${frames}`;
      frames = 0;
      lastTime = now;
    }

    // Passive spin
    if (!isDragging) {
      yaw += spinVelocityX;
      pitch += spinVelocityY;
      spinVelocityX *= 0.95;
      spinVelocityY *= 0.95;
      if (Math.abs(spinVelocityX) < 0.0001) {
        spinVelocityX = 0.0012; // slow passive scan spin
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const length = parseFloat(lengthSlider.value);
    const hue = parseInt(colorSlider.value);
    const style = styleSelect.value;
    const windSpeed = parseFloat(windSlider.value);
    const showBiometrics = bioOverlayCheckbox.checked;

    // Update text labels
    if (lengthVal) lengthVal.textContent = `${length.toFixed(1)} dm`;
    if (windVal) windVal.textContent = `${windSpeed.toFixed(1)} m/s`;
    
    if (colorVal) {
      let colorName = "Warm Copper";
      if (hue >= 320 || hue < 15) colorName = "Rose Gold";
      else if (hue >= 15 && hue < 45) colorName = "Golden Copper";
      else if (hue >= 45 && hue < 90) colorName = "Honey Blonde";
      else if (hue >= 90 && hue < 170) colorName = "Jade Mint";
      else if (hue >= 170 && hue < 250) colorName = "Ice Balayage";
      else if (hue >= 250 && hue < 320) colorName = "Ultra Violet";
      colorVal.textContent = `${hue}° (${colorName})`;
      if (colorVectorText) {
        colorVectorText.textContent = `HSL(${hue}°, 85%, 55%)`;
      }
    }

    // Scan beam toggle
    if (showBiometrics) {
      scannerBeam?.classList.add('scanning');
    } else {
      scannerBeam?.classList.remove('scanning');
    }

    // Draw main Face Wireframe
    ctx.beginPath();
    ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'light' 
      ? 'rgba(9, 8, 18, 0.06)' 
      : 'rgba(212, 163, 115, 0.06)';
    ctx.lineWidth = 1;
    
    headLines.forEach(([i, j]) => {
      const p1 = project(headVertices[i]);
      const p2 = project(headVertices[j]);
      if (p1.z > -0.8 && p2.z > -0.8) {
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
    });
    ctx.stroke();

    // Draw Biometric Scans (eye coordinates and alignment grids)
    if (showBiometrics) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.35)'; // Glow biometric green
      ctx.lineWidth = 1;

      faceDetails.forEach((shape) => {
        let first = true;
        shape.forEach((pt) => {
          const proj = project(pt);
          if (proj.z > -0.6) {
            if (first) {
              ctx.moveTo(proj.x, proj.y);
              first = false;
            } else {
              ctx.lineTo(proj.x, proj.y);
            }
          }
        });
      });
      ctx.stroke();

      // Symmetry vertical line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.15)';
      ctx.setLineDash([5, 5]);
      const topSym = project({ x: 0, y: 1.1, z: 0.9 });
      const botSym = project({ x: 0, y: -1.1, z: 0.9 });
      ctx.moveTo(topSym.x, topSym.y);
      ctx.lineTo(botSym.x, botSym.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Hair Strands
    const steps = style === 'afro' ? 8 : 12;
    hairStrands.forEach((strand) => {
      ctx.beginPath();
      ctx.lineWidth = style === 'afro' ? 2 : 1.25;

      let prevProj = project({
        x: strand.root.x + strand.combOffset.x,
        y: strand.root.y + strand.combOffset.y,
        z: strand.root.z + strand.combOffset.z
      });
      ctx.moveTo(prevProj.x, prevProj.y);

      for (let step = 1; step <= strand.maxSteps; step++) {
        const segmentPct = step / steps;
        
        let dx = 0;
        let dy = -length * 0.12 * segmentPct;
        let dz = 0;

        if (style === 'wavy') {
          dx = Math.sin(segmentPct * 6 + strand.root.x * 2) * 0.12;
          dz = Math.cos(segmentPct * 5 + strand.root.z * 2) * 0.12;
        } else if (style === 'curly') {
          dx = Math.sin(segmentPct * 16 + strand.root.x * 4) * 0.08;
          dz = Math.cos(segmentPct * 16 + strand.root.z * 4) * 0.08;
        } else if (style === 'afro') {
          dx = Math.sin(segmentPct * 35 + strand.root.x * 10) * 0.04;
          dy = -length * 0.04 * segmentPct + Math.cos(segmentPct * 35) * 0.04;
          dz = Math.cos(segmentPct * 35 + strand.root.z * 10) * 0.04;
        }

        // Apply wind physics
        if (windSpeed > 0) {
          const windOsc = Math.sin(time + strand.root.y * 3 + segmentPct * 2) * 0.04 * windSpeed;
          dx += windOsc * segmentPct;
          dz += Math.cos(time * 0.8 + strand.root.x * 2) * 0.03 * windSpeed * segmentPct;
        }

        const node3D = {
          x: strand.root.x + strand.combOffset.x + dx,
          y: strand.root.y + strand.combOffset.y + dy,
          z: strand.root.z + strand.combOffset.z + dz
        };

        const proj = project(node3D);

        const gradient = ctx.createLinearGradient(prevProj.x, prevProj.y, proj.x, proj.y);
        gradient.addColorStop(0, `hsla(${hue}, 85%, 38%, ${0.3 + 0.4 * (1 - segmentPct)})`);
        gradient.addColorStop(1, `hsla(${(hue + 12) % 360}, 95%, 68%, ${0.7 - 0.2 * segmentPct})`);

        ctx.strokeStyle = gradient;
        ctx.lineTo(proj.x, proj.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(proj.x, proj.y);
        prevProj = proj;
      }
    });

    requestAnimationFrame(draw);
  }

  // Trigger initial render
  draw();

  return {
    triggerBiometricScan: (callback) => {
      // Toggle biometrics checkbox
      bioOverlayCheckbox.checked = true;
      // Start scanning animation on scanline beam
      scannerBeam?.classList.add('scanning');
      // Spin quickly during scan
      spinVelocityX = 0.05;
      
      setTimeout(() => {
        spinVelocityX = 0.005;
        // Finished scanning callback
        if (callback) callback();
      }, 2500);
    },
    updateParameters: (stylePreset, lengthValNum, hueValNum) => {
      if (styleSelect) styleSelect.value = stylePreset;
      if (lengthSlider) lengthSlider.value = lengthValNum;
      if (colorSlider) colorSlider.value = hueValNum;
      generateHairData();
    }
  };
}

/* ==========================================
   Visual AI Diagnostic Quiz Section
   ========================================== */
function initAIDiagnosticQuiz(labEngine) {
  const steps = document.querySelectorAll('.quiz-step');
  const quizPrevBtn = document.getElementById('quiz-prev-btn');
  const quizNextBtn = document.getElementById('quiz-next-btn');
  const quizCardBox = document.getElementById('quiz-card-box');
  const quizResultsBox = document.getElementById('quiz-results-box');
  const restartQuizBtn = document.getElementById('restart-quiz-btn');
  const bookDiagnosticBtn = document.getElementById('book-diagnostic-btn');

  let currentStepIndex = 0;
  const selections = { texture: '', scalp: '', history: '' };

  // Setup click listeners on all option buttons
  document.querySelectorAll('.option-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentStep = btn.closest('.quiz-step');
      parentStep.querySelectorAll('.option-button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const stepNum = parentStep.getAttribute('data-step');
      const val = btn.getAttribute('data-value');

      if (stepNum === '1') selections.texture = val;
      if (stepNum === '2') selections.scalp = val;
      if (stepNum === '3') selections.history = val;

      quizNextBtn.removeAttribute('disabled');
    });
  });

  quizNextBtn.addEventListener('click', () => {
    if (currentStepIndex < steps.length - 1) {
      steps[currentStepIndex].classList.remove('active');
      currentStepIndex++;
      steps[currentStepIndex].classList.add('active');
      
      quizPrevBtn.style.display = 'inline-flex';
      
      // Check if next step already has a selection
      const nextStepSelections = steps[currentStepIndex].querySelectorAll('.option-button.selected');
      if (nextStepSelections.length > 0) {
        quizNextBtn.removeAttribute('disabled');
      } else {
        quizNextBtn.setAttribute('disabled', 'true');
      }

      if (currentStepIndex === steps.length - 1) {
        quizNextBtn.textContent = 'Generate Profile';
      }
    } else {
      // Completed last step! Trigger biometric scanner in styling lab
      quizCardBox.style.display = 'none';
      
      if (labEngine) {
        // Scroll slightly to lab viewport so user sees the biometrics scan
        document.getElementById('styling-lab').scrollIntoView({ behavior: 'smooth' });
        
        labEngine.triggerBiometricScan(() => {
          // Finished scan, render results dashboard
          document.getElementById('diagnostic-lab').scrollIntoView({ behavior: 'smooth' });
          renderDiagnosticReport();
        });
      } else {
        renderDiagnosticReport();
      }
    }
  });

  quizPrevBtn.addEventListener('click', () => {
    if (currentStepIndex > 0) {
      steps[currentStepIndex].classList.remove('active');
      currentStepIndex--;
      steps[currentStepIndex].classList.add('active');
      
      quizNextBtn.textContent = 'Next Question';
      quizNextBtn.removeAttribute('disabled');

      if (currentStepIndex === 0) {
        quizPrevBtn.style.display = 'none';
      }
    }
  });

  function renderDiagnosticReport() {
    let hydration = 70;
    let elasticity = 75;
    let porosity = 50;
    let recommendedStyle = 'Precision Collarbone Bob';
    let recommendedTreatment = 'Olaplex Rejuvenation Therapy';
    let cost = 1850;
    let preset = 'wavy';
    let length = 4.5;
    let hue = 330; // Rose Gold

    // Logic based on texture
    if (selections.texture === 'straight') {
      recommendedStyle = 'Dry-Cut Sculpted Bob';
      preset = 'straight';
      length = 3.5;
    } else if (selections.texture === 'wavy') {
      recommendedStyle = 'Textured Coastal Waves';
      preset = 'wavy';
      length = 5.2;
      hue = 30; // Golden Copper
    } else if (selections.texture === 'curly') {
      recommendedStyle = 'Volumetric Layered Shag';
      preset = 'curly';
      length = 6.0;
      hue = 48; // Honey Blonde
    } else if (selections.texture === 'coily') {
      recommendedStyle = 'Sculpted Halo Afro Coil';
      preset = 'afro';
      length = 4.0;
      hue = 20; // Copper
    }

    // Logic based on behavior
    if (selections.scalp === 'dry') {
      hydration = 45;
      elasticity = 55;
      recommendedTreatment = 'Micro-infusion Keratin Therapy';
      cost += 450;
    } else if (selections.scalp === 'normal') {
      hydration = 80;
      elasticity = 85;
      recommendedTreatment = 'Bio-organic Botanical Wash';
    } else if (selections.scalp === 'oily') {
      hydration = 60;
      elasticity = 75;
      recommendedTreatment = 'Root Purifying Clay Masque';
      cost += 200;
    }

    // Logic based on color history
    if (selections.history === 'virgin') {
      porosity = 25;
      elasticity = Math.min(100, elasticity + 10);
    } else if (selections.history === 'colored') {
      porosity = 55;
      cost += 300;
    } else if (selections.history === 'bleached') {
      porosity = 88;
      hydration = Math.max(20, hydration - 20);
      elasticity = Math.max(20, elasticity - 20);
      recommendedTreatment = 'Bond-Multiplying Molecular Infusion';
      cost += 600;
    }

    // Populate Report Card
    document.getElementById('report-silhouette').textContent = recommendedStyle;
    document.getElementById('report-treatment').textContent = recommendedTreatment;
    document.getElementById('report-price').textContent = `R ${cost}`;
    
    // Store variables globally for scheduling hooks
    globalBookingState.service = `${recommendedStyle} & ${recommendedTreatment}`;
    globalBookingState.price = `R ${cost}`;
    globalBookingState.diagnosticRecommended = true;

    quizResultsBox.style.display = 'block';

    // Animate circular SVG gauges
    setTimeout(() => {
      animateRadialGauge('gauge-hydration', hydration);
      animateRadialGauge('gauge-elasticity', elasticity);
      animateRadialGauge('gauge-porosity', porosity);
    }, 150);

    // Sync parameters back to 3D Canvas Styling Lab
    if (labEngine) {
      labEngine.updateParameters(preset, length, hue);
    }
  }

  function animateRadialGauge(id, val) {
    const fill = document.getElementById(`${id}-fill`);
    const valText = document.getElementById(`${id}-val`);
    if (fill && valText) {
      // Dasharray represents percentage value (circumference is 100)
      fill.setAttribute('stroke-dasharray', `${val}, 100`);
      valText.textContent = `${val}%`;
    }
  }

  // Restart Quiz resetter
  restartQuizBtn.addEventListener('click', () => {
    quizResultsBox.style.display = 'none';
    currentStepIndex = 0;
    steps.forEach(s => s.classList.remove('active'));
    steps[0].classList.add('active');
    
    document.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('selected'));
    
    quizPrevBtn.style.display = 'none';
    quizNextBtn.textContent = 'Next Question';
    quizNextBtn.setAttribute('disabled', 'true');
    quizCardBox.style.display = 'block';
  });

  // Pre-Book Service action button
  bookDiagnosticBtn.addEventListener('click', () => {
    const chatDrawer = document.getElementById('chat-drawer');
    const badge = document.getElementById('chat-notification');
    if (chatDrawer) {
      chatDrawer.classList.add('open');
      if (badge) badge.style.display = 'none';
      
      // Inject consultation pre-populated message
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages) {
        // Check if message was already appended
        const id = 'prepopulated-diagnostic-booking';
        if (!document.getElementById(id)) {
          const msg = document.createElement('div');
          msg.id = id;
          msg.className = 'chat-bubble bot-message';
          msg.innerHTML = `<p><strong>✨ AI Profile Diagnostic Applied:</strong><br>` +
                          `• Service: ${globalBookingState.service}<br>` +
                          `• Estimate: ${globalBookingState.price}<br><br>` +
                          `Let's finalize your booking. What is your full name?</p>`;
          chatMessages.appendChild(msg);
          chatMessages.scrollTop = chatMessages.scrollHeight;
          
          // Set booking wizard state in chatbot
          window.chatbotBookingStep = 1;
          window.chatbotBookingData = { 
            name: '', 
            phone: '', 
            service: globalBookingState.service, 
            date: '' 
          };
        }
      }
    }
  });
}

/* ==========================================
   AI Consultation Assistant Chatbot
   ========================================== */
function initAIChatbot() {
  const toggleBtn = document.getElementById('chat-toggle-btn');
  const closeBtn = document.getElementById('chat-close-btn');
  const drawer = document.getElementById('chat-drawer');
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const badge = document.getElementById('chat-notification');
  
  // Set global states on window object so diagnostic buttons can pre-populate them
  window.chatbotBookingStep = 0;
  window.chatbotBookingData = { name: '', phone: '', service: '', date: '' };

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      if (badge) badge.style.display = 'none';
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  }

  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', handleUserSendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserSendMessage();
    });
  }

  function handleUserSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user-message');
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      const reply = generateBotReply(text);
      appendMessage(reply, 'bot-message');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 650);
  }

  function appendMessage(text, className) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${className}`;
    bubble.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    chatMessages.appendChild(bubble);
  }

  function generateBotReply(userInput) {
    const input = userInput.toLowerCase();

    // Booking Wizard
    if (window.chatbotBookingStep > 0) {
      return handleBookingWizard(input, userInput);
    }

    if (input.includes('book') || input.includes('sched') || input.includes('appoint')) {
      window.chatbotBookingStep = 1;
      // Clear data, check if stylist pre-selected
      window.chatbotBookingData = { 
        name: '', 
        phone: '', 
        service: globalBookingState.service || 'Precision Cut', 
        date: '' 
      };
      
      let initialMsg = "Sure! Let's schedule your styling appointment. What is your full name?";
      if (globalBookingState.stylist) {
        initialMsg = `Great choice selecting ${globalBookingState.stylist}! Let's schedule your appointment. What is your full name?`;
      }
      return initialMsg;
    }

    if (input.includes('price') || input.includes('cost') || input.includes('fee') || input.includes('rate')) {
      return `Our standard treatments rates:\n` +
             `• Precision Architectural Cut: R 650\n` +
             `• Dimensional Balayage: R 1,850\n` +
             `• Keratin Infusion Therapy: R 1,200\n\n` +
             `You can also complete the "AI Diagnostic Quiz" on this page to get a chemistry profile and personalized estimate. Type "book" to schedule!`;
    }

    if (input.includes('face') || input.includes('oval') || input.includes('round') || input.includes('square') || input.includes('shape')) {
      if (input.includes('oval')) {
        return "For oval face shapes, cheekbones are balanced. You can wear almost any length! We recommend long textured layers to enhance symmetry.";
      }
      if (input.includes('round')) {
        return "For round shapes, vertical lines soften contours. A deep side-part or long collarbone lob elongates the silhouette.";
      }
      if (input.includes('square')) {
        return "For square jaw contours, we suggest soft waves or a textured shag to soften hard corners.";
      }
      return "Tell me your shape (Oval, Round, or Square) and I'll suggest styling outlines.";
    }

    if (input.includes('color') || input.includes('dye') || input.includes('balayage')) {
      return "We formulate hand-painted Balayage highlights with natural organic bases. You can try adjusting the color HSL vector in the 3D lab!";
    }

    return "I am your Pixel Perfect Stylist assistant. Try asking:\n" +
           "• 'Do you have prices?'\n" +
           "• 'Can I book an appointment?'\n" +
           "• 'What works for a round face shape?'";
  }

  function handleBookingWizard(input, originalInput) {
    switch(window.chatbotBookingStep) {
      case 1:
        window.chatbotBookingData.name = originalInput;
        window.chatbotBookingStep = 2;
        return `Got it, ${window.chatbotBookingData.name}. What is a good contact phone number?`;
      case 2:
        window.chatbotBookingData.phone = originalInput;
        window.chatbotBookingStep = 3;
        if (globalBookingState.diagnosticRecommended) {
          // Skip service selection since it was pre-populated by quiz
          window.chatbotBookingStep = 4;
          return `Perfect. You're booked for the recommended "${window.chatbotBookingData.service}" service. What date/time works best for you?`;
        }
        return "Which service would you like? (Cut, Balayage, Keratin, or Consultation)";
      case 3:
        window.chatbotBookingData.service = originalInput;
        window.chatbotBookingStep = 4;
        return "What date and time works best for you? (e.g. Saturday 10:00)";
      case 4:
        window.chatbotBookingData.date = originalInput;
        window.chatbotBookingStep = 0;
        
        let stylistStr = globalBookingState.stylist ? ` with ${globalBookingState.stylist}` : '';
        return `Perfect! Your booking draft is set:\n` +
               `• Client Name: ${window.chatbotBookingData.name}\n` +
               `• Contact: ${window.chatbotBookingData.phone}\n` +
               `• Service: ${window.chatbotBookingData.service}${stylistStr}\n` +
               `• Requested Date: ${window.chatbotBookingData.date}\n\n` +
               `Our lead team will call you shortly to confirm your slot! ✨`;
    }
  }
}

/* ==========================================
   Hair Health Tracker System
   ========================================== */
function initHairTracker() {
  const searchBtn = document.getElementById('tracker-search-btn');
  const idInput = document.getElementById('tracker-input-id');
  const resultsContainer = document.getElementById('tracker-results-container');

  const clientDatabase = {
    "pixel100": {
      name: "Sarah Jenkins",
      date: "10 June 2026",
      stylist: "David (Art Director)",
      hydration: 85,
      elasticity: 90,
      porosity: 45,
      notes: "Cuticle alignment is high. Hydration is excellent. Recommendation: Olaplex rinse once a week. Schedule architectural trim in 6 weeks."
    },
    "gold50": {
      name: "Thabo Molefe",
      date: "28 May 2026",
      stylist: "Michael (Color Master)",
      hydration: 55,
      elasticity: 68,
      porosity: 75,
      notes: "Porosity is slightly elevated due to bleach highlights. Dry-tips require protein mapping. Recommendation: Keratin infusion treatment on next visit."
    }
  };

  if (searchBtn && idInput && resultsContainer) {
    searchBtn.addEventListener('click', performQuery);
    idInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performQuery();
    });
  }

  function performQuery() {
    const code = idInput.value.trim().toLowerCase();
    if (!code) return;

    if (clientDatabase[code]) {
      const data = clientDatabase[code];
      resultsContainer.innerHTML = `
        <div class="tracker-profile-header">
          <div class="profile-meta">
            <h4>${data.name}</h4>
            <span>Client ID: ${code.toUpperCase()} · Stylist: ${data.stylist}</span>
          </div>
          <div class="profile-date">Last Checked: ${data.date}</div>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-bar-box">
            <div class="metric-hdr">
              <span>Cuticle Hydration</span>
              <span class="metric-num">${data.hydration}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" id="fill-hydration" style="width: 0%"></div>
            </div>
          </div>

          <div class="metric-bar-box">
            <div class="metric-hdr">
              <span>Strand Elasticity</span>
              <span class="metric-num">${data.elasticity}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" id="fill-elasticity" style="width: 0%"></div>
            </div>
          </div>

          <div class="metric-bar-box">
            <div class="metric-hdr">
              <span>Cuticle Porosity</span>
              <span class="metric-num">${data.porosity}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" id="fill-porosity" style="width: 0%"></div>
            </div>
          </div>
        </div>
        
        <div class="tracker-recommendations">
          <h5>Stylist Prescription</h5>
          <p>${data.notes}</p>
        </div>
      `;
      resultsContainer.style.display = 'block';

      setTimeout(() => {
        const fillHydration = document.getElementById('fill-hydration');
        const fillElasticity = document.getElementById('fill-elasticity');
        const fillPorosity = document.getElementById('fill-porosity');
        if (fillHydration) fillHydration.style.width = `${data.hydration}%`;
        if (fillElasticity) fillElasticity.style.width = `${data.elasticity}%`;
        if (fillPorosity) fillPorosity.style.width = `${data.porosity}%`;
      }, 50);
    } else {
      resultsContainer.innerHTML = `
        <div class="tracker-recommendations" style="background-color: rgba(224, 122, 95, 0.08); border-color: rgba(224, 122, 95, 0.25);">
          <h5 style="color: var(--accent-copper);">Profile Not Found</h5>
          <p>We couldn't locate a client profile matching "${code.toUpperCase()}". Please verify the code on your appointment card or ask your stylist for your client key.</p>
        </div>
      `;
      resultsContainer.style.display = 'block';
    }
  }
}

/* ==========================================
   Stylist Selector Card Actions
   ========================================== */
function initStylistSelector() {
  const cards = document.querySelectorAll('.stylist-card');
  
  cards.forEach(card => {
    const btn = card.querySelector('.select-stylist-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const name = card.getAttribute('data-stylist');
        
        // Remove previous selected classes
        cards.forEach(c => {
          c.classList.remove('selected-stylist');
          const cb = c.querySelector('.select-stylist-btn');
          if (cb) cb.textContent = `Select ${c.getAttribute('data-stylist')}`;
        });

        // Add selected class
        card.classList.add('selected-stylist');
        btn.textContent = 'Selected';
        globalBookingState.stylist = name;

        // Auto-open chatbot with assigned stylist pre-population
        const chatDrawer = document.getElementById('chat-drawer');
        const badge = document.getElementById('chat-notification');
        if (chatDrawer) {
          chatDrawer.classList.add('open');
          if (badge) badge.style.display = 'none';

          const chatMessages = document.getElementById('chat-messages');
          if (chatMessages) {
            const id = 'prepopulated-stylist-selection';
            // Clear any old selection notices
            const oldNotice = document.getElementById(id);
            if (oldNotice) oldNotice.remove();

            const msg = document.createElement('div');
            msg.id = id;
            msg.className = 'chat-bubble bot-message';
            msg.innerHTML = `<p><strong>👤 Stylist Assigned:</strong> ${name}<br>` +
                            `Excellent! Let's schedule an appointment with ${name}. Type "book" to schedule a date/time.</p>`;
            chatMessages.appendChild(msg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        }
      });
    }
  });
}
