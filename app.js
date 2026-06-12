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
  diagnosticRecommended: false,
  capturedImage: null, // Holds the composite styling image data URL
  styleRecipe: '' // Text representation of hair config
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
  
  // Game UI overlays & buttons
  const startOverlay = document.getElementById('game-start-overlay');
  const gameOverOverlay = document.getElementById('game-over-overlay');
  const btnStartGame = document.getElementById('btn-start-game');
  const btnRestartGame = document.getElementById('btn-restart-game');
  const btnClaimReward = document.getElementById('btn-claim-reward');
  const resultTitle = document.getElementById('game-result-title');
  const resultDesc = document.getElementById('game-result-desc');
  const codeBox = document.getElementById('game-code-box');
  const btnCaptureSnapshot = document.getElementById('btn-capture-snapshot');

  // Lookbook cards & data
  const carouselCards = document.querySelectorAll('.carousel-card');
  let activeStyleName = 'bob';
  let isScanning = false;
  let scanProgress = 0;

  // Lookbook metadata
  const lookbookData = {
    // === BOBS ===
    "bob-sleek": {
      title: "Sleek French Bob",
      desc: "An architectural classic bob cut with clean lines that frame the cheekbones. Perfect for a sharp, modern appearance.",
      face: "Oval, Heart, Square",
      maintenance: "Medium",
      texture: "Straight, Fine",
      price: "R 650",
      stylist: "David Jenkins"
    },
    "bob-french": {
      title: "Parisian Fringe Bob",
      desc: "A cropped chin-length bob paired with light wispy bangs, offering a romantic, effortless European style.",
      face: "Long, Oval, Heart",
      maintenance: "Medium",
      texture: "Straight, Fine",
      price: "R 680",
      stylist: "David Jenkins"
    },
    "bob-asym": {
      title: "Asymmetrical Bob",
      desc: "An edgy cut featuring one side longer than the other to create dramatic geometric angles.",
      face: "Round, Oval, Heart",
      maintenance: "High",
      texture: "Straight, Thick",
      price: "R 750",
      stylist: "Sophia Martinez"
    },
    "bob-layered": {
      title: "Textured Layered Bob",
      desc: "A shaggy bob cut with internal layers for movement, texture, and organic volume.",
      face: "Square, Oval, Diamond",
      maintenance: "Low-Medium",
      texture: "Wavy, Fine",
      price: "R 690",
      stylist: "Sophia Martinez"
    },
    "bob-lob": {
      title: "Classic Long Bob (Lob)",
      desc: "A collarbone-skimming bob providing styling flexibility while maintaining a clean, structured outline.",
      face: "Round, Oval, Square",
      maintenance: "Low",
      texture: "Straight, Medium",
      price: "R 720",
      stylist: "David Jenkins"
    },
    "bob-shaggy": {
      title: "Shaggy Retro Bob",
      desc: "Inspired by the 70s, this bob features choppy layers and textured ends for a relaxed rock-and-roll vibe.",
      face: "Long, Diamond, Oval",
      maintenance: "Low",
      texture: "Wavy, Thick",
      price: "R 670",
      stylist: "Michael Thabo"
    },
    "bob-blunt": {
      title: "Blunt-Cut Glass Bob",
      desc: "A razor-sharp, zero-layer bob styled for an ultra-reflective glass finish.",
      face: "Oval, Heart, Diamond",
      maintenance: "High",
      texture: "Straight, Coarse",
      price: "R 700",
      stylist: "David Jenkins"
    },
    "bob-pageboy": {
      title: "Classic Pageboy Bob",
      desc: "A retro structured bob with under-curled ends that roll inward around the neck.",
      face: "Long, Oval, Heart",
      maintenance: "Medium",
      texture: "Straight, Medium",
      price: "R 640",
      stylist: "David Jenkins"
    },
    "bob-inverted": {
      title: "Inverted A-Line Bob",
      desc: "Shorter in the back and graduated longer toward the front to accentuate the jawline.",
      face: "Round, Oval, Square",
      maintenance: "Medium-High",
      texture: "Straight, Medium",
      price: "R 710",
      stylist: "Sophia Martinez"
    },
    "bob-vintage": {
      title: "Vintage Pinup Bob",
      desc: "Styled with victory curls and clean pinup waves for a nostalgic, glamorous look.",
      face: "Oval, Heart, Square",
      maintenance: "High",
      texture: "Straight, Wavy",
      price: "R 850",
      stylist: "Sophia Martinez"
    },

    // === PIXIES ===
    "pixie-chic": {
      title: "Chic Pixie Crop",
      desc: "A short, low-maintenance crop with textured, organic layers that emphasize facial symmetry.",
      face: "Oval, Round, Heart",
      maintenance: "Low",
      texture: "Straight, Wavy",
      price: "R 580",
      stylist: "David Jenkins"
    },
    "pixie-textured": {
      title: "Textured Razor Pixie",
      desc: "Choppy layers cut with a razor to add volume and texture on top while keeping the sides tight.",
      face: "Oval, Heart, Diamond",
      maintenance: "Low",
      texture: "Straight, Fine",
      price: "R 600",
      stylist: "David Jenkins"
    },
    "pixie-spiky": {
      title: "Edgy Spiky Crop",
      desc: "A short crop with textured crown spikes for a bold, statement-making silhouette.",
      face: "Round, Oval, Square",
      maintenance: "Low-Medium",
      texture: "Coarse, Thick",
      price: "R 620",
      stylist: "Sophia Martinez"
    },
    "pixie-shaved": {
      title: "Undercut Pixie",
      desc: "Features shaved sides or back with a contrasting longer, styled top section.",
      face: "Oval, Diamond, Heart",
      maintenance: "Medium",
      texture: "Any Texture",
      price: "R 650",
      stylist: "Sophia Martinez"
    },
    "pixie-feathered": {
      title: "Feathered Pixie Crop",
      desc: "Soft, wispy layers that brush forward gently around the ears and forehead.",
      face: "Oval, Heart, Long",
      maintenance: "Low",
      texture: "Straight, Fine",
      price: "R 590",
      stylist: "David Jenkins"
    },
    "pixie-retro": {
      title: "Retro Pixie Wave",
      desc: "A vintage-inspired pixie with clean fingerwaves sculpted close to the head.",
      face: "Oval, Heart, Square",
      maintenance: "High",
      texture: "Wavy, Fine",
      price: "R 780",
      stylist: "Sophia Martinez"
    },
    "pixie-curly": {
      title: "Curly Pixie Volume",
      desc: "Emphasizes natural curls on top with tapered sides for structural bounce.",
      face: "Oval, Round, Diamond",
      maintenance: "Medium",
      texture: "Curly, Wavy",
      price: "R 640",
      stylist: "Michael Thabo"
    },
    "pixie-wispy": {
      title: "Wispy Fringe Pixie",
      desc: "Styled with piecey, texturized bangs that drape gently over the eyebrows.",
      face: "Oval, Long, Heart",
      maintenance: "Low-Medium",
      texture: "Straight, Fine",
      price: "R 610",
      stylist: "David Jenkins"
    },
    "pixie-tapered": {
      title: "Tapered Boyish Crop",
      desc: "A classic short crop with a soft gradient taper down the back of the neck.",
      face: "Oval, Square, Heart",
      maintenance: "Low",
      texture: "Straight, Medium",
      price: "R 570",
      stylist: "David Jenkins"
    },
    "pixie-platinum": {
      title: "Platinum Pixie Cut",
      desc: "A bold crop combined with a high-lift platinum blonde bleach treatment.",
      face: "Oval, Heart, Diamond",
      price: "R 1,450",
      maintenance: "High (Roots)",
      texture: "Straight, Fine",
      stylist: "Michael Thabo"
    },

    // === WAVES ===
    "waves-beach": {
      title: "Rose Gold Beach Waves",
      desc: "Voluminous, hand-painted balayage curls with relaxed movement. Ideal for active lifestyles.",
      face: "Oval, Diamond, Long",
      maintenance: "Medium-High",
      texture: "Wavy, Thick",
      price: "R 1,850",
      stylist: "Michael Thabo"
    },
    "waves-mermaid": {
      title: "Crimson Mermaid Waves",
      desc: "Extra-long cascading waves tinted with deep crimson hues for an enchanting look.",
      face: "Oval, Round, Long",
      maintenance: "High",
      texture: "Wavy, Thick",
      price: "R 2,200",
      stylist: "Michael Thabo"
    },
    "waves-tousled": {
      title: "Tousled Shag Waves",
      desc: "A layered shag cut with soft waves that give a relaxed, rock-star appeal.",
      face: "Long, Oval, Square",
      maintenance: "Low-Medium",
      texture: "Wavy, Medium",
      price: "R 850",
      stylist: "Sophia Martinez"
    },
    "waves-hollywood": {
      title: "Hollywood Glamour Waves",
      desc: "Polished, uniform S-shape waves that fall elegantly over one shoulder.",
      face: "Oval, Heart, Diamond",
      maintenance: "High",
      texture: "Wavy, Fine-Medium",
      price: "R 950",
      stylist: "David Jenkins"
    },
    "waves-vintage": {
      title: "Vintage Fingerwaves",
      desc: "Sleek, gel-sculpted fingerwaves that offer an elegant 1920s appearance.",
      face: "Oval, Heart, Square",
      maintenance: "High",
      texture: "Straight, Wavy",
      price: "R 890",
      stylist: "Sophia Martinez"
    },
    "waves-wet": {
      title: "Wet-Look Gloss Waves",
      desc: "High-shine wet look styling that defines wave patterns with glossy hold.",
      face: "Oval, Diamond, Heart",
      maintenance: "Medium",
      texture: "Wavy, Thick",
      price: "R 800",
      stylist: "Michael Thabo"
    },
    "waves-crimson": {
      title: "Crimson Autumn Waves",
      desc: "Sun-kissed copper waves with soft long layers to create depth and dimension.",
      face: "Oval, Round, Heart",
      maintenance: "Medium",
      texture: "Wavy, Medium-Thick",
      price: "R 1,650",
      stylist: "Michael Thabo"
    },
    "waves-boho": {
      title: "Bohemian Boho Waves",
      desc: "Soft, loose wave patterns with random braids intermixed for a free-spirited vibe.",
      face: "Oval, Square, Heart",
      maintenance: "Low",
      texture: "Wavy, Fine-Medium",
      price: "R 790",
      stylist: "Sophia Martinez"
    },
    "waves-copper": {
      title: "Sunset Copper Waves",
      desc: "Deep sunset ginger balayage waves that reflect light brilliantly.",
      face: "Oval, Diamond, Square",
      maintenance: "Medium-High",
      texture: "Wavy, Medium",
      price: "R 1,750",
      stylist: "Michael Thabo"
    },
    "waves-pastel": {
      title: "Creative Lavender Waves",
      desc: "Light pastel lilac tones styled in soft beachy waves.",
      face: "Oval, Heart, Diamond",
      price: "R 1,950",
      maintenance: "High",
      texture: "Wavy, Fine",
      stylist: "Michael Thabo"
    },

    // === AFRO ===
    "afro-coils": {
      title: "High-Volume Afro Coils",
      desc: "A sculpted halo celebrating rich, natural texture and dimensional coils with custom shape framing.",
      face: "Round, Square, Heart",
      maintenance: "Medium",
      texture: "Coily, Afro",
      price: "R 750",
      stylist: "Sophia Martinez"
    },
    "afro-tapered": {
      title: "Tapered Natural Fro",
      desc: "A clean tapered cut that keeps the sides close while leaving high volume on top.",
      face: "Round, Oval, Heart",
      maintenance: "Low-Medium",
      texture: "Coily, Afro",
      price: "R 680",
      stylist: "Sophia Martinez"
    },
    "afro-mohawk": {
      title: "Mohawk Fro (Frohawk)",
      desc: "A bold, sculpted frohawk styling that gathers natural coils along the center.",
      face: "Oval, Square, Diamond",
      maintenance: "Medium",
      texture: "Coily, Afro",
      price: "R 800",
      stylist: "Sophia Martinez"
    },
    "afro-puff": {
      title: "Double Afro Puff",
      desc: "Playful twin puffs gathered high on the head to showcase texture and curl volume.",
      face: "Round, Heart, Oval",
      maintenance: "Low",
      texture: "Coily, Afro",
      price: "R 550",
      stylist: "Sophia Martinez"
    },
    "afro-spiral": {
      title: "Spiral Coil-Out",
      desc: "Coils defined with high-hydration styling creams for a spiral-defined shape.",
      face: "Oval, Long, Square",
      maintenance: "Medium",
      texture: "Coily, Curly",
      price: "R 820",
      stylist: "Michael Thabo"
    },
    "afro-halo": {
      title: "Voluminous Halo Fro",
      desc: "A perfectly rounded, classic spherical afro cut celebrating natural density.",
      face: "Square, Heart, Oval",
      maintenance: "Medium-High",
      texture: "Coily, Afro",
      price: "R 780",
      stylist: "Sophia Martinez"
    },
    "afro-highlight": {
      title: "Honey Highlighted Fro",
      desc: "Adds depth to natural coils with sun-kissed honey highlights on the tips.",
      face: "Round, Oval, Diamond",
      maintenance: "Medium-High",
      texture: "Coily, Afro",
      price: "R 1,350",
      stylist: "Michael Thabo"
    },
    "afro-bleached": {
      title: "Bleached Platinum Fro",
      desc: "A short, closely cropped afro colored in high-impact platinum blonde.",
      face: "Oval, Square, Heart",
      maintenance: "High (Roots)",
      texture: "Coily, Afro",
      price: "R 1,200",
      stylist: "Michael Thabo"
    },
    "afro-frohawk": {
      title: "Glam Frohawk Graduated",
      desc: "A high-fashion frohawk with detailed fading and geometric styling lines.",
      face: "Oval, Diamond, Heart",
      maintenance: "Medium",
      texture: "Coily, Afro",
      price: "R 850",
      stylist: "Sophia Martinez"
    },
    "afro-crown": {
      title: "Crown Braided Fro",
      desc: "Combines close-to-scalp braids on the sides with a natural halo crown.",
      face: "Oval, Long, Heart",
      maintenance: "Low-Medium",
      texture: "Coily, Afro",
      price: "R 900",
      stylist: "Sophia Martinez"
    },

    // === CURLY ===
    "curly-volume": {
      title: "Long Layered Curls",
      desc: "Bouncy, elongated spirals with soft layered texturing that provides organic volume and bounce.",
      face: "Long, Oval, Heart",
      maintenance: "High",
      texture: "Curly, Thick",
      price: "R 1,100",
      stylist: "Michael Thabo"
    },
    "curly-bouncy": {
      title: "Bouncy Spring Ringlets",
      desc: "Tight, energetic ringlets cut with rounded layers to maximize bounce and volume.",
      face: "Oval, Round, Diamond",
      maintenance: "High",
      texture: "Curly, Springy",
      price: "R 1,150",
      stylist: "Michael Thabo"
    },
    "curly-botticelli": {
      title: "Botticelli Spiral Curls",
      desc: "Elongated, romantic spirals reminiscent of classic paintings, styled with light shine oil.",
      face: "Long, Oval, Heart",
      maintenance: "Medium-High",
      texture: "Curly, Fine-Medium",
      price: "R 1,200",
      stylist: "Michael Thabo"
    },
    "curly-shag": {
      title: "Curly Shag Layered",
      desc: "A messy shaggy cut modified for curly textures, featuring shorter crown layers.",
      face: "Oval, Square, Diamond",
      maintenance: "Low-Medium",
      texture: "Curly, Thick",
      price: "R 950",
      stylist: "Sophia Martinez"
    },
    "curly-messy": {
      title: "Messy Ringlet Volume",
      desc: "Relaxed curly ringlets styled with sea salt curl activator for an effortless style.",
      face: "Oval, Round, Square",
      maintenance: "Low",
      texture: "Curly, Medium",
      price: "R 890",
      stylist: "Michael Thabo"
    },
    "curly-glamour": {
      title: "Golden Glam Curls",
      desc: "Polished curls highlighted in soft gold hues, styled for maximum volume and bounce.",
      face: "Oval, Heart, Diamond",
      maintenance: "High",
      texture: "Curly, Thick",
      price: "R 1,680",
      stylist: "Michael Thabo"
    },
    "curly-corkscrew": {
      title: "Corkscrew Spiral Volume",
      desc: "Intense, tight corkscrew curls styled to create full, geometric halo volume.",
      face: "Round, Oval, Square",
      maintenance: "High",
      texture: "Curly, Coarse",
      price: "R 1,180",
      stylist: "Michael Thabo"
    },
    "curly-crown": {
      title: "Crown Volume Spirals",
      desc: "Features layered styling focused on the crown to give lift and prevent flat roots.",
      face: "Round, Heart, Diamond",
      maintenance: "Medium-High",
      texture: "Curly, Medium",
      price: "R 1,050",
      stylist: "Sophia Martinez"
    },
    "curly-cascading": {
      title: "Cascading Ringlet Layers",
      desc: "Curls styled to fall in descending layers around the face for soft framing.",
      face: "Oval, Long, Diamond",
      maintenance: "High",
      texture: "Curly, Thick",
      price: "R 1,250",
      stylist: "Michael Thabo"
    },
    "curly-soft": {
      title: "Soft Romantique Curls",
      desc: "Gentle, romantic curls styled with curl-enhancing creams for touchable softness.",
      face: "Oval, Heart, Long",
      maintenance: "Medium",
      texture: "Curly, Fine",
      price: "R 980",
      stylist: "Sophia Martinez"
    }
  };

  // Set default details
  updateLookbookDetails('bob-sleek');
  updateStyleRecipe();

  function updateLookbookDetails(presetKey) {
    const data = lookbookData[presetKey];
    if (!data) return;

    const titleEl = document.getElementById('lookbook-title');
    const descEl = document.getElementById('lookbook-desc');
    const faceEl = document.getElementById('spec-face');
    const maintEl = document.getElementById('spec-maintenance');
    const textureEl = document.getElementById('spec-texture');
    const priceEl = document.getElementById('spec-price');

    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;
    if (faceEl) faceEl.textContent = data.face;
    if (maintEl) maintEl.textContent = data.maintenance;
    if (textureEl) textureEl.textContent = data.texture;
    if (priceEl) priceEl.textContent = data.price;

    globalBookingState.service = data.title;
    globalBookingState.price = data.price;
  }

  // Carousel click card listeners
  carouselCards.forEach(card => {
    card.addEventListener('click', () => {
      carouselCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeStyleName = card.getAttribute('data-style') || 'bob';
      const presetKey = card.getAttribute('data-preset') || activeStyleName;
      updateLookbookDetails(presetKey);
      updateStyleRecipe();
    });
  });

  // Compile checklist options into the style recipe
  function updateStyleRecipe() {
    const selectedLength = document.querySelector('input[name="cut-length"]:checked')?.value || "Short Crop";
    
    const selectedColors = [];
    document.querySelectorAll('input[name="cut-color"]:checked').forEach(cb => {
      selectedColors.push(cb.value);
    });
    const colorText = selectedColors.length > 0 ? selectedColors.join(', ') : "Natural / No Tint";

    const selectedTexture = document.querySelector('input[name="cut-texture"]:checked')?.value || "Glass Straight";
    const selectedBangs = document.querySelector('input[name="cut-bangs"]:checked')?.value || "No Bangs";

    const selectedExtras = [];
    document.querySelectorAll('input[name="cut-extras"]:checked').forEach(cb => {
      selectedExtras.push(cb.value);
    });
    const extrasText = selectedExtras.length > 0 ? selectedExtras.join(', ') : "None";

    const activeCard = document.querySelector('.carousel-card.active');
    const presetKey = activeCard?.getAttribute('data-preset') || activeStyleName;
    const styleData = lookbookData[presetKey] || {};
    
    let recipe = `Base Style: ${styleData.title || activeStyleName.toUpperCase()}\n` +
                 `· Length: ${selectedLength}\n` +
                 `· Color Finish: ${colorText}\n` +
                 `· Texture Style: ${selectedTexture}\n` +
                 `· Bangs/Fringe: ${selectedBangs}\n` +
                 `· Custom Extras: ${extrasText}`;

    globalBookingState.styleRecipe = recipe;
  }

  // Bind preferred cut builder checkbox listeners
  document.querySelectorAll('#preferred-cut-builder-box input').forEach(input => {
    input.addEventListener('change', updateStyleRecipe);
  });

  // Capture snapshot / prescription card receipt handler with biometric scan animation
  btnCaptureSnapshot?.addEventListener('click', () => {
    if (isScanning) return; // Prevent multiple scans at once

    isScanning = true;
    const originalHTML = btnCaptureSnapshot.innerHTML;
    btnCaptureSnapshot.disabled = true;
    btnCaptureSnapshot.innerHTML = `<span class="spinner" style="display:inline-block; width:12px; height:12px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation: spin 0.8s linear infinite; margin-right: 0.35rem; vertical-align: middle;"></span>Scanning...`;

    setTimeout(() => {
      isScanning = false;
      btnCaptureSnapshot.disabled = false;
      btnCaptureSnapshot.innerHTML = originalHTML;

      updateStyleRecipe(); // ensure latest state
      
      const activeCard = document.querySelector('.carousel-card.active');
      const presetKey = activeCard?.getAttribute('data-preset') || activeStyleName;
      
      // Save to booking state
      globalBookingState.service = lookbookData[presetKey]?.title || activeStyleName;
      globalBookingState.price = lookbookData[presetKey]?.price || "R 650";
      
      // Save style snapshot image
      globalBookingState.capturedImage = canvas.toDataURL('image/png');

      // Play quick visual flash
      const flash = document.getElementById('camera-flash-effect') || document.createElement('div');
      if (!document.getElementById('camera-flash-effect')) {
        flash.id = 'camera-flash-effect';
        flash.className = 'camera-flash';
        canvas.parentElement.appendChild(flash);
      }
      flash.classList.add('flash-active');
      setTimeout(() => flash.classList.remove('flash-active'), 500);

      // Open chat drawer
      const drawer = document.getElementById('chat-drawer');
      const badge = document.getElementById('chat-notification');
      if (drawer) {
        drawer.classList.add('open');
        if (badge) badge.style.display = 'none';

        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
          const id = 'prepopulated-capture-notice';
          const old = document.getElementById(id);
          if (old) old.remove();

          const msg = document.createElement('div');
          msg.id = id;
          msg.className = 'chat-bubble bot-message';
          
          msg.innerHTML = `<p>🧬 <strong>Biometric Styling Scan Complete!</strong></p>` +
                          `<p>Your custom recipe has been saved to your booking draft:</p>` +
                          `<pre style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 6px; font-size: 0.75rem; color: var(--accent-gold); font-family: monospace; white-space: pre-wrap; margin: 0.5rem 0;">` +
                          `${globalBookingState.styleRecipe}</pre>` +
                          `<p style="font-size: 0.82rem; margin-bottom: 0;">` +
                          `When you book your appointment, this recipe will be attached so your stylist can prep in advance!</p>`;
          chatMessages.appendChild(msg);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }
    }, 2000);
  });

  // Vector hair silhouettes drawing function
  function drawHairstyle(ctx, type, cx, cy, sc, h) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sc, sc);

    // Create HSL colors
    const baseColor = `hsla(${h}, 50%, 15%, 0.88)`;
    const highlightColor1 = `hsla(${h}, 85%, 55%, 0.6)`;
    const highlightColor2 = `hsla(${(h + 20) % 360}, 90%, 65%, 0.5)`;
    const shadowColor = `rgba(0, 0, 0, 0.4)`;

    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 15;

    if (type === 'bob') {
      ctx.beginPath();
      ctx.fillStyle = baseColor;
      ctx.moveTo(-70, 70);
      ctx.lineTo(-75, -20);
      ctx.bezierCurveTo(-75, -110, 75, -110, 75, -20);
      ctx.lineTo(70, 70);
      ctx.quadraticCurveTo(60, 85, 50, 80);
      ctx.lineTo(48, 20);
      ctx.bezierCurveTo(20, 25, -20, 25, -48, 20);
      ctx.lineTo(-50, 80);
      ctx.quadraticCurveTo(-60, 85, -70, 70);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;

      for (let i = -65; i <= 65; i += 6) {
        ctx.beginPath();
        ctx.strokeStyle = i % 12 === 0 ? highlightColor1 : highlightColor2;
        ctx.moveTo(i * 0.8, -85);
        ctx.bezierCurveTo(i, -30, i, 30, i * 1.05, 72);
        ctx.stroke();
      }

      for (let i = -40; i <= 40; i += 4) {
        ctx.beginPath();
        ctx.strokeStyle = highlightColor2;
        ctx.moveTo(i * 0.5, -80);
        ctx.quadraticCurveTo(i * 0.8, -30, i, 20);
        ctx.stroke();
      }

    } else if (type === 'pixie') {
      ctx.beginPath();
      ctx.fillStyle = baseColor;
      ctx.moveTo(-60, 20);
      ctx.lineTo(-65, -15);
      ctx.bezierCurveTo(-60, -95, 60, -95, 65, -15);
      ctx.lineTo(60, 20);
      ctx.lineTo(50, 5);
      ctx.bezierCurveTo(25, 0, -25, 0, -50, 5);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2.5;
      
      for (let r = 20; r < 80; r += 15) {
        for (let a = -Math.PI + 0.2; a < -0.2; a += 0.25) {
          const x1 = Math.cos(a) * (r - 10);
          const y1 = Math.sin(a) * (r - 10) - 20;
          const x2 = Math.cos(a + 0.1) * r;
          const y2 = Math.sin(a + 0.1) * r - 20;
          
          ctx.beginPath();
          ctx.strokeStyle = a % 0.5 < 0.25 ? highlightColor1 : highlightColor2;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      for (let i = -45; i <= 45; i += 6) {
        ctx.beginPath();
        ctx.strokeStyle = highlightColor2;
        ctx.moveTo(i * 0.8, -60);
        ctx.lineTo(i, 8 + Math.sin(i * 0.5) * 4);
        ctx.stroke();
      }

    } else if (type === 'waves') {
      ctx.beginPath();
      ctx.fillStyle = baseColor;
      ctx.moveTo(-85, 170);
      ctx.bezierCurveTo(-65, 120, -85, 70, -70, -20);
      ctx.bezierCurveTo(-70, -115, 70, -115, 70, -20);
      ctx.bezierCurveTo(85, 70, 65, 120, 85, 170);
      ctx.quadraticCurveTo(70, 180, 55, 160);
      ctx.bezierCurveTo(45, 110, 55, 60, 45, 30);
      ctx.bezierCurveTo(20, 35, -20, 35, -45, 30);
      ctx.bezierCurveTo(-55, 60, -45, 110, -55, 160);
      ctx.quadraticCurveTo(-70, 180, -85, 170);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;

      for (let offset = -75; offset <= 75; offset += 10) {
        if (Math.abs(offset) < 15) continue;
        
        ctx.beginPath();
        ctx.strokeStyle = offset % 20 === 0 ? highlightColor1 : highlightColor2;
        
        let startX = offset * 0.8;
        let startY = -80;
        ctx.moveTo(startX, startY);
        
        for (let y = -70; y <= 165; y += 10) {
          const waveX = startX + Math.sin(y * 0.05 + offset) * 12;
          ctx.lineTo(waveX, y);
        }
        ctx.stroke();
      }

      for (let i = -30; i <= 30; i += 6) {
        ctx.beginPath();
        ctx.strokeStyle = highlightColor2;
        ctx.moveTo(i * 0.3, -80);
        ctx.quadraticCurveTo(i, -40, i * 1.3, 20);
        ctx.stroke();
      }

    } else if (type === 'afro') {
      ctx.beginPath();
      ctx.fillStyle = baseColor;
      
      const c_x = 0;
      const c_y = -20;
      const radius = 100;
      
      ctx.moveTo(radius, c_y);
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.15) {
        const x = c_x + Math.cos(angle) * radius;
        const y = c_y + Math.sin(angle) * radius;
        const puffX = x + Math.cos(angle * 6) * 8;
        const puffY = y + Math.sin(angle * 6) * 8;
        ctx.lineTo(puffX, puffY);
      }
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.5;

      const coilsCount = 120;
      for (let i = 0; i < coilsCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 90;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist - 20;

        if (Math.abs(x) < 35 && y > -10 && y < 60) continue;

        ctx.beginPath();
        ctx.strokeStyle = i % 3 === 0 ? highlightColor1 : highlightColor2;
        ctx.arc(x, y, 4 + Math.random() * 5, 0, Math.PI * 1.5 + Math.random() * Math.PI);
        ctx.stroke();
      }

    } else if (type === 'curly') {
      ctx.beginPath();
      ctx.fillStyle = baseColor;
      ctx.moveTo(-80, 160);
      ctx.bezierCurveTo(-70, 70, -80, 10, -65, -30);
      ctx.bezierCurveTo(-65, -110, 65, -110, 65, -30);
      ctx.bezierCurveTo(80, 10, 70, 70, 80, 160);
      ctx.quadraticCurveTo(65, 170, 50, 150);
      ctx.bezierCurveTo(45, 80, 45, 30, 40, 20);
      ctx.bezierCurveTo(15, 25, -15, 25, -40, 20);
      ctx.bezierCurveTo(-45, 80, -45, 30, -50, 150);
      ctx.quadraticCurveTo(-65, 170, -80, 160);
      ctx.closePath();
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.8;

      for (let offset = -70; offset <= 70; offset += 12) {
        if (Math.abs(offset) < 18) continue;
        
        ctx.beginPath();
        ctx.strokeStyle = offset % 24 === 0 ? highlightColor1 : highlightColor2;
        
        let cx_pos = offset * 0.85;
        let cy_pos = -75;
        ctx.moveTo(cx_pos, cy_pos);
        
        for (let y = -70; y <= 150; y += 8) {
          const curlX = cx_pos + Math.sin(y * 0.3) * 8;
          ctx.lineTo(curlX, y);
        }
        ctx.stroke();
      }

      for (let i = -30; i <= 30; i += 8) {
        ctx.beginPath();
        ctx.strokeStyle = highlightColor2;
        ctx.moveTo(i * 0.4, -75);
        ctx.quadraticCurveTo(i, -30, i * 1.2, 15);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Draw loop
  let time = 0;
  function draw() {
    time += 0.04;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw solid dark background
    ctx.fillStyle = '#090812';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2. Draw background scan grid lines
    ctx.strokeStyle = 'rgba(212, 163, 115, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '12px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('[ 3D PRESET SILHOUETTE VIEWPORT ]', canvas.width / 2, canvas.height / 2 + 80);

    // 3. Draw biometric scanner effect if scanning
    if (isScanning) {
      scanProgress += 0.05;
      const scanY = (Math.sin(time * 2.5) * 0.5 + 0.5) * canvas.height;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(212, 163, 115, 0.6)';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'var(--accent-gold)';
      ctx.shadowBlur = 10;
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;

      ctx.fillStyle = 'var(--accent-gold)';
      ctx.font = '700 13px Outfit';
      ctx.fillText('Scanning Biometrics...', canvas.width / 2, canvas.height / 2 + 100);
    }

    // 4. Draw static preset hairstyle silhouette in center of screen
    const activeCard = document.querySelector('.carousel-card.active');
    let currentHue = 330;
    if (activeCard) {
      currentHue = parseInt(activeCard.getAttribute('data-hue') || '330');
    }

    drawHairstyle(ctx, activeStyleName, canvas.width / 2, canvas.height / 2 - 20, 1.05, currentHue);

    requestAnimationFrame(draw);
  }
  draw();

  return {
    triggerBiometricScan: (callback) => {
      isScanning = true;
      setTimeout(() => {
        isScanning = false;
        if (callback) callback();
      }, 2000);
    },
    updateParameters: (stylePreset, lengthValNum, hueValNum) => {
      let lookbookKey = 'bob';
      let presetKey = 'bob-sleek';
      if (stylePreset === 'straight') {
        lookbookKey = 'bob';
        presetKey = 'bob-sleek';
      } else if (stylePreset === 'wavy') {
        lookbookKey = 'waves';
        presetKey = 'waves-beach';
      } else if (stylePreset === 'curly') {
        lookbookKey = 'curly';
        presetKey = 'curly-volume';
      } else if (stylePreset === 'afro' || stylePreset === 'coily') {
        lookbookKey = 'afro';
        presetKey = 'afro-coils';
      } else if (stylePreset === 'pixie') {
        lookbookKey = 'pixie';
        presetKey = 'pixie-chic';
      }

      const targetCard = Array.from(carouselCards).find(c => c.getAttribute('data-preset') === presetKey);
      if (targetCard) {
        carouselCards.forEach(c => c.classList.remove('active'));
        targetCard.classList.add('active');
      }

      activeStyleName = lookbookKey;
      updateLookbookDetails(presetKey);
      updateStyleRecipe();
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
      quizCardBox.style.display = 'none';
      
      if (labEngine) {
        document.getElementById('styling-lab').scrollIntoView({ behavior: 'smooth' });
        
        labEngine.triggerBiometricScan(() => {
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
    let hue = 330; 

    if (selections.texture === 'straight') {
      recommendedStyle = 'Dry-Cut Sculpted Bob';
      preset = 'straight';
      length = 3.5;
    } else if (selections.texture === 'wavy') {
      recommendedStyle = 'Textured Coastal Waves';
      preset = 'wavy';
      length = 5.2;
      hue = 30; 
    } else if (selections.texture === 'curly') {
      recommendedStyle = 'Volumetric Layered Shag';
      preset = 'curly';
      length = 6.0;
      hue = 48; 
    } else if (selections.texture === 'coily') {
      recommendedStyle = 'Sculpted Halo Afro Coil';
      preset = 'afro';
      length = 4.0;
      hue = 20; 
    }

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

    document.getElementById('report-silhouette').textContent = recommendedStyle;
    document.getElementById('report-treatment').textContent = recommendedTreatment;
    document.getElementById('report-price').textContent = `R ${cost}`;
    
    globalBookingState.service = `${recommendedStyle} & ${recommendedTreatment}`;
    globalBookingState.price = `R ${cost}`;
    globalBookingState.diagnosticRecommended = true;

    quizResultsBox.style.display = 'block';

    setTimeout(() => {
      animateRadialGauge('gauge-hydration', hydration);
      animateRadialGauge('gauge-elasticity', elasticity);
      animateRadialGauge('gauge-porosity', porosity);
    }, 150);

    if (labEngine) {
      labEngine.updateParameters(preset, length, hue);
    }
  }

  function animateRadialGauge(id, val) {
    const fill = document.getElementById(`${id}-fill`);
    const valText = document.getElementById(`${id}-val`);
    if (fill && valText) {
      fill.setAttribute('stroke-dasharray', `${val}, 100`);
      valText.textContent = `${val}%`;
    }
  }

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

  bookDiagnosticBtn.addEventListener('click', () => {
    const chatDrawer = document.getElementById('chat-drawer');
    const badge = document.getElementById('chat-notification');
    if (chatDrawer) {
      chatDrawer.classList.add('open');
      if (badge) badge.style.display = 'none';
      
      const chatMessages = document.getElementById('chat-messages');
      if (chatMessages) {
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
      
      // Inject Download Receipt Button if booking successfully completed
      if (window.chatbotBookingStep === 0 && window.lastBookingReceiptData) {
        injectReceiptCardButton(chatMessages);
      }
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

    if (window.chatbotBookingStep > 0) {
      return handleBookingWizard(input, userInput);
    }

    if (input.includes('book') || input.includes('sched') || input.includes('appoint')) {
      window.chatbotBookingStep = 1;
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
        if (globalBookingState.diagnosticRecommended || globalBookingState.styleRecipe) {
          window.chatbotBookingStep = 4;
          return `Perfect. You're booked for: "${window.chatbotBookingData.service}". What date and time works best for you?`;
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
        
        // Save the booking details globally so the download card exporter can access them
        window.lastBookingReceiptData = {
          name: window.chatbotBookingData.name,
          phone: window.chatbotBookingData.phone,
          service: window.chatbotBookingData.service,
          stylist: globalBookingState.stylist || 'Assigned Stylist',
          date: window.chatbotBookingData.date,
          recipe: globalBookingState.styleRecipe || 'Classic Straight (Default)'
        };

        // Update WhatsApp float link to include snapshot notice + recipe details
        updateWhatsAppLink(window.lastBookingReceiptData);

        return `Perfect! Your booking draft is set:\n` +
               `• Client Name: ${window.lastBookingReceiptData.name}\n` +
               `• Contact: ${window.lastBookingReceiptData.phone}\n` +
               `• Service: ${window.lastBookingReceiptData.service}${stylistStr}\n` +
               `• Requested Date: ${window.lastBookingReceiptData.date}\n\n` +
               `Click the button below to download your Custom Stylist Receipt Card, containing your 3D design blueprint overlay to attach directly when you chat!`;
    }
  }

  function updateWhatsAppLink(data) {
    const waLink = document.querySelector('.wa-float');
    if (waLink) {
      const msg = `Hi Pixel Perfect Hair, I've booked an appointment!\n\n` +
                  `• Name: ${data.name}\n` +
                  `• Service: ${data.service}\n` +
                  `• Stylist: ${data.stylist}\n` +
                  `• Date: ${data.date}\n` +
                  `• 3D Style Blueprint: ${data.recipe}\n\n` +
                  `I have downloaded my Styling Prescription Card and attached it here!`;
      waLink.href = `https://wa.me/27214391234?text=${encodeURIComponent(msg)}`;
    }
  }

  function injectReceiptCardButton(container) {
    const btn = document.createElement('button');
    btn.className = 'download-receipt-btn';
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="vertical-align:middle; display:inline-block; margin-right:0.35rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Download Stylist Receipt Card`;
    
    btn.addEventListener('click', () => {
      generateAndDownloadReceiptImage(window.lastBookingReceiptData);
    });

    container.appendChild(btn);
    container.scrollTop = container.scrollHeight;
    
    // Clear last data so button isn't generated again until next appointment
    window.lastBookingReceiptData = null;
  }
}

/* ==========================================
   PRESCRIPTION CARD EXPORTER ENGINE
   ========================================== */
function generateAndDownloadReceiptImage(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  // 1. Draw premium background (Deep cosmic violet)
  ctx.fillStyle = '#090812';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle luxury background gradient lines
  ctx.strokeStyle = 'rgba(212, 163, 115, 0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }

  // 2. Draw outer glass border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

  // 3. Draw branding logo header
  ctx.fillStyle = '#f3f0f7';
  ctx.font = 'bold 22px Outfit, sans-serif';
  ctx.fillText('Pixel', 40, 50);
  
  // Rose gold gradient effect for "Perfect"
  const perfectGrad = ctx.createLinearGradient(100, 30, 180, 50);
  perfectGrad.addColorStop(0, '#d4a373');
  perfectGrad.addColorStop(1, '#e07a5f');
  ctx.fillStyle = perfectGrad;
  ctx.fillText('Perfect', 95, 50);

  ctx.fillStyle = '#a09cb0';
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.fillText('HAIR STYLING BLUEPRINT', 40, 72);

  // Draw separator line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 85);
  ctx.lineTo(canvas.width - 40, 85);
  ctx.stroke();

  // 4. Draw composite face styling snapshot
  if (globalBookingState.capturedImage) {
    const img = new Image();
    img.onload = () => {
      // Draw image in a framed glass box on the left
      ctx.strokeStyle = 'rgba(212, 163, 115, 0.2)';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 105, 260, 260);

      ctx.drawImage(img, 42, 107, 256, 256);
      
      // Draw watermark scanner lines over snapshot
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(42, 235);
      ctx.lineTo(298, 235);
      ctx.stroke();
      
      continueDrawingText();
    };
    img.src = globalBookingState.capturedImage;
  } else {
    // Draw generic placeholder box if no snapshot was taken
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(40, 105, 260, 260);
    ctx.strokeRect(40, 105, 260, 260);
    
    ctx.fillStyle = '#a09cb0';
    ctx.font = '12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('[ No Styling Image Captured ]', 170, 230);
    ctx.fillText('Use the styling lab to overlay photo', 170, 250);
    ctx.textAlign = 'left';

    continueDrawingText();
  }

  function continueDrawingText() {
    // 5. Draw scheduling & styling recipe details on the right
    const startX = 340;
    
    ctx.fillStyle = '#d4a373';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText('APPOINTMENT DETAILS', startX, 125);

    ctx.fillStyle = '#f3f0f7';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillText(data.name || 'Anonymous Client', startX, 150);

    ctx.fillStyle = '#a09cb0';
    ctx.font = '13px Outfit, sans-serif';
    ctx.fillText(`Contact: ${data.phone || 'N/A'}`, startX, 172);
    ctx.fillText(`Scheduled: ${data.date || 'To Be Scheduled'}`, startX, 192);
    ctx.fillText(`Stylist Assigned: ${data.stylist || 'Any Stylist'}`, startX, 212);

    // Separator
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.moveTo(startX, 230);
    ctx.lineTo(canvas.width - 40, 230);
    ctx.stroke();

    ctx.fillStyle = '#e07a5f';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText('STYLE RECIPE SPECIFICATION', startX, 255);

    ctx.fillStyle = '#f3f0f7';
    ctx.font = '11px Outfit, sans-serif';
    
    // Split multi-line recipe strings to fit nicely on the voucher card
    const recipeStr = data.recipe || 'Classic Straight (Default)';
    const recipeLines = recipeStr.split('\n');
    let currentY = 274;
    recipeLines.forEach((line) => {
      if (currentY < 320) {
        ctx.fillText(line, startX, currentY);
        currentY += 13;
      }
    });

    // Recommended Price Card Box
    ctx.fillStyle = 'rgba(212, 163, 115, 0.05)';
    ctx.strokeStyle = 'rgba(212, 163, 115, 0.15)';
    ctx.fillRect(startX, 325, 340, 40);
    ctx.strokeRect(startX, 325, 340, 40);

    ctx.fillStyle = '#a09cb0';
    ctx.font = '12px Outfit, sans-serif';
    ctx.fillText('Estimated Booking Total:', startX + 15, 349);

    ctx.fillStyle = '#d4a373';
    ctx.font = 'bold 15px Outfit, sans-serif';
    ctx.fillText(globalBookingState.price || 'R 650', startX + 245, 349);

    // 6. Automatically trigger download
    const finalURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `pixel-perfect-prescription-${(data.name || 'client').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = finalURL;
    link.click();
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
        
        cards.forEach(c => {
          c.classList.remove('selected-stylist');
          const cb = c.querySelector('.select-stylist-btn');
          if (cb) cb.textContent = `Select ${c.getAttribute('data-stylist')}`;
        });

        card.classList.add('selected-stylist');
        btn.textContent = 'Selected';
        globalBookingState.stylist = name;

        const chatDrawer = document.getElementById('chat-drawer');
        const badge = document.getElementById('chat-notification');
        if (chatDrawer) {
          chatDrawer.classList.add('open');
          if (badge) badge.style.display = 'none';

          const chatMessages = document.getElementById('chat-messages');
          if (chatMessages) {
            const id = 'prepopulated-stylist-selection';
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
