document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.quiz-slide'));
  const slideByStep = new Map(slides.map((slide) => [slide.dataset.step, slide]));
  let autoTimer;
  let currentStep =
    slides.find((slide) => slide.classList.contains('is-active'))?.dataset.step ?? null;

  const autoAdvance = {
    preloading: { next: 'video-manual-intro', delay: 5000 },
    'ia-activate': { next: 'guided-select-1', delay: 4000 },
  };

  const MANUAL_CONFIG = {
    round: 1,
    limit: 15,
    hits: 6,
    nextStep: 'video-pre-ia',
  };

  const IA_CONFIG = {
    sequence: [3, 7, 12, 14, 18, 20, 21, 5, 9, 1, 24, 25, 6, 11, 15],
    hits: 14,
    gain: 2253.94,
    progressKey: 'guided-1',
    balanceKey: '1',
    nextStep: 'ia-summary',
  };

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

  const manualState = {
    selected: new Set(),
    limit: MANUAL_CONFIG.limit,
    grid: null,
    feedback: null,
    status: null,
  };

  const guidedState = {
    grid: null,
    feedback: null,
    progress: null,
    balanceEl: null,
    sequence: IA_CONFIG.sequence.slice(),
    index: 0,
    completed: false,
    gainTarget: IA_CONFIG.gain,
    balance: 0,
    revealed: false,
  };

  const videoGates = new Map();
  let activeVideoGate = null;

  const quizModal = document.querySelector('[data-modal]');
  const quizModalContent = quizModal?.querySelector('[data-modal-content]');
  const quizModalBackdrop = quizModal?.querySelector('[data-modal-backdrop]');
  const modalCallbacks = { primary: null, secondary: null };
  let modalOptions = { dismissible: true };

  const emojiContainer = document.querySelector('[data-emoji-rain]');
  let emojiCleanupTimer = null;
  let manualResultTimer = null;
  let iaResultTimer = null;

  const offerModal = document.querySelector('[data-offer-modal]');
  const offerTimerDisplay = offerModal?.querySelector('[data-offer-timer]');
  let offerModalShown = false;
  let offerTimerId = null;
  let offerRemaining = 300;

  const stickyCta = document.querySelector('[data-sticky-cta]');
  let stickyHideTimer = null;

  const preloadingController = createPreloadingController();
  const iaActivationController = createIaActivationController();

  let manualCompleted = false;
  let summaryAnimated = false;

  initManualGrid();
  initGuidedGrid();
  initVideoGates();
  wireControls();
  updateOfferTimerDisplay();

  if (currentStep === 'preloading') {
    preloadingController.start();
  }
  if (currentStep === 'ia-activate') {
    iaActivationController.start();
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
        const round = Number(manualBtn.dataset.round) || MANUAL_CONFIG.round;
        handleManualVerification(round, manualBtn);
        return;
      }

      if (target.closest('[data-modal-primary]')) {
        event.preventDefault();
        const callback = modalCallbacks.primary;
        closeQuizModal();
        callback?.();
        return;
      }

      if (target.closest('[data-modal-secondary]')) {
        event.preventDefault();
        const callback = modalCallbacks.secondary;
        closeQuizModal();
        callback?.();
        return;
      }

      if (
        target.closest('[data-modal-close]') ||
        (quizModalBackdrop && target.closest('[data-modal-backdrop]'))
      ) {
        event.preventDefault();
        if (!modalOptions.dismissible) {
          return;
        }
        closeQuizModal();
        return;
      }

      if (target.closest('[data-offer-close]')) {
        event.preventDefault();
        closeOfferModal();
        return;
      }

      const hublaLink = target.closest('[data-hubla-link]');
      if (hublaLink) {
        let origin = 'cta';
        if (hublaLink.hasAttribute('data-sticky-cta-btn')) {
          origin = 'sticky';
        } else if (hublaLink.closest('[data-offer-modal]')) {
          origin = 'offer-modal';
        } else if (hublaLink.closest('[data-step="ia-summary"]')) {
          origin = 'summary';
        }
        fbSafeTrackCustom('StickyCtaClick', { origin });
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (isQuizModalOpen()) {
          event.preventDefault();
          if (!modalOptions.dismissible) {
            return;
          }
          closeQuizModal();
          return;
        }
        if (offerModal && !offerModal.hidden) {
          event.preventDefault();
          closeOfferModal();
        }
      }
    });
  }

  function showSlide(step) {
    if (!slideByStep.has(step)) return;
    if (currentStep === step) return;

    if (manualResultTimer) {
      window.clearTimeout(manualResultTimer);
      manualResultTimer = null;
    }
    if (iaResultTimer) {
      window.clearTimeout(iaResultTimer);
      iaResultTimer = null;
    }

    if (currentStep === 'preloading') {
      preloadingController.stop();
    }
    if (currentStep === 'ia-activate') {
      iaActivationController.stop();
    }

    if (activeVideoGate && activeVideoGate.step !== step) {
      activeVideoGate.deactivate();
      activeVideoGate = null;
    }

    slides.forEach((slide) => slide.classList.toggle('is-active', slide.dataset.step === step));

    currentStep = step;
    clearTimeout(autoTimer);

    const gate = videoGates.get(step);
    if (gate) {
      gate.activate();
      activeVideoGate = gate;
    }

    if (step === 'preloading') {
      preloadingController.start();
    }
    if (step === 'ia-activate') {
      iaActivationController.start();
    }

    if (step === 'manual-select-1') {
      resetManualRound(true);
    }

    if (step === 'guided-select-1') {
      resetGuidedRound();
    }

    if (step === IA_CONFIG.nextStep) {
      animateSummaryCounters();
    }

    if (step === 'offer') {
      // Scroll to top when entering offer section (testimonials)
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (!offerModalShown) {
        offerModalShown = true;
        openOfferModal();
      }
      showStickyCta();
    } else {
      hideStickyCta();
      closeOfferModal();
    }

    const config = autoAdvance[step];
    if (config?.next) {
      autoTimer = window.setTimeout(() => showSlide(config.next), config.delay);
    }

    switch (step) {
      case 'manual-select-1':
        fbSafeTrackCustom('Quiz_Manual1_Start');
        break;
      case 'video-pre-ia':
        fbSafeTrackCustom('Quiz_Manual1_Result_Viewed');
        break;
      case 'ia-activate':
        fbSafeTrackCustom('IA_Activated');
        break;
      case 'guided-select-1':
        fbSafeTrackCustom('Quiz_IA1_Start');
        break;
      case 'ia-summary':
        fbSafeTrack('CompleteRegistration');
        playCashSound();
        break;
      case 'offer':
        fbSafeTrack('InitiateCheckout');
        break;
      default:
        break;
    }
  }

  function initManualGrid() {
    const grid = document.querySelector('.number-grid[data-mode="manual"][data-round="1"]');
    if (!grid) return;
    manualState.grid = grid;
    manualState.feedback =
      document.querySelector('[data-manual-feedback="1"]') || attachManualFeedback(grid);
    manualState.status = document.querySelector('[data-manual-status="1"]') || null;
    populateNumberButtons(grid, (value, button) => toggleManualNumber(value, button));
    updateManualFeedback();
  }

  function initGuidedGrid() {
    const grid = document.querySelector('.number-grid[data-mode="guided"][data-sequence="1"]');
    if (!grid) return;
    guidedState.grid = grid;
    guidedState.feedback = document.querySelector('[data-guided-feedback="1"]') || null;
    guidedState.progress = document.querySelector(`[data-progress="${IA_CONFIG.progressKey}"]`);
    guidedState.balanceEl = document.querySelector(`[data-guided-balance="${IA_CONFIG.balanceKey}"]`);
    populateNumberButtons(grid, (value, button) => handleGuidedClick(value, button));
    resetGuidedRound();
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
      const loadingIndicator = section.querySelector('[data-role="video-loading"]');

      if (!step || !video || !continueButton) {
        return;
      }

      let lastTime = 0;
      let resetting = false;
      let retryCount = 0;
      const MAX_RETRIES = 3;

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

      const showLoading = () => {
        if (loadingIndicator) {
          loadingIndicator.hidden = false;
        }
      };

      const hideLoading = () => {
        if (loadingIndicator) {
          loadingIndicator.hidden = true;
        }
      };

      const handleError = () => {
        if (!gate.active) return;
        hideLoading();

        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Video error, retrying (${retryCount}/${MAX_RETRIES})...`);

          // Wait 2 seconds before retry
          window.setTimeout(() => {
            if (gate.active) {
              video.load();
              gate.requestPlay();
            }
          }, 2000);
        } else {
          // Max retries reached, show error to user
          if (playButton) {
            playButton.classList.remove('is-hidden');
            playButton.textContent = 'Tentar novamente';
          }
        }
      };

      const handleStalled = () => {
        if (gate.active) {
          showLoading();
        }
      };

      const handleCanPlay = () => {
        hideLoading();
        retryCount = 0; // Reset retry count on successful load
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
        hideLoading(); // Ensure loading is hidden when video ends
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
          // CRITICAL: Always start with loading hidden
          hideLoading();
          try {
            video.pause();
          } catch (error) {
            // Ignore browsers that throw when pausing before metadata loads.
          }
          // Only reset currentTime if video has loaded metadata
          if (video.readyState >= 1) {
            try {
              video.currentTime = 0;
            } catch (error) {
              video.load();
            }
          } else {
            video.load();
          }
          window.setTimeout(() => {
            resetting = false;
            refreshProgress();
            resumePlayback();
            window.addEventListener('keydown', preventKeySkip, true);
            section.addEventListener('contextmenu', preventContextMenu);
            video.addEventListener('contextmenu', preventContextMenu);
          }, 40);
        },
        deactivate() {
          this.active = false;
          window.removeEventListener('keydown', preventKeySkip, true);
          section.removeEventListener('contextmenu', preventContextMenu);
          video.removeEventListener('contextmenu', preventContextMenu);
          if (!video.paused) {
            video.pause();
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
          // Show loading when user initiates play
          showLoading();
          gate.requestPlay();
        });
      }

      video.addEventListener('play', () => {
        if (gate.active && playButton) {
          playButton.classList.add('is-hidden');
        }
        // Hide loading when video starts playing
        hideLoading();
      });

      video.addEventListener('pause', () => {
        if (gate.active && !resetting && !video.ended) {
          resumePlayback();
        }
        // Hide loading when paused
        hideLoading();
      });

      video.addEventListener('timeupdate', updateLastTime);
      video.addEventListener('seeking', enforceSeekLock);
      video.addEventListener('loadedmetadata', refreshProgress);
      video.addEventListener('ended', handleEnded);

      // Error handling
      video.addEventListener('error', handleError);
      video.addEventListener('stalled', handleStalled);
      video.addEventListener('suspend', handleStalled);

      // Loading states - multiple redundant hideLoading calls to handle race conditions
      video.addEventListener('waiting', showLoading);
      video.addEventListener('loadeddata', hideLoading);    // First frame loaded
      video.addEventListener('canplay', handleCanPlay);     // Enough buffer to start
      video.addEventListener('playing', hideLoading);       // Actually playing

      // Fallback: if video is playing for 500ms, force hide loading
      video.addEventListener('timeupdate', () => {
        if (!video.paused && !video.ended && video.currentTime > 0) {
          hideLoading();
        }
      });

      continueButton.addEventListener('click', () => {
        const next = continueButton.getAttribute('data-next');
        if (next) {
          showSlide(next);
        }
      });

      videoGates.set(step, gate);
    });
  }

  function toggleManualNumber(value, button) {
    if (manualCompleted) return;
    const { selected, limit } = manualState;
    if (selected.has(value)) {
      selected.delete(value);
      button.classList.remove('selected');
      playClickSound();
    } else {
      if (selected.size >= limit) {
        flashManualLimit();
        return;
      }
      selected.add(value);
      button.classList.add('selected');
      playClickSound();

      // Auto-advance when all 15 numbers are selected (like IA behavior)
      if (selected.size === limit) {
        updateManualFeedback('Sequência completa! Verificando resultado...', 'ready');
        const verifyButton = document.querySelector('[data-action="verify-manual"]');
        if (verifyButton) {
          window.setTimeout(() => {
            handleManualVerification(MANUAL_CONFIG.round, verifyButton);
          }, 600);
        }
        return;
      }
    }
    updateManualFeedback();
  }

  function updateManualFeedback(override, state) {
    const { feedback, status, selected, limit } = manualState;
    if (!feedback) return;

    if (override) {
      feedback.textContent = override;
      if (state) {
        feedback.dataset.state = state;
      } else {
        feedback.removeAttribute('data-state');
      }
    } else {
      const remaining = limit - selected.size;
      if (remaining <= 0) {
        feedback.textContent = 'Pronto! Você completou os 15 números.';
        feedback.dataset.state = 'ready';
      } else if (remaining <= 3) {
        feedback.textContent = `Faltam apenas ${remaining} número${remaining === 1 ? '' : 's'}.`;
        feedback.dataset.state = 'warning';
      } else {
        feedback.textContent = 'Toque nos números até completar os 15 escolhidos.';
        feedback.removeAttribute('data-state');
      }
    }

    if (status) {
      status.textContent = `Etapa 1 de 2 · ${selected.size}/${limit} selecionados`;
    }
  }

  function flashManualLimit() {
    const { feedback } = manualState;
    if (!feedback) return;
    feedback.dataset.state = 'error';
    feedback.textContent = 'Você já escolheu 15 números.';
    playErrorSound();
    window.setTimeout(() => updateManualFeedback(), 1200);
  }

  function handleManualVerification(round, button) {
    if (manualCompleted) {
      showSlide(MANUAL_CONFIG.nextStep);
      return;
    }

    const { selected, limit } = manualState;
    if (selected.size !== limit) {
      updateManualFeedback('Selecione os 15 números antes de continuar.', 'error');
      button.classList.add('shake');
      playErrorSound();
      window.setTimeout(() => button.classList.remove('shake'), 400);
      return;
    }

    updateManualFeedback('Analisando sua combinação manual...', 'warning');
    button.disabled = true;

    window.setTimeout(() => {
      button.disabled = false;
      manualCompleted = true;
      manualState.grid?.querySelectorAll('button').forEach((btn) => {
        btn.disabled = true;
      });
      showManualResultModal();
    }, 900);
  }

  function resetManualRound(force = false) {
    if (!manualState.grid) return;
    if (force) {
      manualCompleted = false;
    } else if (manualCompleted) {
      return;
    }
    manualState.selected.clear();
    manualState.grid.querySelectorAll('button').forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove('selected');
    });
    updateManualFeedback();
  }

  function handleGuidedClick(value, button) {
    if (guidedState.completed) return;
    const expected = guidedState.sequence[guidedState.index];
    if (value === expected) {
      button.classList.remove('guided-target');
      button.classList.add('guided-success');
      button.disabled = true;
      guidedState.index += 1;
      updateGuidedProgress();
      updateGuidedBalance();
      playClickSound();

      if (guidedState.index >= guidedState.sequence.length) {
        guidedState.completed = true;
        guidedState.revealed = false;
        guidedState.grid?.querySelectorAll('button').forEach((btn) => (btn.disabled = true));
        updateGuidedFeedback('Sequência concluída! Calculando resultado da IA...');
        window.setTimeout(showIaResultModal, 700);
      } else {
        updateGuidedFeedback(
          `Perfeito! Número ${String(value).padStart(2, '0')} confirmado. Próximo destacado na grade.`
        );
        highlightNextGuided();
      }
    } else {
      button.classList.add('guided-error');
      playErrorSound();
      updateGuidedFeedback('Ops! Clique apenas no número destacado pela IA.');
      window.setTimeout(() => button.classList.remove('guided-error'), 320);
    }
  }

  function resetGuidedRound() {
    guidedState.index = 0;
    guidedState.completed = false;
    guidedState.balance = 0;
    guidedState.revealed = false;
    if (guidedState.grid) {
      guidedState.grid.querySelectorAll('button').forEach((btn) => {
        btn.disabled = false;
        btn.classList.remove('guided-target', 'guided-success', 'guided-error');
      });
    }
    updateGuidedBalance();
    updateGuidedProgress();
    updateGuidedFeedback('Vamos começar! Clique no número destacado.');
    highlightNextGuided();
  }

  function highlightNextGuided() {
    if (!guidedState.grid) return;
    const nextValue = guidedState.sequence[guidedState.index];
    guidedState.grid.querySelectorAll('button').forEach((btn) => btn.classList.remove('guided-target'));
    if (typeof nextValue === 'number') {
      const targetBtn = guidedState.grid.querySelector(`button[data-value="${nextValue}"]`);
      if (targetBtn) {
        targetBtn.classList.add('guided-target');
      }
    }
  }

  function updateGuidedProgress() {
    if (!guidedState.progress) return;
    const percent = Math.min(
      (guidedState.index / guidedState.sequence.length) * 100,
      100
    );
    guidedState.progress.style.width = `${percent}%`;
  }

  function updateGuidedBalance() {
    if (!guidedState.balanceEl) return;
    const value = guidedState.revealed ? guidedState.gainTarget : 0;
    guidedState.balance = value;
    guidedState.balanceEl.textContent = formatCurrency(value);
  }

  function updateGuidedFeedback(message) {
    if (!guidedState.feedback) return;
    guidedState.feedback.textContent = message;
  }

  function showManualResultModal() {
    playFailSound();
    fbSafeTrackCustom('Quiz_Manual1_Result');
    const content = `
      <div class="result-modal result-modal--manual">
        <div class="result-modal__icon" aria-hidden="true">😔</div>
        <h3 class="result-modal__headline">
          <span class="result-modal__status result-modal__status--fail">✖️ Você teve ${MANUAL_CONFIG.hits} acertos.</span>
        </h3>
        <p class="result-modal__message">Não foi dessa vez, tente na próxima rodada!</p>
        <p class="result-modal__note">Avançando automaticamente...</p>
      </div>
    `;
    openQuizModal(content, {}, { dismissible: false });
    manualResultTimer = window.setTimeout(() => {
      manualResultTimer = null;
      closeQuizModal();
      showSlide(MANUAL_CONFIG.nextStep);
    }, 1800);
  }

  function showIaResultModal() {
    playCashSound();
    startEmojiRain();
    guidedState.revealed = true;
    updateGuidedBalance();
    fbSafeTrackCustom('Quiz_IA1_Result');
    const content = `
      <div class="result-modal result-modal--success">
        <div class="result-modal__icon" aria-hidden="true">🏆</div>
        <h3 class="result-modal__headline">
          <span class="result-modal__status result-modal__status--success">✅ IA garantiu ${IA_CONFIG.hits} acertos!</span>
        </h3>
        <p class="result-modal__message">Saldo simulado de ${formatCurrency(
          IA_CONFIG.gain
        )} liberado seguindo a sequência inteligente.</p>
        <p class="result-modal__note">Avançando automaticamente...</p>
      </div>
    `;
    openQuizModal(content, {}, { dismissible: false });
    iaResultTimer = window.setTimeout(() => {
      iaResultTimer = null;
      closeQuizModal();
      showSlide(IA_CONFIG.nextStep);
    }, 2000);
  }

  function openQuizModal(content, callbacks = {}, options = {}) {
    if (!quizModal || !quizModalContent) return;
    quizModalContent.innerHTML = content;
    modalCallbacks.primary = callbacks.onPrimary || null;
    modalCallbacks.secondary = callbacks.onSecondary || null;
    modalOptions.dismissible = options.dismissible !== false;
    quizModal.hidden = false;
    requestAnimationFrame(() => quizModal.setAttribute('data-visible', 'true'));
    window.setTimeout(() => {
      const autoFocus = quizModalContent.querySelector('[data-modal-autofocus]');
      if (autoFocus instanceof HTMLElement) {
        autoFocus.focus();
      }
    }, 40);
    document.body.classList.add('quiz-modal-open');
  }

  function closeQuizModal() {
    if (!quizModal || quizModal.hidden) return;
    quizModal.setAttribute('data-visible', 'false');
    window.setTimeout(() => {
      if (quizModal.getAttribute('data-visible') === 'false') {
        quizModal.hidden = true;
        quizModal.removeAttribute('data-visible');
        quizModalContent.innerHTML = '';
      }
    }, 220);
    modalCallbacks.primary = null;
    modalCallbacks.secondary = null;
    modalOptions.dismissible = true;
    document.body.classList.remove('quiz-modal-open');
  }

  function isQuizModalOpen() {
    return Boolean(quizModal && !quizModal.hidden);
  }

  function startEmojiRain() {
    if (!emojiContainer) return;
    emojiContainer.hidden = false;
    const emojis = ['💰', '💸', '🎯', '🏆'];
    const total = 18;
    for (let i = 0; i < total; i += 1) {
      const item = document.createElement('span');
      item.className = 'emoji-rain__item';
      item.textContent = emojis[i % emojis.length];
      item.style.left = `${Math.random() * 100}%`;
      item.style.animationDelay = `${Math.random() * 0.8}s`;
      item.style.animationDuration = `${2.4 + Math.random() * 1.2}s`;
      emojiContainer.appendChild(item);
    }
    window.clearTimeout(emojiCleanupTimer);
    emojiCleanupTimer = window.setTimeout(() => {
      emojiContainer.innerHTML = '';
      emojiContainer.hidden = true;
    }, 4200);
  }

  function showStickyCta() {
    if (!stickyCta) return;
    window.clearTimeout(stickyHideTimer);
    stickyCta.classList.remove('is-hidden');
    requestAnimationFrame(() => stickyCta.classList.add('sticky-cta--visible'));
  }

  function hideStickyCta() {
    if (!stickyCta) return;
    stickyCta.classList.remove('sticky-cta--visible');
    window.clearTimeout(stickyHideTimer);
    stickyHideTimer = window.setTimeout(() => {
      stickyCta.classList.add('is-hidden');
    }, 240);
  }

  function animateSummaryCounters() {
    if (summaryAnimated) return;
    summaryAnimated = true;
    const container = slideByStep.get(IA_CONFIG.nextStep);
    if (!container) return;
    container.querySelectorAll('[data-counter]').forEach((element) => {
      const target = Number(element.dataset.target);
      if (!Number.isFinite(target)) return;
      const format = element.dataset.format;
      animateCounter(element, target, format);
    });
  }

  function animateCounter(element, target, format) {
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutCubic(progress);
      const value = target * eased;
      if (format === 'currency') {
        element.textContent = formatCurrency(value);
      } else {
        element.textContent = Math.round(value).toLocaleString('pt-BR');
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function openOfferModal() {
    if (!offerModal) return;
    offerModal.hidden = false;
    requestAnimationFrame(() => offerModal.setAttribute('data-visible', 'true'));
    startOfferTimer();
  }

  function closeOfferModal() {
    if (!offerModal || offerModal.hidden) return;
    offerModal.setAttribute('data-visible', 'false');
    window.setTimeout(() => {
      if (offerModal.getAttribute('data-visible') === 'false') {
        offerModal.hidden = true;
        offerModal.removeAttribute('data-visible');
      }
    }, 220);
  }

  function startOfferTimer() {
    if (!offerTimerDisplay) return;
    updateOfferTimerDisplay();
    if (offerTimerId) return;
    offerTimerId = window.setInterval(() => {
      if (offerRemaining <= 0) {
        offerRemaining = 0;
        updateOfferTimerDisplay();
        stopOfferTimer();
        return;
      }
      offerRemaining -= 1;
      updateOfferTimerDisplay();
    }, 1000);
  }

  function stopOfferTimer() {
    if (offerTimerId) {
      window.clearInterval(offerTimerId);
      offerTimerId = null;
    }
  }

  function updateOfferTimerDisplay() {
    if (!offerTimerDisplay) return;
    const minutes = Math.floor(offerRemaining / 60);
    const seconds = offerRemaining % 60;
    offerTimerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
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

  function attachManualFeedback(grid) {
    const feedback = document.createElement('p');
    feedback.className = 'validation-message';
    feedback.setAttribute('aria-live', 'polite');
    grid.insertAdjacentElement('afterend', feedback);
    return feedback;
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

  const audioClips = {
    click: 'money-pickup-2-89563.mp3',
    cash: 'cashier-quotka-chingquot-sound-effect-129698.mp3',
    fail: 'error-126627.mp3',
  };

  const audioCache = new Map();

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

  function formatCurrency(value) {
    return currencyFormatter.format(Math.max(0, value));
  }

  function createIaActivationController() {
    const container = document.querySelector('[data-ia-steps]');
    const statusEl = document.querySelector('[data-ia-status]');
    if (!container || !statusEl) {
      return { start: () => {}, stop: () => {} };
    }
    const steps = Array.from(container.querySelectorAll('[data-ia-step]'));
    const defaultStatus = statusEl.textContent || '';
    const statuses = steps.map((step) => step.dataset.iaStatus || defaultStatus);
    let timers = [];
    let running = false;

    const reset = () => {
      steps.forEach((step) => {
        step.removeAttribute('data-state');
        const bar = step.querySelector('.ia-step__bar span');
        if (bar) {
          bar.style.width = '0%';
        }
      });
      statusEl.textContent = defaultStatus;
    };

    return {
      start() {
        if (running) return;
        running = true;
        reset();
        steps.forEach((step, index) => {
          const activateDelay = index * 900;
          const completeDelay = activateDelay + 640;
          timers.push(
            window.setTimeout(() => {
              step.dataset.state = 'active';
              const bar = step.querySelector('.ia-step__bar span');
              if (bar) {
                bar.style.width = '100%';
              }
              if (statuses[index]) {
                statusEl.textContent = statuses[index];
              }
            }, activateDelay)
          );
          timers.push(
            window.setTimeout(() => {
              step.dataset.state = 'done';
            }, completeDelay)
          );
        });
        const finalDelay = steps.length * 900 + 760;
        timers.push(
          window.setTimeout(() => {
            statusEl.textContent = 'IA pronta! Sequência liberada.';
            running = false;
          }, finalDelay)
        );
      },
      stop() {
        timers.forEach((id) => window.clearTimeout(id));
        timers = [];
        running = false;
        reset();
      },
    };
  }

  function createPreloadingController() {
    const container = document.querySelector('[data-preloading]');
    if (!container) {
      return { start: () => {}, stop: () => {} };
    }
    const steps = Array.from(container.querySelectorAll('[data-preloading-step]'));
    let timers = [];
    let running = false;

    const reset = () => {
      steps.forEach((step) => {
        step.removeAttribute('data-state');
        const bar = step.querySelector('.preloading-step__bar span');
        if (bar) {
          bar.style.width = '0%';
        }
      });
    };

    return {
      start() {
        if (running) return;
        running = true;
        reset();
        steps.forEach((step, index) => {
          const activateDelay = index * 900;
          const completeDelay = activateDelay + 740;
          timers.push(
            window.setTimeout(() => {
              step.dataset.state = 'active';
              const bar = step.querySelector('.preloading-step__bar span');
              if (bar) {
                bar.style.width = '100%';
              }
            }, activateDelay)
          );
          timers.push(
            window.setTimeout(() => {
              step.dataset.state = 'done';
            }, completeDelay)
          );
        });
        const total = steps.length * 900 + 800;
        timers.push(
          window.setTimeout(() => {
            running = false;
          }, total)
        );
      },
      stop() {
        timers.forEach((id) => window.clearTimeout(id));
        timers = [];
        running = false;
        reset();
      },
    };
  }

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
});
