// ===== VULANET QUIZ ENGINE =====

import { AudioManager } from './audio-manager.js';
import { ModalManager } from './modal-manager.js';

export class QuizEngine {
  constructor(config) {
    this.config = config;
    this.audio = new AudioManager();
    this.modal = new ModalManager();
    
    // State
    this.lives = 5;
    this.currentQuestion = 0;
    this.currentStreak = 0;
    this.retryQueue = [];
    this.inRetryMode = false;
    this.showedRetryMessage = false;
    this.answered = false;
    
    // Elements
    this.progressBar = document.getElementById('progress-bar');
    this.livesCount = document.getElementById('lives-count');
    this.livesIcon = document.getElementById('lives-icon');
    this.streakCounter = document.getElementById('streak-counter');
    this.closeBtn = document.getElementById('close-btn');
    
    this.init();
  }
  
  init() {
    this.updateHeartIcon();
    this.updateStreakCounter();
    this.setupCloseButton();
  }
  
  setupCloseButton() {
    this.closeBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to exit the quiz?')) {
        this.reset();
        this.showQuestion(0);
      }
    });
  }
  
  reset() {
    this.lives = 5;
    this.currentQuestion = 0;
    this.currentStreak = 0;
    this.retryQueue = [];
    this.inRetryMode = false;
    this.showedRetryMessage = false;
    this.livesCount.textContent = this.lives;
    this.updateHeartIcon();
    this.updateStreakCounter();
  }
  
  getCurrentQuestionIndex() {
    return this.inRetryMode ? this.retryQueue[this.currentQuestion] : this.currentQuestion;
  }
  
  updateProgress() {
    let percent;
    if (this.inRetryMode) {
      percent = Math.round(((this.currentQuestion + 1) / this.retryQueue.length) * 100);
    } else {
      percent = Math.round(((this.currentQuestion + 1) / this.config.totalQuestions) * 100);
    }
    this.progressBar.style.width = `${percent}%`;
  }
  
  updateHeartIcon() {
    if (this.lives === 0) {
      this.livesIcon.classList.remove('ph-fill');
      this.livesIcon.classList.add('ph');
    } else {
      this.livesIcon.classList.remove('ph');
      this.livesIcon.classList.add('ph-fill');
    }
  }
  
  updateStreakCounter() {
    this.streakCounter.textContent = this.currentStreak >= 2 ? `${this.currentStreak} in a row` : '';
  }
  
  handleCorrect() {
    this.currentStreak++;
    this.updateStreakCounter();
    
    if (this.currentStreak % 5 === 0 && this.currentStreak > 0) {
      const messages = {
        5: "5 in a row! Fantastic!",
        10: "Wow, that's now 10 in a row! Is there anything you don't know?",
        15: "15 in a row! That's the definition of perfection!",
        20: "20 in a row! You're a pro!",
        25: "25 in a row! Are you even human?"
      };
      const message = messages[this.currentStreak] || `${this.currentStreak} in a row! Amazing!`;
      
      this.audio.playCelebration();
      this.modal.showCelebration(message, () => {
        this.moveToNextQuestion();
      });
      return true;
    }
    return false;
  }
  
  handleIncorrect() {
    this.currentStreak = 0;
    this.updateStreakCounter();
  }
  
  loseLife() {
    if (this.lives > 0) {
      this.lives--;
      this.livesCount.textContent = this.lives;
      this.updateHeartIcon();
    }
  }
  
  addToRetryQueue(questionIndex) {
    if (!this.retryQueue.includes(questionIndex)) {
      this.retryQueue.push(questionIndex);
    } else if (this.inRetryMode) {
      this.retryQueue.push(questionIndex);
    }
  }
  
  moveToNextQuestion() {
    if (this.inRetryMode) {
      this.currentQuestion++;
      if (this.currentQuestion >= this.retryQueue.length) {
        this.inRetryMode = false;
        this.retryQueue = [];
        this.showedRetryMessage = false;
        this.currentQuestion = 0;
        this.config.onComplete?.();
        return false;
      }
      this.config.onShowQuestion?.(this.currentQuestion);
      this.updateProgress();
      return true;
    } else {
      this.currentQuestion++;
      if (this.currentQuestion >= this.config.totalQuestions) {
        if (this.retryQueue.length > 0) {
          this.inRetryMode = true;
          this.currentQuestion = 0;
          
          if (!this.showedRetryMessage) {
            this.modal.showRetryMessage(() => {
              this.config.onShowQuestion?.(this.currentQuestion);
              this.updateProgress();
            });
            this.showedRetryMessage = true;
            return false;
          }
          
          this.config.onShowQuestion?.(this.currentQuestion);
          this.updateProgress();
          return true;
        } else {
          this.config.onComplete?.();
          return false;
        }
      }
      this.config.onShowQuestion?.(this.currentQuestion);
      this.updateProgress();
      return true;
    }
  }
  
  submitAnswer(questionIndex, isCorrect, correctAnswerData, explanation) {
    this.answered = true;
    this.audio.play(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      const celebrated = this.handleCorrect();
      if (!celebrated) {
        this.modal.showResult(
          questionIndex + 1,
          true,
          this.formatExplanation(explanation, null, true),
          () => this.moveToNextQuestion()
        );
      }
    } else {
      this.handleIncorrect();
      this.addToRetryQueue(questionIndex);
      this.loseLife();
      
      this.modal.showResult(
        questionIndex + 1,
        false,
        this.formatExplanation(explanation, correctAnswerData, false),
        () => this.moveToNextQuestion()
      );
    }
  }
  
  formatExplanation(explanation, correctAnswer, isCorrect) {
    if (isCorrect) {
      return `<div class="explanation-section"><span class="explanation-text">${explanation}</span></div>`;
    } else {
      let correctHtml = '';
      if (typeof correctAnswer === 'string') {
        correctHtml = `<span class="underlined">${correctAnswer}</span>`;
      } else if (Array.isArray(correctAnswer)) {
        correctHtml = correctAnswer.map(a => `<span class="underlined">${a}</span>`).join(' and ');
      }
      
      return `
        <div class="correct-answer-section">
          <span class="correct-text">Correct answer:</span>
          ${correctHtml}
        </div>
        <div class="explanation-section">
          <span class="explanation-label">Explanation:</span>
          <span class="explanation-text">${explanation}</span>
        </div>
      `;
    }
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  normalizeAnswer(answer) {
    return answer.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[()]/g, '')
      .replace(/\//g, ' ')
      .trim();
  }
}
