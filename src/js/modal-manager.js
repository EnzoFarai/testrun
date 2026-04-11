// ===== VULANET MODAL MANAGER =====

export class ModalManager {
  constructor(containerSelector = '.quiz-container') {
    this.container = document.querySelector(containerSelector);
    this.overlays = new Map();
    this.initModals();
  }
  
  initModals() {
    // Create result overlays for each question
    for (let i = 1; i <= 20; i++) {
      this.createResultOverlay(i);
    }
    
    // Create celebration overlay
    this.createCelebrationOverlay();
    
    // Create image zoom modal
    this.createImageZoomModal();
  }
  
  createResultOverlay(questionNumber) {
    const overlay = document.createElement('div');
    overlay.className = 'result-overlay';
    overlay.id = `resultOverlay-${questionNumber}`;
    overlay.innerHTML = `
      <div class="result-container" id="resultContainer-${questionNumber}">
        <div class="result-main">
          <span class="material-symbols-outlined material-icon" id="resultIcon-${questionNumber}"></span>
          <div class="result-header" id="resultHeader-${questionNumber}"></div>
          <span class="material-symbols-outlined material-icon" id="actionIcon-${questionNumber}"></span>
        </div>
        <div class="explanation-content" id="explanationContainer-${questionNumber}"></div>
        <button class="result-continue-btn" id="resultContinueBtn-${questionNumber}">Continue</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  
  createCelebrationOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.id = 'celebrationOverlay';
    overlay.innerHTML = `
      <div class="celebration-container">
        <div class="celebration-speech-bubble" pbottom acenter style="--bbColor:#FFFFFF">
          <div class="celebration-bubble-text" id="celebrationMessage"></div>
        </div>
        <div class="celebration-icon-container">
          <i class="ph-fill ph-rabbit"></i>
        </div>
        <button class="celebration-continue-btn" id="celebrationContinueBtn">Continue</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  
  createImageZoomModal() {
    const modal = document.createElement('div');
    modal.className = 'image-zoom-modal';
    modal.id = 'imageZoomModal';
    modal.innerHTML = `
      <div class="zoom-content">
        <button class="zoom-close" id="zoomCloseBtn">
          <span class="material-symbols-outlined">close</span>
        </button>
        <img id="zoomedImage" src="" alt="Zoomed Image">
        <div class="zoom-label" id="zoomImageLabel"></div>
        <div class="zoom-instructions">Click outside or press ESC to close</div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  showResult(questionNumber, isCorrect, explanationHTML, onContinue) {
    const overlay = document.getElementById(`resultOverlay-${questionNumber}`);
    const container = document.getElementById(`resultContainer-${questionNumber}`);
    const header = document.getElementById(`resultHeader-${questionNumber}`);
    const icon = document.getElementById(`resultIcon-${questionNumber}`);
    const actionIcon = document.getElementById(`actionIcon-${questionNumber}`);
    const explanation = document.getElementById(`explanationContainer-${questionNumber}`);
    const continueBtn = document.getElementById(`resultContinueBtn-${questionNumber}`);
    
    if (isCorrect) {
      header.textContent = 'Correct!';
      icon.textContent = 'check_circle';
      actionIcon.textContent = 'recommend';
      container.className = 'result-container correct';
    } else {
      header.textContent = 'Incorrect';
      icon.textContent = 'cancel';
      actionIcon.textContent = 'stylus_note';
      container.className = 'result-container incorrect';
    }
    
    explanation.innerHTML = explanationHTML;
    overlay.classList.add('visible');
    
    continueBtn.onclick = () => {
      overlay.classList.remove('visible');
      if (onContinue) onContinue();
    };
  }
  
  showCelebration(message, onContinue) {
    const overlay = document.getElementById('celebrationOverlay');
    const messageEl = document.getElementById('celebrationMessage');
    const continueBtn = document.getElementById('celebrationContinueBtn');
    
    messageEl.textContent = message;
    overlay.classList.add('visible');
    
    continueBtn.onclick = () => {
      overlay.classList.remove('visible');
      if (onContinue) onContinue();
    };
  }
  
  showImageZoom(imageSrc, label) {
    const modal = document.getElementById('imageZoomModal');
    const zoomImg = document.getElementById('zoomedImage');
    const zoomLabel = document.getElementById('zoomImageLabel');
    const closeBtn = document.getElementById('zoomCloseBtn');
    
    zoomImg.src = imageSrc;
    zoomLabel.textContent = label;
    modal.classList.add('visible');
    
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.classList.remove('visible');
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove('visible');
      }
    };
    
    closeBtn.onclick = () => modal.classList.remove('visible');
  }
  
  showRetryMessage(onContinue) {
    const retryContainer = document.createElement('div');
    retryContainer.id = 'retryMessage';
    retryContainer.innerHTML = `
      <div class="question-container">
        <div class="icon-container">
          <i class="ph-fill ph-rabbit"></i>
        </div>
        <div speech-bubble pleft acenter style="--bbColor:#FFFFFF">
          <div class="bubble-text">
            Practice makes perfect. Let's review your mistakes before we go ahead.
          </div>
        </div>
      </div>
      <div class="footer">
        <button class="check-button" id="retryContinueBtn">Continue</button>
      </div>
    `;
    
    this.container.appendChild(retryContainer);
    
    document.getElementById('retryContinueBtn').onclick = () => {
      retryContainer.remove();
      if (onContinue) onContinue();
    };
  }
  
  hideAll() {
    document.querySelectorAll('.result-overlay, .celebration-overlay, .image-zoom-modal').forEach(el => {
      el.classList.remove('visible');
    });
  }
}
