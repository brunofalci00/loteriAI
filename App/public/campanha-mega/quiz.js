document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.quiz-slide'));
  const slideByStep = new Map(slides.map((slide) => [slide.dataset.step, slide]));
  let currentStep =
    slides.find((slide) => slide.classList.contains('is-active'))?.dataset.step ?? null;
  let autoTimer = null;

  const autoAdvance = {
    preloading: { next: 'manual-select-1', delay: 5200 },
    'ia-activate': { next: 'guided-select-1', delay: 4200 },
  };

  const MANUAL_CONFIG = {
    limit: 6,
    hits: 1,
    nextStep: 'ia-activate',
  };

  const IA_CONFIG = {
    sequence: [5, 14, 23, 34, 45, 52],
    hits: 5,
    gain: 18500000,
    nextStep: 'ia-summary',
    progressKey: 'guided-1',
    balanceKey: '1',
  };
  const PIXEL_EVENT_VALUE = 37;
  let leadTracked = false;

  function isFbqAvailable() {
    return typeof window !== 'undefined' && typeof window.fbq === 'function';
  }

  function trackStandardEvent(name, params = {}) {
    if (isFbqAvailable()) {
      window.fbq('track', name, params);
    }
  }

  function trackCustomEvent(name, params = {}) {
    if (isFbqAvailable()) {
      window.fbq('trackCustom', name, params);
    }
  }

  function trackLeadOnce(stage) {
    if (leadTracked) return;
    trackStandardEvent('Lead', { step: stage });
    leadTracked = true;
  }

  function trackCheckoutEvents(source) {
    const payload = { value: PIXEL_EVENT_VALUE, currency: 'BRL', source };
    trackStandardEvent('AddToCart', payload);
    trackStandardEvent('InitiateCheckout', payload);
    trackStandardEvent('AddPaymentInfo', payload);
  }

  function attachCheckoutTracking() {
    const checkoutLinks = document.querySelectorAll('[data-hubla-link][data-checkout-source]');
    checkoutLinks.forEach((link) => {
      if (link.dataset.checkoutTrackingBound === 'true') {
        return;
      }
      link.dataset.checkoutTrackingBound = 'true';
      link.addEventListener('click', () => {
        trackCheckoutEvents(link.dataset.checkoutSource || 'checkout');
      });
    });
  }

  function trackStepView(step) {
    trackCustomEvent('StepView', { step });
    if (step === 'ia-summary') {
      trackLeadOnce('ia-summary');
    }
  }


  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

  const manualState = {
    grid: null,
    selected: new Set(),
    feedback: null,
    status: null,
    limit: MANUAL_CONFIG.limit,
    completed: false,
  };

  const guidedState = {
    grid: null,
    feedback: null,
    progress: null,
    balanceEl: null,
    sequence: IA_CONFIG.sequence.slice(),
    index: 0,
    completed: false,
    revealed: false,
    previewDone: false,
  };

  const quizModal = document.querySelector('[data-modal]');
  const quizModalContent = quizModal?.querySelector('[data-modal-content]');
  const quizModalBackdrop = quizModal?.querySelector('[data-modal-backdrop]');
  const modalCallbacks = { primary: null, secondary: null };
  let modalOptions = { dismissible: true };

  let manualResultTimer = null;
  let iaResultTimer = null;

  const stickyCta = document.querySelector('[data-sticky-cta]');
  const videoGate = createVideoGate();
  const preloadingSequence = createPreloadingSequence();
  const iaActivation = createIaActivation();
  const emojiRain = createEmojiRain();
  const guidedPreview = createGuidedPreview();

  initManualGrid();
  initGuidedGrid();
  updateAccessDeadlines();
  wireGlobalEvents();
  updateSummaryCounters();
  attachCheckoutTracking();
  if (currentStep) {
    trackStepView(currentStep);
  }

  if (currentStep === 'manual-select-1') {
    resetManualRound(true);
  }
  if (currentStep === 'guided-select-1') {
    resetGuidedRound(true);
  }
  if (currentStep === 'preloading') {
    preloadingSequence.activate();
  }
  if (currentStep === 'ia-activate') {
    iaActivation.activate();
  }
  if (currentStep === 'video-post-ia') {
    videoGate.activate();
  }
  if (currentStep && autoAdvance[currentStep]) {
    const { next, delay } = autoAdvance[currentStep];
    autoTimer = window.setTimeout(() => showSlide(next), delay);
  }

  function wireGlobalEvents() {
    const resolveNextButton = (target) => {
      if (target instanceof HTMLElement) {
        return target.closest('[data-next]');
      }
      if (target instanceof Node && target.parentElement) {
        return target.parentElement.closest('[data-next]');
      }
      return null;
    };

    document.addEventListener('click', (event) => {
      const target = event.target;
      const nextBtn = resolveNextButton(target);
      if (nextBtn instanceof HTMLElement) {
        event.preventDefault();
        const step = nextBtn.getAttribute('data-next');
        if (step) {
          showSlide(step);
        }
        return;
      }

      const manualBtn = target.closest('[data-action="verify-manual"]');
      if (manualBtn) {
        event.preventDefault();
        handleManualVerification(manualBtn);
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
        if (modalOptions.dismissible) {
          closeQuizModal();
        }
        return;
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isQuizModalOpen() && modalOptions.dismissible) {
        event.preventDefault();
        closeQuizModal();
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
    clearTimeout(autoTimer);

    if (currentStep === 'preloading') {
      preloadingSequence.deactivate();
    }
    if (currentStep === 'ia-activate') {
      iaActivation.deactivate();
    }
    if (currentStep === 'video-post-ia') {
      videoGate.deactivate();
    }
    if (currentStep === 'guided-select-1') {
      guidedPreview.stop();
    }

    slides.forEach((slide) => {
      slide.classList.toggle('is-active', slide.dataset.step === step);
    });

    currentStep = step;
    trackStepView(step);

    if (step === 'manual-select-1') {
      resetManualRound(true);
    }
    if (step === 'guided-select-1') {
      resetGuidedRound(true);
    }
    if (step === 'preloading') {
      preloadingSequence.activate();
    }
    if (step === 'ia-activate') {
      iaActivation.activate();
    }
    if (step === IA_CONFIG.nextStep) {
      updateSummaryCounters();
    }
    if (step === 'video-post-ia') {
      videoGate.activate();
    }

    if (step === 'offer') {
      showStickyCta();
    } else {
      hideStickyCta();
    }

    const advance = autoAdvance[step];
    if (advance?.next) {
      autoTimer = window.setTimeout(() => showSlide(advance.next), advance.delay);
    }
  }

  function initManualGrid() {
    const grid = document.querySelector('.number-grid[data-mode="manual"][data-round="1"]');
    if (!grid) return;
    manualState.grid = grid;
    manualState.feedback =
      document.querySelector('[data-manual-feedback="1"]') || attachManualFeedback(grid);
    manualState.status = document.querySelector('[data-manual-status="1"]') || null;
    populateNumberButtons(grid, toggleManualNumber);
    updateManualFeedback();
  }

  function initGuidedGrid() {
    const grid = document.querySelector('.number-grid[data-mode="guided"][data-sequence="1"]');
    if (!grid) return;
    guidedState.grid = grid;
    guidedState.feedback = document.querySelector('[data-guided-feedback="1"]') || null;
    guidedState.progress = document.querySelector(`[data-progress="${IA_CONFIG.progressKey}"]`);
    guidedState.balanceEl = document.querySelector(`[data-guided-balance="${IA_CONFIG.balanceKey}"]`);
    populateNumberButtons(grid, handleGuidedClick);
    guidedState.previewDone = false;
    updateGuidedProgress();
    updateGuidedBalance();
    guidedState.grid.querySelectorAll('button').forEach((btn) => {
      btn.disabled = true;
      btn.classList.remove('guided-target', 'guided-success', 'guided-error');
    });
  }

  function toggleManualNumber(value, button) {
    if (manualState.completed) return;
    const { selected } = manualState;
    if (selected.has(value)) {
      selected.delete(value);
      button.classList.remove('selected');
    } else {
      if (selected.size >= manualState.limit) {
        flashManualLimit();
        return;
      }
      selected.add(value);
      button.classList.add('selected');
    }
    updateManualFeedback();
  }

  function updateManualFeedback(override, state) {
    const { feedback, status, selected, limit } = manualState;
    if (!feedback) return;

    const formatQty = (value) => `${value} ${value === 1 ? 'dezena' : 'dezenas'}`;

    if (override) {
      feedback.textContent = override;
      if (state) {
        feedback.dataset.state = state;
      } else {
        feedback.removeAttribute('data-state');
      }
      return;
    }

    const remaining = limit - selected.size;
    if (remaining <= 0) {
      feedback.textContent = `Pronto! Você completou as ${formatQty(limit)}.`;
      feedback.dataset.state = 'ready';
    } else if (remaining <= 2) {
      feedback.textContent = `Faltam apenas ${formatQty(remaining)}.`;
      feedback.dataset.state = 'warning';
    } else {
      feedback.textContent = `Toque nas dezenas até completar as ${formatQty(limit)}.`;
      feedback.removeAttribute('data-state');
    }

    if (status) {
      status.textContent = `Etapa 1 de 2 — ${selected.size}/${limit} selecionadas`;
    }
  }

  function flashManualLimit() {
    const { feedback, limit } = manualState;
    if (!feedback) return;
    feedback.dataset.state = 'error';
    feedback.textContent = `Você já escolheu as ${limit} dezenas.`;
    window.setTimeout(() => updateManualFeedback(), 1100);
  }

  function handleManualVerification(button) {
    if (manualState.completed) {
      showSlide(MANUAL_CONFIG.nextStep);
      return;
    }
    const { selected, limit } = manualState;
    if (selected.size !== limit) {
      updateManualFeedback(`Selecione as ${limit} dezenas antes de continuar.`, 'error');
      button.classList.add('shake');
      window.setTimeout(() => button.classList.remove('shake'), 400);
      return;
    }

    updateManualFeedback('Analisando seu jogo manual...', 'warning');
    button.disabled = true;

    manualResultTimer = window.setTimeout(() => {
      button.disabled = false;
      manualState.completed = true;
      manualState.grid?.querySelectorAll('button').forEach((btn) => {
        btn.disabled = true;
      });
      showManualResultModal();
    }, 900);
  }

  function resetManualRound(force = false) {
    if (!manualState.grid) return;
    if (!force && manualState.completed) return;
    manualState.completed = false;
    manualState.selected.clear();
    manualState.grid.querySelectorAll('button').forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove('selected');
    });
    updateManualFeedback();
  }

  function handleGuidedClick(value, button) {
    if (!guidedState.previewDone) {
      updateGuidedFeedback('Aguarde a IA concluir a apresentação das dezenas.');
      return;
    }
    if (guidedState.completed) return;
    const expected = guidedState.sequence[guidedState.index];
    if (value === expected) {
      button.classList.remove('guided-target');
      button.classList.add('guided-success');
      button.disabled = true;
      guidedState.index += 1;
      updateGuidedProgress();
      updateGuidedBalance();
      if (guidedState.index >= guidedState.sequence.length) {
        guidedState.completed = true;
        guidedState.revealed = false;
        guidedState.grid?.querySelectorAll('button').forEach((btn) => (btn.disabled = true));
        updateGuidedFeedback('Sequência concluída! Calculando resultado da IA...');
        iaResultTimer = window.setTimeout(showIaResultModal, 700);
      } else {
        updateGuidedFeedback(
          `Perfeito! Dezena ${String(value).padStart(2, '0')} confirmada. Próximo destaque liberado.`
        );
        highlightNextGuided();
      }
    } else {
      button.classList.add('guided-error');
      updateGuidedFeedback('Ops! Clique apenas na dezena destacada pela IA.');
      window.setTimeout(() => button.classList.remove('guided-error'), 320);
    }
  }

  function resetGuidedRound(force = false, options = {}) {
    const { skipPreview = false } = options;
    if (!guidedState.grid) return;
    if (!force && guidedState.completed) return;
    guidedPreview.stop();
    guidedState.index = 0;
    guidedState.completed = false;
    guidedState.revealed = false;
    guidedState.previewDone = Boolean(skipPreview);
    guidedState.grid.querySelectorAll('button').forEach((btn) => {
      btn.disabled = true;
      btn.classList.remove('guided-target', 'guided-success', 'guided-error');
    });
    updateGuidedProgress();
    updateGuidedBalance();
    if (skipPreview) {
      guidedState.grid.querySelectorAll('button').forEach((btn) => (btn.disabled = false));
      updateGuidedFeedback('Vamos começar! Clique na dezena destacada.');
      highlightNextGuided();
      return;
    }
    updateGuidedFeedback('Observe a IA selecionando as dezenas ideais para você...');
    guidedPreview.start(() => {
      guidedState.previewDone = true;
      guidedState.grid?.querySelectorAll('button').forEach((btn) => {
        btn.disabled = false;
      });
      updateGuidedFeedback('Agora clique nas dezenas na ordem que a IA mostrou.');
      highlightNextGuided();
    });
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
    const value = guidedState.revealed ? IA_CONFIG.gain : 0;
    guidedState.balanceEl.textContent = formatCurrency(value);
  }

  function updateGuidedFeedback(message) {
    if (!guidedState.feedback) return;
    guidedState.feedback.textContent = message;
  }

  function showManualResultModal() {
    modalOptions.dismissible = false;
    trackLeadOnce('manual-complete');
    const content = `
      <div class="result-modal result-modal--manual">
        <div class="result-modal__icon" aria-hidden="true">☹️</div>
        <h3 class="result-modal__headline">
          <span class="result-modal__status result-modal__status--fail">Jogo manual: apenas ${MANUAL_CONFIG.hits} acerto.</span>
        </h3>
        <p class="result-modal__message">Com a sorte sozinha não dá. Vamos liberar a IA.</p>
        <p class="result-modal__note">Avançando automaticamente...</p>
      </div>
    `;
    openQuizModal(content);
    manualResultTimer = window.setTimeout(() => {
      manualResultTimer = null;
      closeQuizModal();
      showSlide(MANUAL_CONFIG.nextStep);
    }, 2000);
  }

  function showIaResultModal() {
    modalOptions.dismissible = false;
    guidedState.revealed = true;
    updateGuidedBalance();
    emojiRain.shoot();
    const content = `
      <div class="result-modal result-modal--success result-modal--jackpot">
        <div class="result-modal__burst" aria-hidden="true"></div>
        <div class="result-modal__icon" aria-hidden="true">&#x1F4B0;</div>
        <h3 class="result-modal__headline">
          <span class="result-modal__status result-modal__status--success">IA cravou ${IA_CONFIG.hits} de 6 dezenas!</span>
        </h3>
        <p class="result-modal__message">Simulação indica prêmio de ${formatCurrency(
          IA_CONFIG.gain
        )} seguindo a sequencia inteligente.</p>
        <p class="result-modal__note result-modal__note--celebration">Segure firme! Destravando sua oferta especial...</p>
      </div>
    `;
    openQuizModal(content);
    iaResultTimer = window.setTimeout(() => {
      iaResultTimer = null;
      closeQuizModal();
      showSlide(IA_CONFIG.nextStep);
    }, 2000);
  }

  function openQuizModal(content, callbacks = {}) {
    if (!quizModal || !quizModalContent) return;
    quizModalContent.innerHTML = content;
    modalCallbacks.primary = callbacks.onPrimary || null;
    modalCallbacks.secondary = callbacks.onSecondary || null;
    quizModal.hidden = false;
    requestAnimationFrame(() => quizModal.setAttribute('data-visible', 'true'));
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

  function showStickyCta() {
    if (!stickyCta) return;
    stickyCta.classList.remove('is-hidden');
  }

  function hideStickyCta() {
    if (!stickyCta) return;
    stickyCta.classList.add('is-hidden');
  }

  function updateAccessDeadlines() {
    const today = new Date();
    const months = [
      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro',
    ];
    const day = today.getDate();
    const monthIndex = today.getMonth();
    const longDate = `${day} de ${months[monthIndex]}`;
    const shortDate = `${String(day).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}`;
    document.querySelectorAll('.access-deadline--long').forEach((element) => {
      element.textContent = longDate;
    });
    document.querySelectorAll('.access-deadline--short').forEach((element) => {
      element.textContent = shortDate;
    });
  }

  function updateSummaryCounters() {
    const manualCounter = document.querySelector('[data-counter="manual-total"]');
    if (manualCounter) {
      manualCounter.textContent = MANUAL_CONFIG.hits.toString();
    }
    const iaGainCounter = document.querySelector('[data-counter="ia-total"]');
    if (iaGainCounter) {
      iaGainCounter.textContent = formatCurrency(IA_CONFIG.gain);
    }
    const iaCashCounter = document.querySelector('[data-counter="ia-cash"]');
    if (iaCashCounter) {
      iaCashCounter.textContent = formatCurrency(IA_CONFIG.gain);
    }
  }

  function populateNumberButtons(container, onSelect) {
    container.innerHTML = '';
    for (let i = 1; i <= 60; i += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(i).padStart(2, '0');
      button.dataset.value = String(i);
      button.addEventListener('click', () => onSelect(i, button));
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

  function createVideoGate() {
    const section = document.querySelector('[data-video-gate]');
    if (!section) {
      return {
        activate() {},
        deactivate() {},
      };
    }
    const video = section.querySelector('video');
    const continueButton = section.querySelector('[data-role="video-continue"]');
    const playButton = section.querySelector('[data-role="video-play"]');
    const hint = section.querySelector('[data-role="video-hint"]');
    const progressBar = section.querySelector('[data-role="video-progress-bar"]');
    const defaultHintText = hint?.textContent ?? '';
    if (!video || !continueButton) {
      return {
        activate() {},
        deactivate() {},
      };
    }

    const WATCH_MIN_SECONDS = 3;
    const WATCH_MIN_RATIO = 0.15;

    let unlocked = false;
    let thresholdSeconds = WATCH_MIN_SECONDS;
    let watchTimer = null;
    let fallbackTimer = null;

    const clearWatchTimer = () => {
      if (watchTimer) {
        window.clearTimeout(watchTimer);
        watchTimer = null;
      }
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const hidePlayOverlay = () => {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    };

    const showPlayOverlay = () => {
      if (!playButton || unlocked) return;
      playButton.classList.remove('is-hidden');
    };

    const updateHintForThreshold = () => {
      if (!hint || unlocked) return;
      if (!Number.isFinite(thresholdSeconds) || thresholdSeconds <= 0) {
        hint.textContent = 'Assista ao vídeo para liberar a oferta especial.';
      } else {
        const seconds = Math.max(1, Math.round(thresholdSeconds));
        hint.textContent = 'Assista pelo menos ' + seconds + ' segundos para liberar a oferta.';
      }
      hint.classList.remove('is-hidden');
    };

    const enableContinue = (reason = 'threshold') => {
      if (unlocked) return;
      unlocked = true;
      clearWatchTimer();
      continueButton.disabled = false;
      continueButton.classList.remove('is-hidden');
      hidePlayOverlay();
      if (!hint) return;
      if (reason === 'error') {
        hint.textContent = 'Nao foi possivel carregar o video. Clique para seguir.';
        hint.classList.remove('is-hidden');
      } else {
        hint.textContent = defaultHintText;
        hint.classList.add('is-hidden');
      }
    };

    const scheduleWatchTimer = () => {
      clearWatchTimer();
      if (unlocked) return;
      if (!Number.isFinite(thresholdSeconds) || thresholdSeconds <= 0) {
        enableContinue('threshold');
        return;
      }
      watchTimer = window.setTimeout(() => enableContinue('timer'), thresholdSeconds * 1000);
    };

    const evaluateProgress = () => {
      if (unlocked) return;
      if (Number.isFinite(thresholdSeconds) && thresholdSeconds > 0) {
        if (Number(video.currentTime) >= thresholdSeconds) {
          enableContinue('progress');
        }
      }
    };

    const updateProgress = () => {
      if (progressBar) {
        const duration = Number(video.duration);
        const progress = Number(video.currentTime);
        if (!Number.isFinite(duration) || duration <= 0) {
          progressBar.style.width = '0%';
        } else {
          progressBar.style.width = String(Math.min((progress / duration) * 100, 100)) + '%';
        }
      }
      evaluateProgress();
    };

    const computeThreshold = () => {
      const duration = Number(video.duration);
      if (Number.isFinite(duration) && duration > 0) {
        const ratioSeconds = duration * WATCH_MIN_RATIO;
        thresholdSeconds = Math.min(WATCH_MIN_SECONDS, ratioSeconds);
        if (!Number.isFinite(thresholdSeconds) || thresholdSeconds <= 0) {
          thresholdSeconds = 0;
        }
      } else {
        thresholdSeconds = WATCH_MIN_SECONDS;
      }
      updateHintForThreshold();
      scheduleWatchTimer();
      evaluateProgress();
    };

    const handleAutoplayFailure = () => {
      video.setAttribute('controls', 'controls');
      showPlayOverlay();
      if (hint) {
        hint.textContent = 'Toque no video para iniciar a reproducao.';
        hint.classList.remove('is-hidden');
      }
    };

    const attemptPlay = () => {
      const duration = Number(video.duration);
      const progress = Number(video.currentTime);
      if (Number.isFinite(duration) && progress >= duration) {
        video.currentTime = 0;
      }
      try {
        const playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(handleAutoplayFailure);
        } else {
          hidePlayOverlay();
        }
      } catch (error) {
        handleAutoplayFailure();
      }
    };

    const reset = () => {
      unlocked = false;
      thresholdSeconds = WATCH_MIN_SECONDS;
      clearWatchTimer();
      continueButton.disabled = true;
      continueButton.classList.remove('is-hidden');
      continueButton.style.display = '';
      if (hint) {
        hint.textContent = defaultHintText;
        hint.classList.remove('is-hidden');
        hint.style.display = '';
      }
      if (progressBar) progressBar.style.width = '0%';
      hidePlayOverlay();
      try {
        video.currentTime = 0;
        video.pause();
        video.removeAttribute('controls');
      } catch (error) {
        // ignore
      }
      updateHintForThreshold();
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', () => {
      updateProgress();
      computeThreshold();
    });
    video.addEventListener('canplay', () => {
      // Vídeo pronto para reproduzir
      if (!unlocked) {
        console.log('Vídeo pronto para reproduzir');
      }
    });
    video.addEventListener('play', () => {
      hidePlayOverlay();
      if (!watchTimer) {
        scheduleWatchTimer();
      }
      if (hint && !unlocked) {
        updateHintForThreshold();
      }
    });
    video.addEventListener('pause', () => {
      if (!unlocked) {
        showPlayOverlay();
      }
    });
    video.addEventListener('ended', () => {
      enableContinue('ended');
      updateProgress();
    });
    video.addEventListener('error', () => {
      console.log('Erro ao carregar vídeo, liberando botão');
      enableContinue('error');
    });
    video.addEventListener('loadeddata', () => {
      console.log('Vídeo carregou dados');
    });

    if (playButton) {
      playButton.addEventListener('click', (event) => {
        event.preventDefault();
        attemptPlay();
      });
    }

    continueButton.addEventListener('click', () => {
      const next = continueButton.getAttribute('data-next');
      if (next) {
        showSlide(next);
      }
    });

    return {
      activate() {
        reset();
        computeThreshold();
        attemptPlay();

        // Se o vídeo não iniciar em 2 segundos, mostra o botão de play
        window.setTimeout(() => {
          if (video.paused && !unlocked) {
            showPlayOverlay();
            video.setAttribute('controls', 'controls');
            if (hint) {
              hint.textContent = 'Clique para iniciar o vídeo';
            }
          }
        }, 2000);

        // Fallback: liberar botão após 10 segundos independente do que acontecer
        fallbackTimer = window.setTimeout(() => {
          if (!unlocked) {
            console.log('Fallback: liberando botão após timeout');
            enableContinue('fallback');
          }
        }, 10000);
      },
      deactivate() {
        video.pause();
        hidePlayOverlay();
        clearWatchTimer();
      },
    };
  }

  function formatCurrency(value) {
    return currencyFormatter.format(Math.max(0, value));
  }

  function createPreloadingSequence() {
    const container = document.querySelector('[data-preloading]');
    if (!container) {
      return { activate() {}, deactivate() {} };
    }
    const steps = Array.from(container.querySelectorAll('[data-preloading-step]'));
    let timers = [];

    return {
      activate() {
        steps.forEach((step, index) => {
          const bar = step.querySelector('.preloading-step__bar span');
          const timer = window.setTimeout(() => {
            step.dataset.state = 'active';
            if (bar) {
              bar.style.width = '100%';
              window.setTimeout(() => {
                step.dataset.state = 'done';
              }, 400);
            }
          }, index * 900);
          timers.push(timer);
        });
      },
      deactivate() {
        timers.forEach(timer => window.clearTimeout(timer));
        timers = [];
        steps.forEach(step => {
          step.removeAttribute('data-state');
          const bar = step.querySelector('.preloading-step__bar span');
          if (bar) bar.style.width = '0%';
        });
      }
    };
  }

  function createIaActivation() {
    const steps = Array.from(document.querySelectorAll('[data-ia-step]'));
    const statusEl = document.querySelector('[data-ia-status]');
    const titleEl = document.querySelector('[data-ia-title]');
    const subtitleEl = document.querySelector('[data-ia-subtitle]');
    const badgeEl = document.querySelector('[data-ia-badge]');
    let timers = [];

    return {
      activate() {
        steps.forEach((step, index) => {
          const bar = step.querySelector('.ia-step__bar span');
          const timer = window.setTimeout(() => {
            step.dataset.state = 'active';
            const status = step.dataset.iaStatus;
            if (statusEl && status) statusEl.textContent = status;
            if (bar) {
              bar.style.width = '100%';
              window.setTimeout(() => {
                step.dataset.state = 'done';
              }, 600);
            }
          }, index * 1200);
          timers.push(timer);
        });

        const finalTimer = window.setTimeout(() => {
          if (statusEl) statusEl.textContent = 'IA ativada com sucesso!';
          if (titleEl) titleEl.textContent = 'Loter.IA ativada e pronta!';
          if (subtitleEl) subtitleEl.textContent = 'Preparando seu painel inteligente...';
          if (badgeEl) badgeEl.hidden = false;
        }, steps.length * 1200);
        timers.push(finalTimer);
      },
      deactivate() {
        timers.forEach(timer => window.clearTimeout(timer));
        timers = [];
        steps.forEach(step => {
          step.removeAttribute('data-state');
          const bar = step.querySelector('.ia-step__bar span');
          if (bar) bar.style.width = '0%';
        });
        if (badgeEl) badgeEl.hidden = true;
      }
    };
  }

  function createEmojiRain() {
    const container = document.querySelector('[data-emoji-rain]');
    if (!container) {
      return { shoot() {} };
    }
    const emojis = ['💰', '💎', '🏆', '⭐', '🎯', '🔥'];

    return {
      shoot() {
        container.hidden = false;
        for (let i = 0; i < 30; i++) {
          window.setTimeout(() => {
            const item = document.createElement('div');
            item.className = 'emoji-rain__item';
            item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            item.style.left = Math.random() * 100 + '%';
            item.style.animationDelay = Math.random() * 0.5 + 's';
            item.style.animationDuration = 2.5 + Math.random() * 1 + 's';
            container.appendChild(item);
            window.setTimeout(() => item.remove(), 4000);
          }, i * 100);
        }
        window.setTimeout(() => {
          container.hidden = true;
        }, 4000);
      }
    };
  }

  function createGuidedPreview() {
    let timer = null;
    let stepTimers = [];

    return {
      start(onComplete) {
        if (!guidedState.grid) {
          onComplete?.();
          return;
        }

        const buttons = guidedState.grid.querySelectorAll('button');
        stepTimers = [];

        guidedState.sequence.forEach((value, index) => {
          const btn = guidedState.grid.querySelector(`button[data-value="${value}"]`);
          if (!btn) return;

          btn.classList.add('guided-preview');
          btn.dataset.previewStep = String(index + 1);

          const stepTimer = window.setTimeout(() => {
            btn.classList.add('guided-preview--active');
            window.setTimeout(() => {
              btn.classList.remove('guided-preview--active');
              btn.classList.add('guided-preview--done');
            }, 900);
          }, index * 1000);

          stepTimers.push(stepTimer);
        });

        timer = window.setTimeout(() => {
          buttons.forEach(btn => {
            btn.classList.remove('guided-preview', 'guided-preview--active', 'guided-preview--done');
            delete btn.dataset.previewStep;
          });
          onComplete?.();
        }, guidedState.sequence.length * 1000 + 500);
      },
      stop() {
        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }
        stepTimers.forEach(t => window.clearTimeout(t));
        stepTimers = [];

        if (guidedState.grid) {
          guidedState.grid.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('guided-preview', 'guided-preview--active', 'guided-preview--done');
            delete btn.dataset.previewStep;
          });
        }
      }
    };
  }
});
