document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.quiz-slide'));
  const slideByStep = new Map(slides.map((s) => [s.dataset.step, s]));
  let autoTimer;

  const autoAdvance = {
    preloading: { next: 'manual-select-1', delay: 5000 },
    'manual-loading-1': { next: 'manual-result-1', delay: 3000 },
    'manual-loading-2': { next: 'manual-result-2', delay: 3000 },
    'ia-activate': { next: 'guided-select-1', delay: 4000 },
    'ia-loading-1': { next: 'ia-result-1', delay: 3000 },
    'ia-loading-2': { next: 'summary', delay: 3000 },
  };

  const cashSlides = new Set(['ia-result-1', 'summary']);
  const failSlides = new Set(['manual-result-1', 'manual-result-2']);

  const audioClips = {
    click: 'money-pickup-2-89563.mp3',
    cash: 'cashier-quotka-chingquot-sound-effect-129698.mp3',
    fail: 'error-126627.mp3',
  };

  const audioCache = new Map();

  const manualRounds = {
    1: { select: 'manual-select-1', loading: 'manual-loading-1', result: 'manual-result-1' },
    2: { select: 'manual-select-2', loading: 'manual-loading-2', result: 'manual-result-2' },
  };

  const guidedRounds = {
    1: {
      select: 'guided-select-1',
      loading: 'ia-loading-1',
      next: 'ia-result-1',
      sequence: [7, 3, 11, 14, 18, 20, 21, 5, 9, 1, 24, 25, 6, 12, 15],
      progressKey: 'guided-1',
    },
    2: {
      select: 'guided-select-2',
      loading: 'ia-loading-2',
      next: null,
      sequence: [2, 4, 8, 10, 13, 16, 19, 22, 3, 17, 23, 11, 5, 7, 24],
      progressKey: 'guided-2',
    },
  };

  const manualState = new Map();
  const guidedState = new Map();
  const iaActivationDisplay = createIaActivationDisplay();

  initManualGrids();
  initGuidedGrids();
  initTestimonialSlider();
  initHublaLink();
  wireControls();

  function fbSafeTrack(event, params) {
    if (typeof fbq === 'function') {
      if (params) {
        fbq('track', event, params);
      } else {
        fbq('track', event);
      }
    }
  }

  function fbSafeTrackCustom(event, params) {
    if (typeof fbq === 'function') {
      fbq('trackCustom', event, params);
    }
  }

  function wireControls() {
    document.body.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const nextBtn = target.closest('[data-next]');
      if (nextBtn) {
        const step = nextBtn.getAttribute('data-next');
        if (step) {
          if (step === 'preloading') {
            fbSafeTrack('Lead');
          }
          showSlide(step);
        }
        return;
      }

      const manualBtn = target.closest('[data-action="verify-manual"]');
      if (manualBtn) {
        const round = Number(manualBtn.dataset.round);
        handleManualVerification(round, manualBtn);
        return;
      }
    });
  }

  function showSlide(step) {
    if (!slideByStep.has(step)) return;
    slides.forEach((slide) => slide.classList.toggle('is-active', slide.dataset.step === step));
    clearTimeout(autoTimer);
    const config = autoAdvance[step];
    if (config?.next) {
      autoTimer = window.setTimeout(() => showSlide(config.next), config.delay);
    }
    if (step === 'manual-select-1' || step === 'manual-select-2') {
      resetManualRound(Number(step.endsWith('2') ? 2 : 1));
    }
    if (step === 'guided-select-1') {
      resetGuidedRound(1);
    }
    if (step === 'guided-select-2') {
      resetGuidedRound(2);
    }
    if (cashSlides.has(step)) playCashSound();
    if (failSlides.has(step)) playFailSound();
    if (step === 'ia-activate') {
      iaActivationDisplay.start();
    } else {
      iaActivationDisplay.stop();
    }

    switch (step) {
      case 'manual-select-1':
        fbSafeTrackCustom('Quiz_Manual1_Start');
        break;
      case 'manual-select-2':
        fbSafeTrackCustom('Quiz_Manual2_Start');
        break;
      case 'manual-result-1':
        fbSafeTrackCustom('Quiz_Manual1_Result');
        break;
      case 'manual-result-2':
        fbSafeTrackCustom('Quiz_Manual2_Result');
        break;
      case 'ia-activate':
        fbSafeTrackCustom('IA_Activated');
        break;
      case 'guided-select-1':
        fbSafeTrackCustom('Quiz_IA1_Start');
        break;
      case 'ia-result-1':
        fbSafeTrackCustom('Quiz_IA1_Result');
        break;
      case 'guided-select-2':
        fbSafeTrackCustom('Quiz_IA2_Start');
        break;
      case 'ia-result-2':
        fbSafeTrackCustom('Quiz_IA2_Result');
        break;
      case 'summary':
        fbSafeTrack('CompleteRegistration');
        break;
      case 'offer':
        fbSafeTrack('InitiateCheckout');
        break;
      default:
        break;
    }
  }

  function initManualGrids() {
    document.querySelectorAll('.number-grid[data-mode="manual"]').forEach((grid) => {
      const round = Number(grid.dataset.round);
      manualState.set(round, {
        selected: new Set(),
        limit: 15,
        grid,
        feedback: attachManualFeedback(grid),
      });
      populateNumberButtons(grid, (value, button) => toggleManualNumber(round, value, button));
      updateManualFeedback(round);
    });
  }

  function attachManualFeedback(grid) {
    const feedback = document.createElement('p');
    feedback.className = 'validation-message';
    feedback.setAttribute('aria-live', 'polite');
    grid.insertAdjacentElement('afterend', feedback);
    return feedback;
  }

  function populateNumberButtons(container, onClick) {
    container.innerHTML = '';
    for (let i = 1; i <= 25; i += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(i).padStart(2, '0');
      button.dataset.value = String(i);
      button.addEventListener('click', () => onClick(i, button));
      container.appendChild(button);
    }
  }

  function toggleManualNumber(round, value, button) {
    const state = manualState.get(round);
    if (!state) return;
    const { selected, limit } = state;

    if (selected.has(value)) {
      selected.delete(value);
      button.classList.remove('selected');
      playClickSound();
    } else {
      if (selected.size >= limit) {
        flashManualLimit(round);
        return;
      }
      selected.add(value);
      button.classList.add('selected');
      playClickSound();
    }
    updateManualFeedback(round);
  }

  function updateManualFeedback(round, override) {
    const state = manualState.get(round);
    if (!state) return;
    const feedback = state.feedback;
    if (!feedback) return;

    if (override) {
      feedback.textContent = override;
      feedback.classList.add('is-visible');
      feedback.classList.remove('is-success');
      return;
    }

    const remaining = state.limit - state.selected.size;
    if (remaining === 0) {
      feedback.textContent = 'Tudo pronto! Clique em "Conferir resultado".';
      feedback.classList.add('is-visible', 'is-success');
    } else {
      feedback.textContent = `Selecione mais ${remaining} número${remaining > 1 ? 's' : ''}.`;
      feedback.classList.add('is-visible');
      feedback.classList.remove('is-success');
    }
  }

  function flashManualLimit(round) {
    const state = manualState.get(round);
    if (!state?.feedback) return;
    state.feedback.textContent = 'Você já escolheu 15 números.';
    state.feedback.classList.add('is-visible');
    state.feedback.classList.remove('is-success');
    window.setTimeout(() => updateManualFeedback(round), 1400);
  }

  function handleManualVerification(round, button) {
    const state = manualState.get(round);
    if (!state) return;
    if (state.selected.size !== state.limit) {
      updateManualFeedback(round, 'Selecione os 15 números antes de continuar.');
      button.classList.add('shake');
        playErrorSound();
      window.setTimeout(() => button.classList.remove('shake'), 400);
      return;
    }
    const loadingStep = manualRounds[round]?.loading;
    if (loadingStep) {
      showSlide(loadingStep);
    }
  }

  function resetManualRound(round) {
    const state = manualState.get(round);
    if (!state) return;
    state.selected.clear();
    state.grid.querySelectorAll('button.selected').forEach((btn) => btn.classList.remove('selected'));
    updateManualFeedback(round);
  }

  function initGuidedGrids() {
    document.querySelectorAll('.number-grid[data-mode="guided"]').forEach((grid) => {
      const sequenceId = Number(grid.dataset.sequence);
      const round = guidedRounds[sequenceId];
      if (!round) return;
      guidedState.set(sequenceId, {
        grid,
        index: 0,
        sequence: round.sequence,
        feedback: grid.previousElementSibling,
        progress: document.querySelector(`[data-progress="guided-${sequenceId}"]`),
        completed: false,
      });
      populateNumberButtons(grid, (value, button) => handleGuidedClick(sequenceId, value, button));
    });
  }

  function resetGuidedRound(sequenceId) {
    const state = guidedState.get(sequenceId);
    if (!state) return;
    state.index = 0;
    state.completed = false;
    state.grid.querySelectorAll('button').forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove('guided-target', 'guided-success', 'guided-error');
    });
    updateGuidedFeedback(sequenceId, 'Clique no número indicado pela IA.');
    updateGuidedProgress(sequenceId);
    highlightNextGuided(sequenceId);
  }

  function highlightNextGuided(sequenceId) {
    const state = guidedState.get(sequenceId);
    if (!state) return;
    const nextValue = state.sequence[state.index];
    state.grid.querySelectorAll('button').forEach((btn) => {
      btn.classList.remove('guided-target');
    });
    if (typeof nextValue === 'number') {
      const targetBtn = state.grid.querySelector(`button[data-value="${nextValue}"]`);
      if (targetBtn) {
        targetBtn.classList.add('guided-target');
      }
    }
  }

  function handleGuidedClick(sequenceId, value, button) {
    const state = guidedState.get(sequenceId);
    if (!state || state.completed) return;
    const expected = state.sequence[state.index];
    if (value === expected) {
      button.classList.remove('guided-target');
      button.classList.add('guided-success');
      button.disabled = true;
      state.index += 1;
      updateGuidedProgress(sequenceId);
      playClickSound();
      if (state.index >= state.sequence.length) {
        state.completed = true;
        updateGuidedFeedback(sequenceId, 'Sequência concluída! Calculando resultado...');
        const round = guidedRounds[sequenceId];
        window.setTimeout(() => showSlide(round?.loading || 'summary'), 600);
      } else {
        updateGuidedFeedback(
          sequenceId,
          `Perfeito! Numero ${String(value).padStart(2, '0')} confirmado. Proximo indicado em destaque.`
        );
        highlightNextGuided(sequenceId);
      }
    } else {
      button.classList.add('guided-error');
      playErrorSound();
      updateGuidedFeedback(sequenceId, 'Ops! Clique apenas no numero destacado pela IA.');
      window.setTimeout(() => button.classList.remove('guided-error'), 320);
    }
  }

  function updateGuidedProgress(sequenceId) {
    const state = guidedState.get(sequenceId);
    if (!state || !state.progress) return;
    const percent = Math.min((state.index / state.sequence.length) * 100, 100);
    state.progress.style.width = `${percent}%`;
  }

  function updateGuidedFeedback(sequenceId, message) {
    const state = guidedState.get(sequenceId);
    if (!state || !state.feedback) return;
    state.feedback.textContent = message;
  }

  function createIaActivationDisplay() {
    let timerId;

    function clearTimer() {
      if (timerId) {
        window.clearTimeout(timerId);
        timerId = undefined;
      }
    }

    function renderState(lines, activeIndex) {
      lines.forEach((line, index) => {
        line.classList.toggle('is-active', index === activeIndex);
        line.classList.toggle('is-complete', index < activeIndex);
      });
    }

    function start() {
      const container = document.querySelector('[data-ia-feed]');
      if (!container) return;
      const lines = Array.from(container.querySelectorAll('[data-line]'));
      const typing = container.querySelector('[data-typing]');
      if (!lines.length) return;

      clearTimer();
      lines.forEach((line) => line.classList.remove('is-active', 'is-complete'));
      if (typing) typing.classList.remove('is-visible');

      let activeIndex = -1;

      const activateNext = () => {
        activeIndex += 1;
        renderState(lines, activeIndex);

        if (activeIndex < lines.length - 1) {
          if (typing) typing.classList.remove('is-visible');
          timerId = window.setTimeout(activateNext, 1150);
          return;
        }

        // Keep last line brilhando e exibir o efeito digitando após pequena pausa.
        if (typing) {
          timerId = window.setTimeout(() => typing.classList.add('is-visible'), 850);
        }
      };

      activateNext();
    }

    function stop() {
      clearTimer();
      const container = document.querySelector('[data-ia-feed]');
      if (!container) return;
      const lines = container.querySelectorAll('[data-line]');
      lines.forEach((line) => line.classList.remove('is-active', 'is-complete'));
      const typing = container.querySelector('[data-typing]');
      if (typing) typing.classList.remove('is-visible');
    }

    return { start, stop };
  }

  function playClickSound() {
    playAudioClip('click', 0.7, () => {
      ToneGenerator.playSequence([780, 960], 0.07, 0.05, 'click');
    });
  }

  function playErrorSound() {
    ToneGenerator.playSequence([220, 180], 0.12, 0.06, 'error');
  }

  function playCashSound() {
    playAudioClip('cash', 0.9, () => {
      ToneGenerator.playSequence([400, 720, 980, 1200], 0.08, 0.05, 'cash');
    });
  }

  function playFailSound() {
    playAudioClip('fail', 0.8, () => {
      ToneGenerator.playSequence([180, 140, 110], 0.14, 0.08, 'error');
    });
  }

  function playAudioClip(key, volume = 1, fallback) {
    const src = audioClips[key];
    if (!src) return false;
    if (!audioCache.has(key)) {
      const base = new Audio(src);
      base.preload = 'auto';
      audioCache.set(key, base);
    }
    const base = audioCache.get(key);
    const instance = base.cloneNode(true);
    instance.volume = volume;
    try {
      const playResult = instance.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => fallback?.());
      }
      return true;
    } catch (error) {
      if (fallback) {
        fallback();
      }
      return false;
    }
  }

  

  function initHublaLink() {
    const link = document.querySelector('[data-hubla-link]');
    if (!link) return;
    const target = new URL(link.getAttribute('href'), window.location.href);
    const params = new URLSearchParams(window.location.search);

    params.forEach((value, key) => {
      if (!target.searchParams.has(key)) {
        target.searchParams.append(key, value);
      }
    });

    link.href = target.toString();
    link.addEventListener('click', () => {
      if (typeof fbq === 'function') {
        fbq('track', 'AddToCart');
        fbq('track', 'InitiateCheckout');
      }
    });
  }


  function initTestimonialSlider() {
    const container = document.querySelector('[data-testimonial-slider]');
    if (!container) return;
    container.setAttribute('tabindex', '0');
    container.dataset.sliderReady = 'true';
    let isPointerDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let pointerId = null;
    let lastDelta = 0;
    let velocity = 0;
    let frame;

    const stopInertia = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = undefined;
      }
      container.classList.remove('is-dragging');
    };

    const applyInertia = () => {
      velocity *= 0.92;
      if (Math.abs(velocity) < 0.08) {
        stopInertia();
        return;
      }
      container.scrollLeft -= velocity;
      frame = window.requestAnimationFrame(applyInertia);
    };

    container.addEventListener('pointerdown', (event) => {
      isPointerDown = true;
      pointerId = event.pointerId;
      startX = event.clientX;
      scrollLeft = container.scrollLeft;
      lastDelta = 0;
      velocity = 0;
      stopInertia();
      try {
        container.setPointerCapture(pointerId);
      } catch (_) {}
      container.classList.add('is-dragging');
    });

    container.addEventListener('pointermove', (event) => {
      if (!isPointerDown || event.pointerId !== pointerId) return;
      const delta = event.clientX - startX;
      container.scrollLeft = scrollLeft - delta;
      velocity = delta - lastDelta;
      lastDelta = delta;
    });

    const endGesture = (event) => {
      if (!isPointerDown || (pointerId !== null && event.pointerId !== pointerId)) return;
      isPointerDown = false;
      pointerId = null;
      try {
        container.releasePointerCapture(event.pointerId);
      } catch (_) {}
      container.classList.remove('is-dragging');
      lastDelta = 0;
      if (Math.abs(velocity) > 0.2) {
        frame = window.requestAnimationFrame(applyInertia);
      } else {
        velocity = 0;
        stopInertia();
      }
    };

    container.addEventListener('pointerup', endGesture);
    container.addEventListener('pointercancel', endGesture);
    container.addEventListener('pointerleave', endGesture);

    container.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        container.scrollBy({ left: container.clientWidth * 0.8, behavior: 'smooth' });
      } else if (event.key === 'ArrowLeft') {
        container.scrollBy({ left: -container.clientWidth * 0.8, behavior: 'smooth' });
      }
    });
  }

const ToneGenerator = (() => {
    let audioCtx;
    return {
      play(freq, duration, type = 'click') {
        const ctx = this.ensureContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        oscillator.type = type === 'cash' ? 'triangle' : 'sawtooth';
        oscillator.frequency.value = freq;

        gain.gain.value = 0.0001;

        lfo.type = 'sine';
        lfo.frequency.value = type === 'error' ? 15 : 20;
        lfoGain.gain.value = type === 'error' ? 40 : 60;
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        lfo.start();

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        const attack = 0.015;
        const decay = duration * 0.6;
        const release = 0.04;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(type === 'cash' ? 0.18 : 0.12, now + attack);
        gain.gain.exponentialRampToValueAtTime(0.002, now + attack + decay);
        gain.gain.setValueAtTime(0.002, now + duration);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);

        oscillator.start(now);
        oscillator.stop(now + duration + release + 0.02);
        lfo.stop(now + duration + release + 0.02);
      },
      playSequence(freqs, duration = 0.1, interval = 0.06, type = 'click') {
        this.ensureContext();
        freqs.forEach((freq, index) => {
          window.setTimeout(() => this.play(freq, duration, type), index * interval * 1000);
        });
      },
      ensureContext() {
        if (audioCtx) return audioCtx;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        return audioCtx;
      },
    };
  })();
});
