/**
 * SHREE RANI GEHNA — HAUTE JOAILLERIE
 * Masterpiece 240-Frame Scrollytelling & 360° Studio Engine
 * White Minimalist Luxury Edition
 */

(function () {
  'use strict';

  // --- Configuration ---
  const TOTAL_FRAMES = 240;
  const FRAME_DIR = 'ezgif-46bd264d131a9205-jpg';
  const FRAME_PREFIX = 'ezgif-frame-';
  const FRAME_EXT = '.jpg';

  // State Management
  const state = {
    images: [],
    loadedCount: 0,
    isLoaded: false,
    currentFrame: 0,
    targetFrame: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartFrame: 0,
    studioMode: false, // false = Scrollytelling, true = 360 Free Drag
    loupeMode: false,
    loupePos: { x: 0, y: 0, normX: 0.5, normY: 0.5 },
    activeAct: 1,
    audioEnabled: false,
    audioCtx: null,
    audioNodes: null
  };

  // DOM Elements
  const preloader = document.getElementById('preloader');
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const progressStatus = document.getElementById('progressStatus');
  const enterArchiveBtn = document.getElementById('enterArchiveBtn');

  const mainHeader = document.getElementById('mainHeader');
  const canvas = document.getElementById('jewelryCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const canvasViewport = document.getElementById('canvasViewport');

  const loupeLens = document.getElementById('loupeLens');
  const loupeCanvas = document.getElementById('loupeCanvas');
  const loupeCtx = loupeCanvas ? loupeCanvas.getContext('2d') : null;
  const loupeCoords = document.getElementById('loupeCoords');

  const hudActName = document.getElementById('hudActName');
  const hudDegrees = document.getElementById('hudDegrees');
  const hudFrame = document.getElementById('hudFrame');
  const timelineFill = document.getElementById('timelineFill');
  const timelineHandle = document.getElementById('timelineHandle');
  const timelineTrack = document.getElementById('timelineTrack');

  const btnScrollMode = document.getElementById('btnScrollMode');
  const btnFreeSpin = document.getElementById('btnFreeSpin');
  const btnLoupeMode = document.getElementById('btnLoupeMode');
  const studioModeBtn = document.getElementById('studioModeBtn');
  const dragModeHint = document.getElementById('dragModeHint');

  const scrollTrack = document.getElementById('scrollTrack');
  const steps = document.querySelectorAll('.scrolly-step');
  const dockItems = document.querySelectorAll('.dock-item');
  const hotspots = document.querySelectorAll('.hotspot');

  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const soundBars = document.getElementById('soundBars');
  const audioLabel = document.getElementById('audioLabel');

  const conciergeModal = document.getElementById('conciergeModal');
  const openConciergeBtn = document.getElementById('openConciergeBtn');
  const btnRequestPrivateSuite = document.getElementById('btnRequestPrivateSuite');
  const btnOpenSalonModal = document.getElementById('btnOpenSalonModal');
  const closeConciergeBtn = document.getElementById('closeConciergeBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const conciergeForm = document.getElementById('conciergeForm');

  const btnVerifyCertificate = document.getElementById('btnVerifyCertificate');
  const btnRunLookup = document.getElementById('btnRunLookup');
  const ledgerInput = document.getElementById('ledgerInput');

  const customCursor = document.getElementById('customCursor');
  const customCursorDot = document.getElementById('customCursorDot');

  // --- Helper: Zero Pad Numbers (e.g. 1 -> "001") ---
  function padZero(num, size = 3) {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  // --- Image Preloading Pipeline ---
  function initPreloader() {
    const framePromises = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = padZero(i, 3);
      const src = `${FRAME_DIR}/${FRAME_PREFIX}${frameNum}${FRAME_EXT}`;

      const p = new Promise((resolve) => {
        img.onload = () => {
          state.loadedCount++;
          updateLoadingProgress();
          resolve(img);
        };
        img.onerror = () => {
          console.warn(`Frame failed to load: ${src}`);
          state.loadedCount++;
          updateLoadingProgress();
          resolve(img);
        };
      });

      img.src = src;
      state.images.push(img);
      framePromises.push(p);
    }

    Promise.all(framePromises).then(() => {
      onAllFramesLoaded();
    });
  }

  function updateLoadingProgress() {
    const percent = Math.min(100, Math.floor((state.loadedCount / TOTAL_FRAMES) * 100));
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${percent}%`;

    if (percent < 30) {
      if (progressStatus) progressStatus.textContent = 'Calibrating 180° Royal Optics...';
    } else if (percent < 75) {
      if (progressStatus) progressStatus.textContent = 'Polishing 22K Solid Gold Reflections...';
    } else if (percent < 99) {
      if (progressStatus) progressStatus.textContent = 'Aligning Syndicate Polki Diamonds...';
    } else {
      if (progressStatus) progressStatus.textContent = 'Masterpiece Calibrated & Authenticated.';
    }
  }

  function onAllFramesLoaded() {
    state.isLoaded = true;
    resizeCanvases();
    renderFrame(0);

    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('loaded');
      }
    }, 450);
  }

  if (enterArchiveBtn) {
    enterArchiveBtn.addEventListener('click', () => {
      if (preloader) preloader.classList.add('loaded');
    });
  }

  // --- High-DPI Canvas Setup & Resizing ---
  function resizeCanvases() {
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvasViewport ? canvasViewport.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    if (loupeCanvas && loupeCtx) {
      loupeCanvas.width = 200 * dpr;
      loupeCanvas.height = 200 * dpr;
      loupeCtx.scale(dpr, dpr);
    }

    renderFrame(Math.round(state.currentFrame));
  }

  window.addEventListener('resize', resizeCanvases);

  // --- Canvas Frame Drawing with Smart Aspect Ratio Fit ---
  function renderFrame(frameIndex) {
    if (!ctx || !state.images.length) return;

    const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex));
    const img = state.images[clampedIndex];

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasW = canvas.width / dpr;
    const canvasH = canvas.height / dpr;

    // Clear background to pure white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // High quality interpolation
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Aspect Ratio "Contain" logic with fullscreen presence
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasW / canvasH;

    let drawW, drawH, drawX, drawY;

    // Scale factor to make the jewelry immersive, full screen, and high quality
    const scaleFactor = window.innerWidth <= 768 ? 0.98 : 0.96;

    if (canvasRatio > imgRatio) {
      drawH = canvasH * scaleFactor;
      drawW = drawH * imgRatio;
    } else {
      drawW = canvasW * scaleFactor;
      drawH = drawW / imgRatio;
    }

    drawX = (canvasW - drawW) / 2;
    drawY = (canvasH - drawH) / 2;

    // Draw the main jewelry image with high precision
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Update Loupe Lens if active
    if (state.loupeMode && loupeCtx && loupeLens && loupeLens.classList.contains('active')) {
      renderLoupe(img, drawX, drawY, drawW, drawH);
    }

    // Update HUD display
    updateHud(clampedIndex);
  }

  // --- Magnifying Loupe Render ---
  function renderLoupe(img, drawX, drawY, drawW, drawH) {
    const loupeSize = 200;
    const zoomFactor = 3.5;

    loupeCtx.clearRect(0, 0, loupeSize, loupeSize);

    // Calculate mouse position relative to image
    const relX = state.loupePos.x - drawX;
    const relY = state.loupePos.y - drawY;

    if (relX >= 0 && relX <= drawW && relY >= 0 && relY <= drawH) {
      const srcW = (loupeSize / zoomFactor) * (img.naturalWidth / drawW);
      const srcH = (loupeSize / zoomFactor) * (img.naturalHeight / drawH);
      const srcX = (relX / drawW) * img.naturalWidth - srcW / 2;
      const srcY = (relY / drawH) * img.naturalHeight - srcH / 2;

      loupeCtx.drawImage(
        img,
        Math.max(0, srcX),
        Math.max(0, srcY),
        srcW,
        srcH,
        0,
        0,
        loupeSize,
        loupeSize
      );
    }
  }

  // --- Update HUD Indicators ---
  function updateHud(frameIndex) {
    const degrees = Math.round((frameIndex / (TOTAL_FRAMES - 1)) * 360);
    if (hudDegrees) hudDegrees.textContent = `${padZero(degrees, 3)}°`;
    if (hudFrame) hudFrame.textContent = `${padZero(frameIndex + 1, 3)} / ${TOTAL_FRAMES}`;

    const progressFraction = frameIndex / (TOTAL_FRAMES - 1);
    if (timelineFill) timelineFill.style.width = `${progressFraction * 100}%`;
    if (timelineHandle) timelineHandle.style.left = `${progressFraction * 100}%`;

    // Dynamic Act Name update
    let actNum = 1;
    let actTitle = 'ACT I • THE IMPERIAL SILHOUETTE';

    if (frameIndex >= 180) {
      actNum = 4;
      actTitle = 'ACT IV • THE ROYAL SEAL & CLASP';
    } else if (frameIndex >= 120) {
      actNum = 3;
      actTitle = 'ACT III • SYNDICATE POLKI & EMERALDS';
    } else if (frameIndex >= 60) {
      actNum = 2;
      actTitle = 'ACT II • SACRED NAKSHI REPOUSSÉ';
    }

    if (state.activeAct !== actNum) {
      state.activeAct = actNum;
      if (hudActName) hudActName.textContent = actTitle;
      updateDock(actNum);
    }

    // Dynamic Hotspot Visibility Sync
    updateHotspots(frameIndex);
  }

  function updateDock(activeAct) {
    dockItems.forEach((item) => {
      const ch = parseInt(item.getAttribute('data-chapter'), 10);
      if (ch === activeAct) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function updateHotspots(frameIndex) {
    // Hotspot 1 (Nakshi) active around frames 20 to 115
    const hs1 = document.getElementById('hotspot1');
    if (hs1) {
      hs1.style.opacity = (frameIndex >= 20 && frameIndex <= 115) ? '1' : '0.15';
      hs1.style.pointerEvents = (frameIndex >= 20 && frameIndex <= 115) ? 'auto' : 'none';
    }

    // Hotspot 2 (Polki) active around frames 80 to 185
    const hs2 = document.getElementById('hotspot2');
    if (hs2) {
      hs2.style.opacity = (frameIndex >= 80 && frameIndex <= 185) ? '1' : '0.15';
      hs2.style.pointerEvents = (frameIndex >= 80 && frameIndex <= 185) ? 'auto' : 'none';
    }

    // Hotspot 3 (Emeralds) active around frames 120 to 235
    const hs3 = document.getElementById('hotspot3');
    if (hs3) {
      hs3.style.opacity = (frameIndex >= 120 && frameIndex <= 235) ? '1' : '0.15';
      hs3.style.pointerEvents = (frameIndex >= 120 && frameIndex <= 235) ? 'auto' : 'none';
    }
  }

  // --- Smooth Animation Render Loop (Lerp Engine) ---
  function animationLoop() {
    if (state.isLoaded) {
      const delta = state.targetFrame - state.currentFrame;

      if (Math.abs(delta) > 0.01) {
        // High-precision smooth lerp interpolation
        state.currentFrame += delta * 0.12;
        renderFrame(Math.round(state.currentFrame));
      }
    }

    requestAnimationFrame(animationLoop);
  }

  requestAnimationFrame(animationLoop);

  // --- Scroll Synchronizer ---
  function onScroll() {
    // Header shadow state
    if (window.scrollY > 80) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }

    // If user is in 360 Free Drag mode, ignore scroll calculation for canvas frame
    if (state.studioMode) return;

    if (!scrollTrack) return;

    const trackRect = scrollTrack.getBoundingClientRect();
    const trackTop = trackRect.top;
    const trackHeight = trackRect.height - window.innerHeight;

    if (trackHeight <= 0) return;

    const progress = Math.max(0, Math.min(1, -trackTop / trackHeight));
    state.targetFrame = progress * (TOTAL_FRAMES - 1);

    // Sync narrative chapter step cards active states
    steps.forEach((step) => {
      const stepRect = step.getBoundingClientRect();
      const stepCenter = stepRect.top + stepRect.height / 2;
      const windowCenter = window.innerHeight / 2;

      if (Math.abs(stepCenter - windowCenter) < window.innerHeight * 0.45) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Interactive 360° Studio Drag & Spin Mechanics ---
  function setupDragStudio() {
    if (!canvas) return;

    const startDrag = (clientX) => {
      if (!state.studioMode) return;
      state.isDragging = true;
      state.dragStartX = clientX;
      state.dragStartFrame = state.currentFrame;
      triggerSoundHaptic(600, 0.03);
    };

    const moveDrag = (clientX) => {
      if (!state.isDragging || !state.studioMode) return;
      const deltaX = clientX - state.dragStartX;
      const sensitivity = 0.45;
      let newFrame = (state.dragStartFrame - deltaX * sensitivity) % TOTAL_FRAMES;
      if (newFrame < 0) newFrame += TOTAL_FRAMES;
      state.targetFrame = newFrame;
      state.currentFrame = newFrame;
    };

    const endDrag = () => {
      state.isDragging = false;
    };

    // Mouse events
    canvas.addEventListener('mousedown', (e) => startDrag(e.clientX));
    window.addEventListener('mousemove', (e) => {
      if (state.isDragging) moveDrag(e.clientX);

      // Update Loupe position
      if (state.loupeMode) {
        const rect = canvas.getBoundingClientRect();
        state.loupePos.x = e.clientX - rect.left;
        state.loupePos.y = e.clientY - rect.top;

        if (loupeLens) {
          loupeLens.style.left = `${e.clientX}px`;
          loupeLens.style.top = `${e.clientY}px`;
        }

        renderFrame(Math.round(state.currentFrame));
      }
    });
    window.addEventListener('mouseup', endDrag);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) startDrag(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (state.isDragging && e.touches.length === 1) {
        moveDrag(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', endDrag);
  }

  setupDragStudio();

  // --- Scrubber Click / Drag ---
  if (timelineTrack) {
    const handleScrub = (e) => {
      const rect = timelineTrack.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const fraction = clickX / rect.width;
      state.targetFrame = fraction * (TOTAL_FRAMES - 1);
      state.currentFrame = state.targetFrame;
      renderFrame(Math.round(state.currentFrame));
      triggerSoundHaptic(520, 0.05);
    };

    timelineTrack.addEventListener('click', handleScrub);
  }

  // --- Mode Switching Handlers ---
  function setStudioMode(enable) {
    state.studioMode = enable;
    if (enable) {
      btnFreeSpin?.classList.add('active');
      btnScrollMode?.classList.remove('active');
      studioModeBtn?.classList.add('active');
      dragModeHint?.classList.add('visible');
      setTimeout(() => dragModeHint?.classList.remove('visible'), 3500);
    } else {
      btnScrollMode?.classList.add('active');
      btnFreeSpin?.classList.remove('active');
      studioModeBtn?.classList.remove('active');
      dragModeHint?.classList.remove('visible');
      onScroll();
    }
  }

  function toggleLoupeMode() {
    state.loupeMode = !state.loupeMode;
    if (state.loupeMode) {
      btnLoupeMode?.classList.add('active');
      loupeLens?.classList.add('active');
      triggerSoundHaptic(880, 0.08);
    } else {
      btnLoupeMode?.classList.remove('active');
      loupeLens?.classList.remove('active');
      renderFrame(Math.round(state.currentFrame));
    }
  }

  if (btnScrollMode) btnScrollMode.addEventListener('click', () => setStudioMode(false));
  if (btnFreeSpin) btnFreeSpin.addEventListener('click', () => setStudioMode(true));
  if (studioModeBtn) studioModeBtn.addEventListener('click', () => setStudioMode(!state.studioMode));
  if (btnLoupeMode) btnLoupeMode.addEventListener('click', toggleLoupeMode);

  // --- Chapter Dock & Scroll-to Nav Links ---
  document.querySelectorAll('[data-scroll-to]').forEach((elem) => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPos = parseInt(elem.getAttribute('data-scroll-to'), 10);
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  });

  dockItems.forEach((item) => {
    item.addEventListener('click', () => {
      const ch = parseInt(item.getAttribute('data-chapter'), 10);
      const targetStep = document.getElementById(`step${ch}`);
      if (targetStep && scrollTrack) {
        const stepTop = targetStep.offsetTop;
        window.scrollTo({ top: stepTop, behavior: 'smooth' });
      }
    });
  });

  // --- Custom Minimal Cursor Mechanics ---
  function initCustomCursor() {
    if (!customCursor || !customCursorDot) return;

    window.addEventListener('mousemove', (e) => {
      customCursor.style.left = `${e.clientX}px`;
      customCursor.style.top = `${e.clientY}px`;
      customCursorDot.style.left = `${e.clientX}px`;
      customCursorDot.style.top = `${e.clientY}px`;
    });

    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, .hotspot, .timeline-track');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => customCursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => customCursor.classList.remove('hovering'));
    });
  }

  initCustomCursor();

  // --- Atelier Web Audio API Synthesizer ---
  function initAudioSynthesizer() {
    if (!audioToggleBtn) return;

    audioToggleBtn.addEventListener('click', () => {
      if (!state.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AudioContext();
      }

      if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
      }

      state.audioEnabled = !state.audioEnabled;

      if (state.audioEnabled) {
        startAmbientSoundscape();
        soundBars?.classList.add('playing');
        if (audioLabel) audioLabel.textContent = 'Atelier Audio : Pure Resonance';
      } else {
        stopAmbientSoundscape();
        soundBars?.classList.remove('playing');
        if (audioLabel) audioLabel.textContent = 'Atelier Audio : Muted';
      }
    });
  }

  function startAmbientSoundscape() {
    if (!state.audioCtx) return;

    // Create soothing binaural drone oscillators reminiscent of royal temple acoustic resonance
    const osc1 = state.audioCtx.createOscillator();
    const osc2 = state.audioCtx.createOscillator();
    const gainNode = state.audioCtx.createGain();
    const filter = state.audioCtx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(216, state.audioCtx.currentTime); // 432Hz harmonic / 2

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(324, state.audioCtx.currentTime); // 5th harmonic

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, state.audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.001, state.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.04, state.audioCtx.currentTime + 3);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(state.audioCtx.destination);

    osc1.start();
    osc2.start();

    state.audioNodes = { osc1, osc2, gainNode };
  }

  function stopAmbientSoundscape() {
    if (state.audioNodes && state.audioCtx) {
      state.audioNodes.gainNode.gain.linearRampToValueAtTime(0.0001, state.audioCtx.currentTime + 0.8);
      setTimeout(() => {
        state.audioNodes?.osc1.stop();
        state.audioNodes?.osc2.stop();
        state.audioNodes = null;
      }, 900);
    }
  }

  function triggerSoundHaptic(freq = 550, duration = 0.04) {
    if (!state.audioEnabled || !state.audioCtx) return;
    try {
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, state.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, state.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(state.audioCtx.destination);
      osc.start();
      osc.stop(state.audioCtx.currentTime + duration);
    } catch (e) {
      // Ignore audio glitches
    }
  }

  initAudioSynthesizer();

  // --- Provenance Ledger Certificate Verifier ---
  if (btnRunLookup && ledgerInput) {
    btnRunLookup.addEventListener('click', () => {
      const serial = ledgerInput.value.trim().toUpperCase();
      const certCard = document.getElementById('certificateCard');
      const certBadge = document.getElementById('certBadge');
      const certSerial = document.getElementById('certSerial');
      const certPieceName = document.getElementById('certPieceName');

      if (!serial) {
        alert('Please enter a valid serial cipher.');
        return;
      }

      triggerSoundHaptic(720, 0.08);

      // Animate verification
      if (certBadge) {
        certBadge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AUTHENTICATING...';
        certBadge.style.color = 'var(--gold-antique)';
      }

      setTimeout(() => {
        if (certBadge) {
          certBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> VERIFIED HEIRLOOM';
          certBadge.style.color = '#1a7f37';
        }
        if (certSerial) certSerial.textContent = serial;

        if (serial.includes('002') || serial.includes('MAYURA')) {
          if (certPieceName) certPieceName.textContent = 'The Mayura Surya Kanthi Choker';
        } else if (serial.includes('003') || serial.includes('NAVRATNA')) {
          if (certPieceName) certPieceName.textContent = 'The Maharani Navratna Sovereign Collar';
        } else if (serial.includes('004') || serial.includes('HANSLI')) {
          if (certPieceName) certPieceName.textContent = 'The Padmavati Chandravanshi Hansli';
        } else {
          if (certPieceName) certPieceName.textContent = 'The Rajputana Empress Haar (Flagship)';
        }

        if (certCard) {
          certCard.style.boxShadow = '0 0 35px rgba(197, 168, 128, 0.35)';
          setTimeout(() => {
            certCard.style.boxShadow = 'var(--shadow-float)';
          }, 1500);
        }
      }, 600);
    });
  }

  if (btnVerifyCertificate) {
    btnVerifyCertificate.addEventListener('click', () => {
      const provSec = document.getElementById('provenance');
      if (provSec) {
        provSec.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          btnRunLookup?.click();
        }, 800);
      }
    });
  }

  // --- Private Salon Suite Concierge Modal ---
  function openModal(pieceName) {
    if (!conciergeModal) return;
    conciergeModal.classList.add('active');
    conciergeModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (pieceName) {
      const select = document.getElementById('interestMasterpiece');
      if (select) select.value = pieceName;
    }
  }

  function closeModal() {
    if (!conciergeModal) return;
    conciergeModal.classList.remove('active');
    conciergeModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openConciergeBtn) openConciergeBtn.addEventListener('click', () => openModal());
  if (btnRequestPrivateSuite) btnRequestPrivateSuite.addEventListener('click', () => openModal('The Rajputana Empress Haar'));
  if (btnOpenSalonModal) btnOpenSalonModal.addEventListener('click', () => openModal());
  if (closeConciergeBtn) closeConciergeBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  document.querySelectorAll('.btn-inquire').forEach((btn) => {
    btn.addEventListener('click', () => {
      const piece = btn.getAttribute('data-item');
      openModal(piece);
    });
  });

  if (conciergeForm) {
    conciergeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const honorific = document.getElementById('clientHonorific')?.value;
      const salon = document.getElementById('salonLocation')?.value;
      const date = document.getElementById('appointmentDate')?.value;

      alert(`Honored ${honorific},\n\nYour confidential reservation request at ${salon} on ${date} has been inscribed in our Private Salon registry.\n\nOur Master Concierge will contact you shortly with bespoke security protocols and salon suite access.`);
      closeModal();
      conciergeForm.reset();
    });
  }

  // --- Kickoff Preloader ---
  window.addEventListener('DOMContentLoaded', () => {
    initPreloader();
  });

})();
