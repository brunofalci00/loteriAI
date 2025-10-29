document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.quiz-slide'));
  const slideByStep = new Map(slides.map((s) => [s.dataset.step, s]));
  let autoTimer;

  const autoAdvance = {
    preloading: { next: 'video-manual-intro', delay: 5000 },
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
  const videoGates = new Map();
  let activeVideoGate = null;

  initManualGrids();
  initGuidedGrids();
  initVideoGates();
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

  function initVideoGates() {
    const sections = document.querySelectorAll('[data-video-gate]');

    sections.forEach((section) => {
      const step = section.dataset.step;
      const video = section.querySelector('video');
      const playButton = section.querySelector('[data-role="video-play"]');
      const continueButton = section.querySelector('[data-role="video-continue"]');
      const hint = section.querySelector('[data-role="video-hint"]');
      const progressBar = section.querySelector('[data-role="video-progress-bar"]');

      if (!step || !video || !continueButton) {
        return;
      }

      let lastTime = 0;
      let resetting = false;

      const blockedKeys = new Set(['ArrowRight', 'ArrowLeft', ' ', 'f', 'F', 'k', 'K', 'm', 'M']);

      const preventKeySkip = (event) => {
        if (!gate.active) return;
        if (blockedKeys.has(event.key)) {
          event.preventDefault();
          event.stopPropagation();
        }
      };

      const preventContextMenu = (event) => {
        if (gate.active) {
          event.preventDefault();
        }
      };

      const refreshProgress = () => {
        if (!progressBar) return;
        const duration = Number(video.duration);
        const progressed = Number(video.currentTime);
        let percent = 0;
        if (Number.isFinite(duration) && duration > 0) {
          percent = Math.min((progressed / duration) * 100, 100);
        } else if (video.ended) {
          percent = 100;
        }
        progressBar.style.width = `${percent}%`;
      };

      const updateLastTime = () => {
        if (gate.active && !video.seeking) {
          lastTime = video.currentTime;
        }
        refreshProgress();
      };

      const enforceSeekLock = () => {
        if (!gate.active || resetting) return;
        if (Math.abs(video.currentTime - lastTime) > 1.5) {
          video.currentTime = lastTime;
        }
        refreshProgress();
      };

      const resumePlayback = () => {
        if (!gate.active || resetting || video.ended) return;
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(() => {
            if (gate.active && playButton) {
              playButton.classList.remove('is-hidden');
            }
          });
        }
      };

      const handleEnded = () => {
        gate.active = false;
        window.removeEventListener('keydown', preventKeySkip, true);
        section.removeEventListener('contextmenu', preventContextMenu);
        video.removeEventListener('contextmenu', preventContextMenu);
        refreshProgress();
        continueButton.disabled = false;
        continueButton.classList.remove('is-hidden');
        if (hint) {
          hint.classList.add('is-hidden');
        }
      };

      const gate = {
        step,
        active: false,
        activate() {
          this.active = true;
          resetting = true;
          lastTime = 0;
          continueButton.disabled = true;
          continueButton.classList.add('is-hidden');
          if (hint) {
            hint.classList.remove('is-hidden');
          }
          if (progressBar) {
            progressBar.style.width = '0%';
          }
          if (playButton) {
            playButton.classList.remove('is-hidden');
          }
          try {
            video.pause();
          } catch (error) {
            // Ignore browsers that throw when pausing before metadata loads.
          }
          try {
            video.currentTime = 0;
          } catch (error) {
            video.load();
          }
          video.controls = false;
          video.setAttribute('controlsList', 'nodownload noplaybackrate noremoteplayback');
          video.setAttribute('disablePictureInPicture', '');
          window.addEventListener('keydown', preventKeySkip, { capture: true, passive: false });
          section.addEventListener('contextmenu', preventContextMenu);
          video.addEventListener('contextmenu', preventContextMenu);
          window.setTimeout(() => {
            resetting = false;
          }, 0);
        },
        deactivate() {
          if (!this.active) return;
          this.active = false;
          window.removeEventListener('keydown', preventKeySkip, true);
          section.removeEventListener('contextmenu', preventContextMenu);
          video.removeEventListener('contextmenu', preventContextMenu);
           refreshProgress();
          try {
            video.pause();
          } catch (error) {
            // Ignore silently.
          }
        },
        requestPlay() {
          const attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => {
              if (this.active && playButton) {
                playButton.classList.remove('is-hidden');
              }
            });
          }
        },
      };

      if (playButton) {
        playButton.addEventListener('click', () => {
          playButton.classList.add('is-hidden');
          gate.requestPlay();
        });
      }

      video.addEventListener('play', () => {
        if (gate.active && playButton) {
          playButton.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', () => {
        resumePlayback();
      });

      video.addEventListener('timeupdate', updateLastTime);
      video.addEventListener('waiting', updateLastTime);
      video.addEventListener('seeking', enforceSeekLock);
      video.addEventListener('loadedmetadata', refreshProgress);
      video.addEventListener('ended', handleEnded);

      continueButton.addEventListener('click', () => {
        gate.deactivate();
      });

      videoGates.set(step, gate);
    });
  }

  function showSlide(step) {
    if (!slideByStep.has(step)) return;
    const nextGate = videoGates.get(step);

    if (activeVideoGate && activeVideoGate !== nextGate) {
      activeVideoGate.deactivate();
      activeVideoGate = null;
    }

    slides.forEach((slide) => slide.classList.toggle('is-active', slide.dataset.step === step));
    clearTimeout(autoTimer);
    if (nextGate) {
      nextGate.activate();
      activeVideoGate = nextGate;
    }

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
