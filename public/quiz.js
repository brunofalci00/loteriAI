document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.quiz-slide'));
  const slideByStep = new Map(slides.map((s) => [s.dataset.step, s]));
  const modal = document.querySelector('[data-modal]');
  const modalContent = modal?.querySelector('[data-modal-content]');
  const modalBackdrop = modal?.querySelector('[data-modal-backdrop]');
  const emojiRain = document.querySelector('[data-emoji-rain]');
  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const emojiChoices = ['💰', '💸', '💎', '🤑', '🎉'];
  const autoAdvance = {
    'ia-activate': { next: 'guided-select-1', delay: 5200 },
  };

  const audioClips = {
    click: 'money-pickup-2-89563.mp3',
    cash: 'cashier-quotka-chingquot-sound-effect-129698.mp3',
    fail: 'error-126627.mp3',
  };

  const audioCache = new Map();

  const manualRounds = {
    1: {
      select: 'manual-select-1',
      next: 'manual-select-2',
      hits: 8,
      result: {
        icon: '😞',
        title: 'Você teve 8 acertos.',
        message: 'Não foi dessa vez, tente na próxima rodada!',
        note: 'Avançando automaticamente...',
        sound: 'fail',
      },
    },
    2: {
      select: 'manual-select-2',
      next: 'video-pre-ia',
      hits: 7,
      result: {
        icon: '😔',
        title: 'Você teve 7 acertos.',
        message: 'Sem IA fica difícil. Veja como a inteligência artificial melhora seus jogos!',
        note: 'Avançando automaticamente...',
        sound: 'fail',
      },
    },
  };

  const guidedRounds = {
    1: {
      select: 'guided-select-1',
      next: 'guided-select-2',
      sequence: [3, 7, 12, 14, 18, 21, 24, 1, 4, 5, 9, 11, 16, 19, 25],
      progressKey: 'guided-1',
      hits: 14,
      payout: 2253.94,
    },
    2: {
      select: 'guided-select-2',
      next: 'ia-summary',
      sequence: [2, 6, 8, 10, 13, 15, 17, 20, 22, 23, 5, 7, 11, 14, 24],
      progressKey: 'guided-2',
      hits: 13,
      payout: 1169.44,
    },
  };

  const manualState = new Map();
  const guidedState = new Map();
  const videoGates = new Map();
  let activeVideoGate = null;
  let autoTimer;
  let preloadingStarted = false;
  let iaActivationStarted = false;
  let manualSummaryTotal = 0;
  let guidedSummaryTotal = 0;
  let summaryAnimated = false;

  initManualGrids();
  initGuidedGrids();
  initVideoGates();
  wireControls();
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', () => closeModal());
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.hasAttribute('hidden')) {
      closeModal();
    }
  });

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

      const checkoutLink = target.closest('a[data-hubla-link]');
      if (checkoutLink) {
        fbSafeTrack('InitiateCheckout');
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
          retryCount = 0; // Reset retry count
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
              // Silently ignore - metadata may not be ready yet
            }
          } else {
            // Load video and set currentTime after metadata loads
            video.load();
            const metadataHandler = () => {
              try {
                video.currentTime = 0;
              } catch (e) {
                // Ignore
              }
              video.removeEventListener('loadedmetadata', metadataHandler);
            };
            video.addEventListener('loadedmetadata', metadataHandler, { once: true });
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

      // Removed automatic resumePlayback on pause to prevent infinite loops

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
      video.addEventListener('pause', hideLoading);         // Paused (hide spinner)

      // Fallback: if video is playing for 500ms, force hide loading
      video.addEventListener('timeupdate', () => {
        if (!video.paused && !video.ended && video.currentTime > 0) {
          hideLoading();
        }
      });

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

    if (modal) {
      closeModal(true);
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

    if (step === 'preloading' && !preloadingStarted) {
      preloadingStarted = true;
      runPreloadingSequence();
    }

    if (step === 'ia-activate') {
      runIaActivationSequence();
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
    if (step === 'ia-summary') {
      startSummaryCounters();
    }

    switch (step) {
      case 'manual-select-1':
        fbSafeTrackCustom('Quiz_Manual1_Start');
        break;
      case 'manual-select-2':
        fbSafeTrackCustom('Quiz_Manual2_Start');
        break;
      case 'ia-activate':
        fbSafeTrackCustom('IA_Activated');
        break;
      case 'guided-select-1':
        fbSafeTrackCustom('Quiz_IA1_Start');
        break;
      case 'guided-select-2':
        fbSafeTrackCustom('Quiz_IA2_Start');
        break;
      case 'ia-summary':
        fbSafeTrack('CompleteRegistration');
        break;
      default:
        break;
    }

    // Update sticky button for mobile
    if (stickyButtonManager) {
      stickyButtonManager.show(step);
    }
  }

  function initManualGrids() {
    document.querySelectorAll('.number-grid[data-mode="manual"]').forEach((grid) => {
      const round = Number(grid.dataset.round);
      const feedback = document.querySelector(`[data-manual-feedback="${round}"]`);
      const status = document.querySelector(`[data-manual-status="${round}"]`);
      manualState.set(round, {
        selected: new Set(),
        limit: 15,
        grid,
        feedback,
        status,
        completed: false,
        processing: false,
      });
      populateNumberButtons(grid, (value, button) => toggleManualNumber(round, value, button));
      updateManualFeedback(round);
    });
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
      feedback.dataset.state = 'error';
      return;
    }

    const remaining = state.limit - state.selected.size;
    if (remaining === 0) {
      feedback.textContent = 'Tudo pronto! Clique em "Verificar resultado".';
      feedback.dataset.state = 'ready';
    } else {
      feedback.textContent = `Selecione mais ${remaining} número${remaining > 1 ? 's' : ''}.`;
      feedback.dataset.state = 'default';
    }
    if (state.status) {
      state.status.textContent = `Rodada ${round} de 2 • ${state.selected.size}/15 escolhidos`;
    }
  }

  function flashManualLimit(round) {
    const state = manualState.get(round);
    if (!state?.feedback) return;
    state.feedback.textContent = 'Você já escolheu 15 números.';
    state.feedback.dataset.state = 'warning';
    window.setTimeout(() => updateManualFeedback(round), 1400);
  }

  function handleManualVerification(round, button) {
    const state = manualState.get(round);
    if (!state || state.processing) return;
    if (state.selected.size !== state.limit) {
      updateManualFeedback(round, 'Selecione os 15 números antes de continuar.');
      button.classList.add('shake');
      playErrorSound();
      window.setTimeout(() => button.classList.remove('shake'), 400);
      return;
    }
    const config = manualRounds[round];
    if (!config) return;
    state.processing = true;
    state.completed = true;
    manualSummaryTotal += config.hits || 0;
    openResultModal({
      role: 'manual',
      icon: config.result.icon,
      title: config.result.title,
      message: config.result.message,
      note: config.result.note,
      sound: config.result.sound,
    });
    fbSafeTrackCustom(round === 1 ? 'Quiz_Manual1_Result' : 'Quiz_Manual2_Result');
    window.setTimeout(() => {
      closeModal();
      showSlide(config.next);
      state.processing = false;
    }, 3000);
  }

  function resetManualRound(round) {
    const state = manualState.get(round);
    if (!state) return;
    state.selected.clear();
    state.grid.querySelectorAll('button.selected').forEach((btn) => btn.classList.remove('selected'));
    state.processing = false;
    state.completed = false;
    updateManualFeedback(round);
  }

  function initGuidedGrids() {
    document.querySelectorAll('.number-grid[data-mode="guided"]').forEach((grid) => {
      const sequenceId = Number(grid.dataset.sequence);
      const round = guidedRounds[sequenceId];
      if (!round) return;
      const feedback =
        document.querySelector(`[data-guided-feedback="${sequenceId}"]`) || grid.previousElementSibling;
      guidedState.set(sequenceId, {
        id: sequenceId,
        grid,
        index: 0,
        sequence: round.sequence,
        feedback,
        progress: document.querySelector(`[data-progress="guided-${sequenceId}"]`),
        balance: document.querySelector(`[data-guided-balance="${sequenceId}"]`),
        balanceValue: 0,
        completed: false,
        next: round.next,
        hits: round.hits,
        payout: round.payout,
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
    state.balanceValue = sequenceId === 1 ? 0 : guidedSummaryTotal;
    updateGuidedBalance(state);
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
        window.setTimeout(() => completeGuidedRound(sequenceId), 600);
      } else {
        updateGuidedFeedback(
          sequenceId,
          `Perfeito! Número ${String(value).padStart(2, '0')} confirmado. Próximo indicado em destaque.`
        );
        highlightNextGuided(sequenceId);
      }
    } else {
      button.classList.add('guided-error');
      playErrorSound();
      updateGuidedFeedback(sequenceId, 'Ops! Clique apenas no número destacado pela IA.');
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

  function updateGuidedBalance(state) {
    if (!state?.balance) return;
    state.balance.textContent = currencyFormatter.format(state.balanceValue || 0);
  }

  function completeGuidedRound(sequenceId) {
    const state = guidedState.get(sequenceId);
    if (!state) return;
    state.balanceValue = guidedSummaryTotal + (state.payout || 0);
    guidedSummaryTotal = state.balanceValue;
    updateGuidedBalance(state);
    openResultModal({
      role: 'success',
      icon: '🎉',
      title: `Você teve ${state.hits} acertos!`,
      message: `Ganhou ${currencyFormatter.format(state.payout || 0)}.`,
      note: 'Avançando automaticamente...',
      sound: 'cash',
      emojiRain: true,
    });
    fbSafeTrackCustom(sequenceId === 1 ? 'Quiz_IA1_Result' : 'Quiz_IA2_Result');
    window.setTimeout(() => {
      closeModal();
      if (state.next) {
        showSlide(state.next);
      }
    }, 3200);
  }

  function runIaActivationSequence() {
    if (iaActivationStarted) return;
    iaActivationStarted = true;
    const stepsWrapper = document.querySelector('[data-ia-steps]');
    if (!stepsWrapper) return;
    const steps = Array.from(stepsWrapper.querySelectorAll('[data-ia-step]'));
    const badge = document.querySelector('[data-ia-badge]');
    const title = document.querySelector('[data-ia-title]');
    const subtitle = document.querySelector('[data-ia-subtitle]');
    const status = document.querySelector('[data-ia-status]');
    const stepDuration = 1300;

    steps.forEach((step) => {
      step.setAttribute('data-state', 'pending');
      const bar = step.querySelector('.ia-step__bar span');
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
      }
    });

    const advance = (index) => {
      if (index >= steps.length) {
        if (title) {
          title.textContent = 'IA carregada com sucesso';
        }
        if (status) {
          status.textContent = 'IA ativada. Direcionando você para a sequência guiada.';
        }
        if (badge) {
          badge.hidden = false;
        }
        if (subtitle) {
          subtitle.textContent = 'Conectando algoritmos estatísticos aos seus jogos...';
        }
        return;
      }

      const current = steps[index];
      current.setAttribute('data-state', 'active');
      const feedback = current.getAttribute('data-ia-status');
      if (status && feedback) {
        status.textContent = feedback;
      }
      const bar = current.querySelector('.ia-step__bar span');
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
        // force reflow
        void bar.offsetWidth;
        bar.style.transition = 'width 1s ease';
        requestAnimationFrame(() => {
          bar.style.width = '100%';
        });
      }

      window.setTimeout(() => {
        current.setAttribute('data-state', 'done');
        advance(index + 1);
      }, stepDuration);
    };

    advance(0);
  }

  function runPreloadingSequence() {
    const steps = Array.from(document.querySelectorAll('[data-preloading-step]'));
    if (!steps.length) {
      window.setTimeout(() => showSlide('video-manual-intro'), 1200);
      return;
    }
    const stepDuration = 1150;
    steps.forEach((step) => step.setAttribute('data-state', 'pending'));
    const animateStep = (index) => {
      if (index >= steps.length) {
        window.setTimeout(() => showSlide('video-manual-intro'), 450);
        return;
      }
      const stepEl = steps[index];
      stepEl.setAttribute('data-state', 'active');
      const bar = stepEl.querySelector('.preloading-step__bar span');
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
        bar.getBoundingClientRect();
        bar.style.transition = 'width 1s ease';
        requestAnimationFrame(() => {
          bar.style.width = '100%';
        });
      }
      window.setTimeout(() => {
        stepEl.setAttribute('data-state', 'done');
        animateStep(index + 1);
      }, stepDuration);
    };
    animateStep(0);
  }

  function openResultModal({
    role = 'manual',
    icon = 'ℹ️',
    title = '',
    message = '',
    note = '',
    sound,
    emojiRain: withEmoji = false,
  } = {}) {
    if (!modal || !modalContent) return;
    modalContent.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = `result-modal result-modal--${role}`;

    if (icon) {
      const iconEl = document.createElement('span');
      iconEl.className = 'result-modal__icon';
      iconEl.textContent = icon;
      wrapper.appendChild(iconEl);
    }

    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'result-modal__title';
      titleEl.textContent = title;
      wrapper.appendChild(titleEl);
    }

    if (message) {
      const messageEl = document.createElement('p');
      messageEl.className = 'result-modal__message';
      messageEl.textContent = message;
      wrapper.appendChild(messageEl);
    }

    if (note) {
      const noteEl = document.createElement('span');
      noteEl.className = 'result-modal__note';
      noteEl.textContent = note;
      wrapper.appendChild(noteEl);
    }

    modalContent.appendChild(wrapper);
    modal.dataset.visible = 'false';
    modal.removeAttribute('hidden');
    requestAnimationFrame(() => {
      modal.dataset.visible = 'true';
    });

    if (sound === 'cash') {
      playCashSound();
    } else if (sound === 'fail') {
      playFailSound();
    } else if (sound === 'click') {
      playClickSound();
    }

    if (withEmoji) {
      spawnEmojiRain();
    }
  }

  function closeModal(immediate = false) {
    if (!modal) return;
    if (immediate) {
      modal.dataset.visible = 'false';
      modal.setAttribute('hidden', 'true');
      if (modalContent) {
        modalContent.innerHTML = '';
      }
      hideEmojiRain();
      return;
    }
    modal.dataset.visible = 'false';
    window.setTimeout(() => {
      modal.setAttribute('hidden', 'true');
      if (modalContent) {
        modalContent.innerHTML = '';
      }
      hideEmojiRain();
    }, 260);
  }

  function spawnEmojiRain() {
    if (!emojiRain) return;
    hideEmojiRain();
    emojiRain.removeAttribute('hidden');
    const total = 16;
    for (let i = 0; i < total; i += 1) {
      const item = document.createElement('span');
      item.className = 'emoji-rain__item';
      item.textContent = emojiChoices[Math.floor(Math.random() * emojiChoices.length)];
      item.style.left = `${Math.random() * 100}%`;
      item.style.animationDelay = `${Math.random() * 0.6}s`;
      item.style.fontSize = `${1.7 + Math.random() * 0.9}rem`;
      emojiRain.appendChild(item);
    }
    window.setTimeout(() => hideEmojiRain(), 3400);
  }

  function hideEmojiRain() {
    if (!emojiRain) return;
    emojiRain.setAttribute('hidden', 'true');
    emojiRain.innerHTML = '';
  }

  function startSummaryCounters() {
    if (summaryAnimated) return;
    summaryAnimated = true;
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach((element) => {
      const key = element.dataset.counter;
      const format = element.dataset.format || (key?.startsWith('ia-') ? 'currency' : 'number');
      let target = Number(element.dataset.target) || 0;
      if (key === 'manual-total') {
        target = manualSummaryTotal || target;
      } else if (key === 'ia-total' || key === 'ia-cash') {
        target = guidedSummaryTotal || target;
      }
      animateCounter(element, target, { format });
    });
  }

  function animateCounter(element, target, { format = 'number', duration = 1800 } = {}) {
    const start = performance.now();
    const from = 0;
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = from + (target - from) * eased;
      element.textContent = formatValue(value, format);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = formatValue(target, format);
      }
    };
    requestAnimationFrame(step);
  }

  function formatValue(value, format) {
    if (format === 'currency') {
      return currencyFormatter.format(value);
    }
    return Math.round(value).toString();
  }

  function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
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

  // ========================================
  // Quiz Sticky Button Logic (Mobile)
  // ========================================
  const stickyButtonManager = (function() {
    const stickyContainer = document.querySelector('[data-quiz-sticky-button]');
    const buttonSlot = document.querySelector('[data-sticky-button-slot]');

    if (!stickyContainer || !buttonSlot) return null;

    let currentButton = null;
    let currentButtonOriginalParent = null;
    let currentStep = null;
    let showTimeout = null;

    // Map of steps to their button selectors
    const buttonSelectors = {
      'intro': '[data-next="preloading"]',
      'video-manual-intro': '[data-role="video-continue"][data-next="manual-select-1"]',
      'manual-select-1': '[data-action="verify-manual"][data-round="1"]',
      'manual-select-2': '[data-action="verify-manual"][data-round="2"]',
      'video-pre-ia': '[data-role="video-continue"][data-next="ia-activate"]',
      'ia-summary': '[data-next="video-post-ia"]',
      'video-post-ia': '[data-role="video-continue"][data-next="offer"]',
      // 'offer' is skipped - has separate sticky CTA
    };

    function returnButtonToOriginal() {
      // Return button to its ORIGINAL slide, not current slide
      if (currentButton && currentButtonOriginalParent) {
        // Check if original parent still exists in DOM
        if (document.body.contains(currentButtonOriginalParent)) {
          currentButtonOriginalParent.appendChild(currentButton);
        }
        currentButton = null;
        currentButtonOriginalParent = null;
        currentStep = null;
      }
    }

    function hideSticky() {
      clearTimeout(showTimeout);
      stickyContainer.classList.add('is-hidden');
      returnButtonToOriginal();
    }

    function showSticky(step) {
      // CRITICAL: Always return previous button first
      returnButtonToOriginal();

      // Skip offer section (has its own sticky CTA)
      if (step === 'offer') {
        hideSticky();
        return;
      }

      // Check if this step has an eligible button
      const buttonSelector = buttonSelectors[step];
      if (!buttonSelector) {
        hideSticky();
        return;
      }

      // Wait for DOM to update (nextTick)
      requestAnimationFrame(() => {
        // Find the button in the active slide
        const activeSlide = document.querySelector(`[data-step="${step}"].is-active`);
        if (!activeSlide) {
          hideSticky();
          return;
        }

        const button = activeSlide.querySelector(buttonSelector);
        if (!button) {
          console.warn(`Sticky button not found for step: ${step}, selector: ${buttonSelector}`);
          hideSticky();
          return;
        }

        // For video steps, only show sticky after video ends
        const isVideoStep = step.includes('video');
        if (isVideoStep) {
          // Check if button is still hidden/disabled (video not finished)
          if (button.hasAttribute('hidden') || button.classList.contains('is-hidden') || button.disabled) {
            // Don't show sticky yet - button not ready
            hideSticky();

            // Setup observer to show sticky when button becomes visible
            const observer = new MutationObserver((mutations) => {
              const isNowVisible = !button.hasAttribute('hidden') &&
                                  !button.classList.contains('is-hidden') &&
                                  !button.disabled;

              if (isNowVisible) {
                observer.disconnect();
                // Trigger sticky show now that video finished
                showSticky(step);
              }
            });

            observer.observe(button, {
              attributes: true,
              attributeFilter: ['hidden', 'class', 'disabled']
            });

            return;
          }
        }

        // For manual select steps, only show when all numbers selected
        const isManualStep = step.includes('manual-select');
        if (isManualStep) {
          // Get round number
          const round = step.endsWith('2') ? 2 : 1;
          const state = manualState.get(round);

          // Check if all numbers are selected
          if (state && state.selected.size < 15) {
            // Don't show sticky yet - not all numbers selected
            hideSticky();

            // Setup observer to watch manual selection
            const checkManualComplete = () => {
              if (state.selected.size === 15) {
                // All numbers selected, show sticky
                showSticky(step);
              }
            };

            // Listen for number selections (poor man's observer via interval)
            const manualInterval = setInterval(() => {
              if (state.selected.size === 15) {
                clearInterval(manualInterval);
                showSticky(step);
              }
              // Stop if slide changed
              const stillActive = document.querySelector(`[data-step="${step}"].is-active`);
              if (!stillActive) {
                clearInterval(manualInterval);
              }
            }, 300);

            return;
          }
        }

        // Store original parent and step
        currentButtonOriginalParent = button.parentElement;
        currentButton = button;
        currentStep = step;

        // Add click listener to hide sticky when button is clicked
        const clickHandler = () => {
          hideSticky();
          button.removeEventListener('click', clickHandler);
        };
        button.addEventListener('click', clickHandler, { once: true });

        // Move button to sticky container
        buttonSlot.appendChild(button);

        // Show sticky with delay for motion effect
        clearTimeout(showTimeout);
        showTimeout = setTimeout(() => {
          stickyContainer.classList.remove('is-hidden');
        }, 300); // 300ms delay for smooth entrance
      });
    }

    return {
      show: showSticky,
      hide: hideSticky
    };
  })();

  // ========================================
  // Sticky CTA Logic
  // ========================================
  (function initStickyCta() {
    const stickyCta = document.querySelector('[data-sticky-cta]');
    const stickyCtaBtn = document.querySelector('[data-sticky-cta-btn]');
    const offerSection = document.querySelector('[data-step="offer"]');

    // Observe the pricing element specifically (the "paywall")
    const pricingElement = offerSection ? offerSection.querySelector('.offer-pricing') : null;

    if (!stickyCta || !pricingElement) return;

    // Track if user has scrolled past the paywall
    let hasPassedPaywall = false;

    // IntersectionObserver to detect when pricing element is in/out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When pricing is NOT intersecting (user scrolled past the paywall)
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            // User scrolled down past the paywall
            hasPassedPaywall = true;
            stickyCta.classList.remove('is-hidden');
          } else if (entry.isIntersecting && hasPassedPaywall) {
            // User scrolled back up to the paywall
            stickyCta.classList.add('is-hidden');
          }
        });
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '0px'
      }
    );

    observer.observe(pricingElement);

    // Pixel tracking on CTA click (using same functions as main Kirvano button)
    if (stickyCtaBtn) {
      stickyCtaBtn.addEventListener('click', function() {
        fbSafeTrack('InitiateCheckout');
        fbSafeTrackCustom('StickyCtaClick');
      });
    }
  })();
});
