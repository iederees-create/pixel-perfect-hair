/* ==========================================
   Pixel Perfect Hair Studio Application Logic
   Interactive 3D Canvas Projection & Custom AI
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  init3DTiltEffect();
  init3DStylingLab();
  initAIChatbot();
  initHairTracker();
});

/* ==========================================
   Theme Switcher & Mobile Menu
   ========================================== */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  
  // Apply saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (toggle) {
    toggle.checked = savedTheme === 'dark';
    toggle.addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      
      // Update theme label if existing
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
      
      // Animate hamburger lines
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

    // Close mobile menu on link click
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
      const x = e.clientX - rect.left; // x coordinate relative to card
      const y = e.clientY - rect.top;  // y coordinate relative to card
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Maximum tilt angle of 10 degrees
      const rotateX = ((centerY - y) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================
   3D Styling Lab Engine
   ========================================== */
function init3DStylingLab() {
  const canvas = document.getElementById('hair-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // UI Controls
  const styleSelect = document.getElementById('hair-style');
  const lengthSlider = document.getElementById('hair-length');
  const colorSlider = document.getElementById('hair-color');
  const windCheckbox = document.getElementById('wind-physics');
  
  // Text display values
  const lengthVal = document.getElementById('hair-length-val');
  const colorVal = document.getElementById('hair-color-val');
  const colorVectorText = document.getElementById('color-vector-desc');
  const telemetryStrands = document.getElementById('telemetry-strands');
  const fpsTelemetry = document.getElementById('rendering-telemetry');

  // Math variables
  let yaw = 0.5; // Y rotation (horizontal drag)
  let pitch = 0.2; // X rotation (vertical drag)
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let spinVelocityX = 0.005; // Spin inertia
  let spinVelocityY = 0;

  // 3D Math Projection Constants
  const scale = 140; // Zoom factor
  const distance = 4; // Viewport distance
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 - 20;

  // Generate 3D head wireframe vertices
  const headVertices = [];
  const headLines = [];

  // Generate circles for head structure (biometric wireframe look)
  for (let lat = 0; lat < 12; lat++) {
    const theta = (lat * Math.PI) / 12;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const y = cosTheta * 1.1; // Height level
    
    const circleStartIndex = headVertices.length;
    for (let lon = 0; lon < 16; lon++) {
      const phi = (lon * 2 * Math.PI) / 16;
      const x = sinTheta * Math.cos(phi) * 0.95;
      const z = sinTheta * Math.sin(phi) * 0.95;
      headVertices.push({ x, y, z });
      
      const curr = circleStartIndex + lon;
      const next = circleStartIndex + ((lon + 1) % 16);
      headLines.push([curr, next]);
      
      // Connect vertically
      if (lat > 0) {
        const prevRowIndex = curr - 16;
        headLines.push([curr, prevRowIndex]);
      }
    }
  }

  // Generate Hair Strands starting points (scalp coordinates)
  const hairRoots = [];
  for (let lat = 1; lat < 6; lat++) { // Crown area
    const theta = (lat * Math.PI) / 12;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const y = cosTheta * 1.15; // Scalp surface

    // Hair grows mostly on top, sides, and back (lon from -pi/2 to 3pi/2)
    for (let lon = 0; lon < 24; lon++) {
      const phi = (lon * 2 * Math.PI) / 24;
      const x = sinTheta * Math.cos(phi) * 1.0;
      const z = sinTheta * Math.sin(phi) * 1.0;
      
      // Omit face front area (roughly phi between -pi/4 and pi/4)
      const angle = Math.atan2(z, x);
      if (angle > -0.7 && angle < 0.7) continue;
      
      hairRoots.push({ x, y, z });
    }
  }
  if (telemetryStrands) {
    telemetryStrands.textContent = hairRoots.length;
  }

  // Mouse/Touch Drag Event Listeners
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    spinVelocityX = 0;
    spinVelocityY = 0;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    
    yaw += deltaX * 0.007;
    pitch += deltaY * 0.007;
    
    // Clamp pitch to avoid turning completely upside down
    pitch = Math.max(-1.2, Math.min(1.2, pitch));
    
    // Store velocity for inertia
    spinVelocityX = deltaX * 0.0015;
    spinVelocityY = deltaY * 0.0015;
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
      spinVelocityX = 0;
      spinVelocityY = 0;
    }
  });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - lastMouseX;
    const deltaY = e.touches[0].clientY - lastMouseY;
    
    yaw += deltaX * 0.007;
    pitch += deltaY * 0.007;
    pitch = Math.max(-1.2, Math.min(1.2, pitch));
    
    spinVelocityX = deltaX * 0.0015;
    spinVelocityY = deltaY * 0.0015;
    
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
  });

  // 3D coordinate rotation math helper
  function rotate3D(point, yawAngle, pitchAngle) {
    // Rotate around Y-axis (Yaw)
    const x1 = point.x * Math.cos(yawAngle) - point.z * Math.sin(yawAngle);
    const z1 = point.x * Math.sin(yawAngle) + point.z * Math.cos(yawAngle);
    
    // Rotate around X-axis (Pitch)
    const y2 = point.y * Math.cos(pitchAngle) - z1 * Math.sin(pitchAngle);
    const z2 = point.y * Math.sin(pitchAngle) + z1 * Math.cos(pitchAngle);
    
    return { x: x1, y: y2, z: z2 };
  }

  // Project 3D vector to 2D viewport coordinates
  function project(point) {
    const rotated = rotate3D(point, yaw, pitch);
    
    // Perspective math: scale decreases as distance Z increases
    const denom = rotated.z + distance;
    const screenX = centerX + (rotated.x * scale) / denom;
    const screenY = centerY - (rotated.y * scale) / denom;
    
    return { x: screenX, y: screenY, z: rotated.z };
  }

  // Animation Variables
  let time = 0;
  let lastTime = performance.now();
  let frames = 0;

  // Real-time animation render loop
  function draw() {
    time += 0.04;
    
    // FPS counter calculation
    frames++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      if (fpsTelemetry) fpsTelemetry.textContent = `FPS: ${frames}`;
      frames = 0;
      lastTime = now;
    }

    // Apply spin inertia when not dragging
    if (!isDragging) {
      yaw += spinVelocityX;
      pitch += spinVelocityY;
      spinVelocityX *= 0.95; // Inertia friction
      spinVelocityY *= 0.95;
      
      // Minimum passive rotation if completely static
      if (Math.abs(spinVelocityX) < 0.0001) {
        spinVelocityX = 0.0015;
      }
    }

    // Clear Canvas with transparency to show glows
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current control values
    const length = parseFloat(lengthSlider.value);
    const hue = parseInt(colorSlider.value);
    const style = styleSelect.value;
    const isWindEnabled = windCheckbox.checked;

    // Update text telemetry
    if (lengthVal) lengthVal.textContent = `${length.toFixed(1)} dm`;
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

    // Draw Face Biometric Wireframe lines
    ctx.beginPath();
    ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'light' 
      ? 'rgba(9, 8, 18, 0.06)' 
      : 'rgba(212, 163, 115, 0.06)';
    ctx.lineWidth = 1;
    
    headLines.forEach(([i, j]) => {
      const p1 = project(headVertices[i]);
      const p2 = project(headVertices[j]);
      
      // Back-face culling (do not render lines facing away to keep wireframe clean)
      if (p1.z > -0.8 && p2.z > -0.8) {
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
    });
    ctx.stroke();

    // Draw Hair Strands
    hairRoots.forEach((root) => {
      ctx.beginPath();
      
      // Base color gradient based on HSL selection
      ctx.strokeStyle = `hsla(${hue}, 85%, 55%, 0.65)`;
      ctx.lineWidth = style === 'afro' ? 2 : 1.2;

      // Project start point
      let prevProj = project(root);
      ctx.moveTo(prevProj.x, prevProj.y);

      // Generate nodes along the length of each hair strand
      const steps = style === 'afro' ? 8 : 12;
      for (let step = 1; step <= steps; step++) {
        const segmentPct = step / steps;
        
        // Base gravity gravity curve downwards (subtract from Y)
        let dx = 0;
        let dy = -length * 0.12 * segmentPct;
        let dz = 0;

        // Apply style physics offsets
        if (style === 'wavy') {
          // Sinusoidal waves
          dx = Math.sin(segmentPct * 6 + root.x * 2) * 0.12;
          dz = Math.cos(segmentPct * 5 + root.z * 2) * 0.12;
        } else if (style === 'curly') {
          // Helical curls
          dx = Math.sin(segmentPct * 16 + root.x * 4) * 0.08;
          dz = Math.cos(segmentPct * 16 + root.z * 4) * 0.08;
        } else if (style === 'afro') {
          // Tiny high-frequency coils close to head
          dx = Math.sin(segmentPct * 35 + root.x * 10) * 0.04;
          dy = -length * 0.04 * segmentPct + Math.cos(segmentPct * 35) * 0.04;
          dz = Math.cos(segmentPct * 35 + root.z * 10) * 0.04;
        }

        // Apply breeze physics (wind time oscillations)
        if (isWindEnabled) {
          const windIntensity = style === 'afro' ? 0.015 : 0.07;
          dx += Math.sin(time + root.y * 3 + segmentPct * 2) * windIntensity * segmentPct;
          dz += Math.cos(time * 0.8 + root.x * 2 + segmentPct * 2) * windIntensity * segmentPct;
        }

        // Compute local coordinate
        const node3D = {
          x: root.x + dx,
          y: root.y + dy,
          z: root.z + dz
        };

        const proj = project(node3D);

        // Dynamic gradient styling for ombre look (root is darker, tip is brighter)
        const gradient = ctx.createLinearGradient(prevProj.x, prevProj.y, proj.x, proj.y);
        gradient.addColorStop(0, `hsla(${hue}, 85%, 35%, ${0.3 + 0.4 * (1 - segmentPct)})`);
        gradient.addColorStop(1, `hsla(${(hue + 15) % 360}, 95%, 65%, ${0.65 - 0.25 * segmentPct})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineTo(proj.x, proj.y);
        ctx.stroke();
        
        // Prepare next line segment
        ctx.beginPath();
        ctx.moveTo(proj.x, proj.y);
        prevProj = proj;
      }
    });

    requestAnimationFrame(draw);
  }

  // Start projection loop
  draw();
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
  
  // Track lead capturing state
  let bookingStep = 0;
  const bookingData = { name: '', phone: '', service: '', date: '' };

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      if (badge) badge.style.display = 'none'; // Hide notification when open
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  }

  // Message Send event
  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', handleUserSendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserSendMessage();
    });
  }

  function handleUserSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Render User message
    appendMessage(text, 'user-message');
    chatInput.value = '';

    // Scroll messages to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate thinking delay, then reply
    setTimeout(() => {
      const reply = generateBotReply(text);
      appendMessage(reply, 'bot-message');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 650);
  }

  function appendMessage(text, className) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${className}`;
    
    // Support basic line breaks
    bubble.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    chatMessages.appendChild(bubble);
  }

  function generateBotReply(userInput) {
    const input = userInput.toLowerCase();

    // Lead capturing wizard state machine
    if (bookingStep > 0) {
      return handleBookingWizard(input, userInput);
    }

    // Keyword: Start Booking
    if (input.includes('book') || input.includes('sched') || input.includes('appoint')) {
      bookingStep = 1;
      return "Sure! Let's schedule a styling appointment. What is your full name?";
    }

    // Keyword: Price/Estimates
    if (input.includes('price') || input.includes('cost') || input.includes('fee') || input.includes('rate')) {
      return `Our core services include:\n` +
             `• Precision Architectural Cut: R 650\n` +
             `• Hand-painted Balayage: R 1,850\n` +
             `• Keratin Infusion Therapy: R 1,200\n` +
             `• Full consultation: Included free with booking.\n\n` +
             `Type "book" to schedule or let me know if you would like to estimate multiple treatments.`;
    }

    // Keyword: Face shapes styling consultation
    if (input.includes('face') || input.includes('oval') || input.includes('round') || input.includes('square') || input.includes('shape')) {
      if (input.includes('oval')) {
        return "For oval face shapes, most styles work beautifully! We highly recommend a layered collarbone cut or textured wave to framing the eyes.";
      }
      if (input.includes('round')) {
        return "For round face shapes, we suggest styles that create length. A deep side-part or texturized long pixie cut creates sleek vertical lines.";
      }
      if (input.includes('square')) {
        return "For square face shapes, we aim to soften jaw contours. Soft waves, side-swept fringes, and long layers work wonderfully.";
      }
      return "What is your face shape? (Oval, Round, Square, or Heart-shaped). I can give you styling design rules for your jaw outline!";
    }

    // Keyword: Balayage/Color science
    if (input.includes('color') || input.includes('dye') || input.includes('balayage') || input.includes('ombre')) {
      return "Our salon uses bio-organic color bases that safeguard hair cuticles. We paint free-hand (Balayage) to blend customized metallic highlights. You can test your color hue on our 3D Styling Lab on this page!";
    }

    // Generic fallback reply
    return "I can help with styling recommendations, pricing, and scheduling. Try asking: \n" +
           "• 'What works for an oval face?'\n" +
           "• 'How much does a Balayage cost?'\n" +
           "• 'Can I book an appointment?'";
  }

  // Scheduling Form Wizard
  function handleBookingWizard(input, originalInput) {
    switch(bookingStep) {
      case 1:
        bookingData.name = originalInput;
        bookingStep = 2;
        return `Got it, ${bookingData.name}. What is a good phone number to contact you?`;
      case 2:
        bookingData.phone = originalInput;
        bookingStep = 3;
        return "Which service would you like? (Cut, Balayage, Keratin, or Consultation)";
      case 3:
        bookingData.service = originalInput;
        bookingStep = 4;
        return "What date and time works best for you? (e.g. Saturday 10 AM)";
      case 4:
        bookingData.date = originalInput;
        bookingStep = 0; // Finished
        
        // Show success summary
        return `Perfect! I've pre-booked your appointment:\n` +
               `• Client Name: ${bookingData.name}\n` +
               `• Contact: ${bookingData.phone}\n` +
               `• Service: ${bookingData.service}\n` +
               `• Date/Time: ${bookingData.date}\n\n` +
               `Our lead stylist will call you shortly to confirm. Thank you! ✨`;
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

  // Local client profile database
  const clientDatabase = {
    "pixel100": {
      name: "Sarah Jenkins",
      date: "10 June 2026",
      stylist: "David (Art Director)",
      hydration: 85,
      elasticity: 90,
      porosity: 45,
      notes: "Hydration levels are excellent. Olaplex treatment bonds are stable. Recommendation: Continue sulfate-free shampoo and schedule a trim in 6 weeks."
    },
    "gold50": {
      name: "Thabo Molefe",
      date: "28 May 2026",
      stylist: "Michael (Color Master)",
      hydration: 55,
      elasticity: 68,
      porosity: 75,
      notes: "Porosity remains high due to bleached ombre tips. Needs intensive hydration mask. Recommendation: Keratin infusion treatment on next visit. Limit thermal iron tools."
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
      
      // Render results view HTML
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

      // Trigger metric bar animations with a tiny timeout to allow DOM insertion
      setTimeout(() => {
        const fillHydration = document.getElementById('fill-hydration');
        const fillElasticity = document.getElementById('fill-elasticity');
        const fillPorosity = document.getElementById('fill-porosity');

        if (fillHydration) fillHydration.style.width = `${data.hydration}%`;
        if (fillElasticity) fillElasticity.style.width = `${data.elasticity}%`;
        if (fillPorosity) fillPorosity.style.width = `${data.porosity}%`;
      }, 50);

    } else {
      // Not found state
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
