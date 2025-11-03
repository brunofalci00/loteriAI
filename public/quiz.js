document.addEventListener('DOMContentLoaded', () => {
  const slides = new Map(
    Array.from(document.querySelectorAll('.quiz-slide')).map((slide) => [slide.dataset.step, slide])
  );
  let currentStep =
    Array.from(slides.values()).find((slide) => slide.classList.contains('is-active'))?.dataset.step ?? null;

  const manualGrid = document.querySelector('[data-grid-manual]');
  const manualCountEl = document.querySelector('[data-manual-count]');
  const manualFeedback = document.querySelector('[data-manual-feedback]');
  const manualHitsEl = document.querySelector('[data-manual-hits]');

  const guidedGrid = document.querySelector('[data-grid-guided]');
  const guidedFeedback = document.querySelector('[data-guided-feedback]');

  const progressFill = document.querySelector('[data-progress-fill]');
  const drawStatus = document.querySelector('[data-draw-status]');
  const drawList = document.querySelector('[data-draw-list]');

  const modal = document.querySelector('[data-modal]');
  const modalContent = modal?.querySelector('[data-modal-content]');
  const emojiContainer = document.querySelector('[data-emoji-rain]');

  const offerTimerDisplay = document.querySelector('[data-offer-timer]');

  const MANUAL_CONFIG = {
    limit: 15,
    hits: 8,
  };

  const IA_CONFIG = {
    sequence: [1, 3, 5, 8, 9, 13, 14, 16, 18, 19, 21, 22, 23, 24, 25],
    hits: 14,
    prizeValue: 1887.73,
  };

  const DRAW_SEQUENCE = [3, 7, 12, 18, 21, 2, 9, 15, 24, 5, 11, 17, 20, 22, 25];
  const DRAW_INTERVAL = 260;

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

  const AUDIO_SOURCES = {
    select: 'start-13691.mp3',
    win: 'cashier-quotka-chingquot-sound-effect-129698.mp3',
  };
  const audioCache = new Map();

  const manualState = {
    selected: new Set(),
    locked: false,
    buttons: [],
  };

  const guidedState = {
    index: 0,
    locked: false,
    buttons: [],
  };

  let offerTimerId = null;
  let offerTimerStarted = false;
  let modalHandlers = { onPrimary: null, onSecondary: null };
  const drawState = { timers: [], inProgress: false };

  function formatCurrency(value) {
    return currencyFormatter.format(value);
  }

  function playSound(key, volume = 0.8) {
    const src = AUDIO_SOURCES[key];
    if (!src) return;
    if (!audioCache.has(key)) {
      const base = new Audio(src);
      base.preload = 'auto';
      audioCache.set(key, base);
    }
    const base = audioCache.get(key);
    const instance = base.cloneNode(true);
    instance.volume = volume;
    instance.play().catch(() => {});
  }

  function showSlide(step) {
    if (!slides.has(step) || currentStep === step) return;
    const previous = currentStep;
    slides.forEach((slide, key) => slide.classList.toggle('is-active', key === step));
    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (previous === 'preloading' && step !== 'preloading') {
      stopDrawSimulation();
    }
    if (step === 'offer' && !offerTimerStarted) {
      startOfferTimer();
    }
  }

  function startDrawSimulation(onComplete) {
    if (!drawList) {
      onComplete?.();
      return;
    }
    stopDrawSimulation();
    drawState.inProgress = true;
    drawState.timers = [];
    drawList.innerHTML = '';
    if (progressFill) {
      progressFill.style.width = '0%';
    }
    updateDrawStatus('Iniciando sorteio...');

    const total = DRAW_SEQUENCE.length;
    DRAW_SEQUENCE.forEach((value, index) => {
      const timer = window.setTimeout(() => {
        appendDrawNumber(value);
        if (progressFill) {
          const width = Math.min(((index + 1) / total) * 100, 100);
          progressFill.style.width = `${width}%`;
        }
        const currentCount = index + 1;
        updateDrawStatus(`Sorteando n\u00famero ${String(currentCount).padStart(2, '0')}/${total}...`);
        if (currentCount === total) {
          drawState.timers.push(
            window.setTimeout(() => {
              updateDrawStatus('Sorteio finalizado!');
              drawState.inProgress = false;
              onComplete?.();
            }, 520)
          );
        }
      }, index * DRAW_INTERVAL);
      drawState.timers.push(timer);
    });
  }

  function appendDrawNumber(value) {
    const item = document.createElement('span');
    item.className = 'draw-number';
    item.textContent = String(value).padStart(2, '0');
    drawList.appendChild(item);
    requestAnimationFrame(() => item.classList.add('draw-number--active'));
  }

  function updateDrawStatus(message) {
    if (drawStatus) {
      drawStatus.textContent = message;
    }
  }

  function stopDrawSimulation() {
    drawState.timers.forEach((id) => window.clearTimeout(id));
    drawState.timers = [];
    if (drawState.inProgress) {
      drawState.inProgress = false;
    }
    if (drawStatus) {
      drawStatus.textContent = 'Preparando sorteio...';
    }
    if (progressFill) {
      progressFill.style.width = '0%';
    }
    if (drawList) {
      drawList.innerHTML = '';
    }
  }

  function updateManualCount() {
    if (manualCountEl) {
      manualCountEl.textContent = manualState.selected.size.toString();
    }
  }

  function updateManualFeedback(message, tone = 'neutral') {
    if (!manualFeedback) return;
    manualFeedback.textContent = message;
    manualFeedback.dataset.tone = tone;
  }

  function populateManualGrid() {
    if (!manualGrid) return;
    manualState.buttons = [];
    manualGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= 25; i += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'number-button';
      button.textContent = String(i);
      button.dataset.value = String(i);
      button.addEventListener('click', () => toggleManualNumber(i, button));
      manualState.buttons.push(button);
      fragment.appendChild(button);
    }
    manualGrid.appendChild(fragment);
  }

  function toggleManualNumber(value, button) {
    if (manualState.locked) return;
    const key = value;
    if (manualState.selected.has(key)) {
      manualState.selected.delete(key);
      button.classList.remove('is-selected');
    } else if (manualState.selected.size < MANUAL_CONFIG.limit) {
      manualState.selected.add(key);
      button.classList.add('is-selected');
      playSound('select', 0.55);
    } else {
      button.classList.add('is-error');
      window.setTimeout(() => button.classList.remove('is-error'), 320);
      updateManualFeedback('Voc\u00ea j\u00e1 selecionou 15 n\u00fameros. Clique em "Confirmar escolha".', 'warning');
      return;
    }
    updateManualCount();
    const complete = manualState.selected.size === MANUAL_CONFIG.limit;
    updateManualFeedback(
      complete
        ? 'Pronto! Clique em "Confirmar escolha" para ver o resultado.'
        : 'Escolha 15 n\u00fameros para continuar.',
      complete ? 'success' : 'neutral'
    );
  }

  function lockManualGrid() {
    manualState.locked = true;
    manualState.buttons.forEach((button) => {
      button.disabled = true;
      const value = Number(button.dataset.value);
      if (!Number.isNaN(value) && !manualState.selected.has(value)) {
        button.classList.remove('is-selected');
      }
    });
  }

  function resetManualGrid() {
    manualState.locked = false;
    manualState.selected.clear();
    manualState.buttons.forEach((button) => {
      button.disabled = false;
      button.classList.remove('is-selected');
    });
    updateManualCount();
    updateManualFeedback('Escolha 15 n\u00fameros para continuar.');
  }

  function handleManualVerification(button) {
    if (manualState.locked) {
      showSlide('manual-result');
      return;
    }
    if (manualState.selected.size !== MANUAL_CONFIG.limit) {
      updateManualFeedback('Selecione os 15 n\u00fameros antes de continuar.', 'error');
      button.classList.add('is-error');
      window.setTimeout(() => button.classList.remove('is-error'), 320);
      return;
    }

    lockManualGrid();
    updateManualFeedback('Sorteio em andamento...', 'warning');
    showSlide('preloading');
    window.setTimeout(() => {
      startDrawSimulation(() => {
        if (manualHitsEl) {
          manualHitsEl.textContent = `${MANUAL_CONFIG.hits} n\u00fameros!`;
        }
        updateManualFeedback('Clique em "Ver como a LOTER.IA faria" para prosseguir.');
        showSlide('manual-result');
      });
    }, 160);
  }

  function populateGuidedGrid() {
    if (!guidedGrid) return;
    guidedState.buttons = [];
    guidedState.index = 0;
    guidedState.locked = false;
    guidedGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= 25; i += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'number-button';
      button.textContent = String(i);
      button.dataset.value = String(i);
      button.addEventListener('click', () => handleGuidedClick(i, button));
      guidedState.buttons.push(button);
      fragment.appendChild(button);
    }
    guidedGrid.appendChild(fragment);
    highlightNextGuided();
  }

  function highlightNextGuided() {
    const nextValue = IA_CONFIG.sequence[guidedState.index];
    guidedState.buttons.forEach((button) => button.classList.remove('is-highlight'));
    if (typeof nextValue === 'number') {
      const target = guidedState.buttons[nextValue - 1];
      if (target) {
        target.classList.add('is-highlight');
      }
      if (guidedFeedback) {
        guidedFeedback.textContent = `Clique no n\u00famero ${String(nextValue).padStart(2, '0')} para seguir a IA.`;
      }
    }
  }

  function handleGuidedClick(value, button) {
    if (guidedState.locked) return;
    const expected = IA_CONFIG.sequence[guidedState.index];
    if (value === expected) {
      button.classList.remove('is-highlight');
      button.classList.add('is-correct');
      button.disabled = true;
      playSound('select', 0.65);
      guidedState.index += 1;
      if (guidedState.index >= IA_CONFIG.sequence.length) {
        guidedState.locked = true;
        if (guidedFeedback) {
          guidedFeedback.textContent = 'Resultado confirmado! Veja o pr\u00eamio que a IA garantiu.';
        }
        showIaResultModal();
      } else {
        highlightNextGuided();
      }
    } else {
      button.classList.add('is-error');
      window.setTimeout(() => button.classList.remove('is-error'), 320);
      if (guidedFeedback) {
        guidedFeedback.textContent = 'Ops! Clique apenas no n\u00famero destacado pela IA.';
      }
    }
  }

  function startEmojiRain() {
    if (!emojiContainer) return;
    emojiContainer.innerHTML = '';
    emojiContainer.hidden = false;
    const emojis = ['\u{1F4B0}', '\u{1F3C6}', '\u2728', '\u{1F4B5}'];
    const total = 18;
    for (let i = 0; i < total; i += 1) {
      const item = document.createElement('span');
      item.className = 'emoji-rain__item';
      item.textContent = emojis[i % emojis.length];
      item.style.left = `${Math.random() * 100}%`;
      item.style.animationDelay = `${Math.random() * 0.6}s`;
      emojiContainer.appendChild(item);
    }
    window.setTimeout(() => {
      if (emojiContainer) {
        emojiContainer.hidden = true;
        emojiContainer.innerHTML = '';
      }
    }, 4200);
  }

  function animatePrizeCounter(element, targetValue, duration = 1800) {
    const start = performance.now();
    const from = 0;
    const easeOut = (t) => 1 - (1 - t) ** 3;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = from + (targetValue - from) * eased;
      element.textContent = formatCurrency(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }

  function launchMoneyStream(container) {
    container.innerHTML = '';
    const symbols = ['\uD83D\uDCB8', '\uD83E\uDE99', '\uD83D\uDCB5', '\uD83D\uDCB0', '\uD83E\uDD11'];
    const total = 12;
    for (let i = 0; i < total; i += 1) {
      const item = document.createElement('span');
      item.className = 'money-stream__item';
      item.textContent = symbols[i % symbols.length];
      item.style.animationDelay = `${(i * 0.18) % 2.2}s`;
      container.appendChild(item);
    }
  }

  function openModal(content, handlers = {}) {
    if (!modal || !modalContent) return;
    modalContent.innerHTML = content;
    modal.hidden = false;
    modal.dataset.visible = 'true';
    modalHandlers = { onPrimary: handlers.onPrimary ?? null, onSecondary: handlers.onSecondary ?? null };
    const autoFocus = modalContent.querySelector('[data-modal-autofocus]');
    if (autoFocus instanceof HTMLElement) {
      window.setTimeout(() => autoFocus.focus(), 40);
    }
  }

  function closeModal() {
    if (!modal || !modalContent) return;
    modal.dataset.visible = 'false';
    modal.hidden = true;
    modalContent.innerHTML = '';
    modalHandlers = { onPrimary: null, onSecondary: null };
  }

  function showIaResultModal() {
    startEmojiRain();
    playSound('win', 0.9);
    const modalHtml = `
      <div class="modal-success">
        <div class="money-stream" data-money-stream></div>
        <h2 class="modal-success__title">Voc\u00ea foi incr\u00edvel!</h2>
        <p class="modal-success__subtitle">A intelig\u00eancia artificial acertou ${IA_CONFIG.hits} pontos!</p>
        <div class="modal-success__prize">
          <p>Com nossa IA, voc\u00ea ganhou:</p>
          <strong class="modal-success__amount" data-prize-counter>${formatCurrency(0)}</strong>
          <p class="modal-success__note">Em apenas 1 rodada!</p>
        </div>
        <button class="btn btn-success modal-success__cta" data-modal-primary data-modal-autofocus>
          Quero mais provas
        </button>
      </div>
    `;
    openModal(modalHtml, {
      onPrimary: () => {
        showSlide('proofs');
      },
    });
    if (modalContent) {
      const counterEl = modalContent.querySelector('[data-prize-counter]');
      if (counterEl) {
        animatePrizeCounter(counterEl, IA_CONFIG.prizeValue);
      }
      const streamEl = modalContent.querySelector('[data-money-stream]');
      if (streamEl instanceof HTMLElement) {
        launchMoneyStream(streamEl);
      }
    }
  }

  function startOfferTimer() {
    if (!offerTimerDisplay || offerTimerStarted) return;
    offerTimerStarted = true;
    let remaining = 600;

    const updateDisplay = () => {
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      offerTimerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    updateDisplay();
    offerTimerId = window.setInterval(() => {
      if (remaining > 0) {
        remaining -= 1;
        updateDisplay();
      } else {
        window.clearInterval(offerTimerId);
      }
    }, 1000);
  }

  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const nextBtn = target.closest('[data-next]');
    if (nextBtn) {
      event.preventDefault();
      const step = nextBtn.getAttribute('data-next');
      if (step) {
        showSlide(step);
      }
      return;
    }

    const manualButton = target.closest('[data-action="verify-manual"]');
    if (manualButton) {
      event.preventDefault();
      handleManualVerification(manualButton);
      return;
    }

    if (target.closest('[data-modal-close]')) {
      closeModal();
      return;
    }

    if (target.closest('[data-modal-primary]')) {
      event.preventDefault();
      const handler = modalHandlers.onPrimary;
      handler?.();
      if (!target.hasAttribute('data-modal-stay-open')) {
        closeModal();
      }
      return;
    }

    if (target.closest('[data-modal-secondary]')) {
      event.preventDefault();
      const handler = modalHandlers.onSecondary;
      handler?.();
      closeModal();
      return;
    }

    if (target.closest('[data-modal-backdrop]')) {
      closeModal();
      return;
    }

    const hublaLink = target.closest('[data-hubla-link]');
    if (hublaLink && typeof fbq === 'function') {
      const purchaseMeta = { origin: 'cta', value: 37, currency: 'BRL' };
      fbq('track', 'AddToCart', purchaseMeta);
      fbq('track', 'InitiateCheckout', purchaseMeta);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.dataset.visible === 'true') {
      closeModal();
    }
  });

  populateManualGrid();
  populateGuidedGrid();
  updateManualCount();
  window.addEventListener('beforeunload', () => {
    stopDrawSimulation();
    if (offerTimerId) {
      window.clearInterval(offerTimerId);
    }
  });
});



