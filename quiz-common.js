// quiz-common.js – Shared Quiz Engine
class QuizEngine {
  constructor(config) {
    this.totalQuestions = config.totalQuestions;
    this.redirectUrl = config.redirectUrl;
    this.streakKey = config.streakStorageKey || 'userStreakDays';
    this.questionsData = config.questionsData || [];
    this.pairsData = config.pairsData || [];

    this.lives = 5;
    this.currentQuestion = 0;
    this.retryQueue = [];
    this.inRetryMode = false;
    this.showedRetryMessage = false;
    this.currentStreak = 0;
    this.pendingCelebration = false;
    this.pendingCelebrationStreak = null;
    this.waitingForCelebration = false;

    this.quizStartTime = Date.now();
    this.quizCompleted = false;
    this.totalAttempts = 0;
    this.questionFinalCorrect = new Array(this.totalQuestions).fill(false);

    this.heartsAtCompletion = 5;
    this.currentStreakDays = 1;

    this.showQuestion = this.showQuestion.bind(this);
    this.moveToNextQuestion = this.moveToNextQuestion.bind(this);
    this.finishQuiz = this.finishQuiz.bind(this);
    this.handleCorrectAnswer = this.handleCorrectAnswer.bind(this);
    this.handleIncorrectAnswer = this.handleIncorrectAnswer.bind(this);
    this.showResultOverlay = this.showResultOverlay.bind(this);
    this.showModal = this.showModal.bind(this);
    this.updateStreakCounter = this.updateStreakCounter.bind(this);
    this.updateHeartIcon = this.updateHeartIcon.bind(this);
    this.processAfterExplanation = this.processAfterExplanation.bind(this);
    this.shuffleArray = this.shuffleArray.bind(this);
    this.normalizeAnswer = this.normalizeAnswer.bind(this);
    this.playSound = this.playSound.bind(this);

    this.progressBar = document.getElementById('progress-bar');
    this.livesCountSpan = document.getElementById('lives-count');
    this.livesIcon = document.getElementById('lives-icon');
    this.streakCounterSpan = document.getElementById('streakCounter');
    this.fullscreenOverlay = document.getElementById('fullscreenModalOverlay');
    this.modalIframe = document.getElementById('modalIframe');
    this.questionSections = [];
    for (let i = 1; i <= this.totalQuestions; i++) {
      this.questionSections.push(document.getElementById(`question${i}`));
    }

    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.showModal('quit-confirmation.html', () => {});
      });
    }

    window.addEventListener('beforeunload', (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    });

    this.loadStreakFromStorage();
    this.updateStreakCounter();
    this.updateHeartIcon();
    this.progressBar.style.width = `${(1 / this.totalQuestions) * 100}%`;
  }

  loadStreakFromStorage() {
    const saved = localStorage.getItem(this.streakKey);
    if (saved) this.currentStreakDays = parseInt(saved);
    else localStorage.setItem(this.streakKey, '1');
  }

  saveStreakToStorage() {
    localStorage.setItem(this.streakKey, this.currentStreakDays);
  }

  incrementStreak() {
    this.currentStreakDays++;
    this.saveStreakToStorage();
  }

  updateStreakCounter() {
    if (this.currentStreak >= 2) {
      this.streakCounterSpan.textContent = `${this.currentStreak} in a row!`;
    } else {
      this.streakCounterSpan.textContent = '';
    }
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

  playSound(isCorrect) {
    const audio = isCorrect ? document.getElementById('correctSound') : document.getElementById('incorrectSound');
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log("Audio play failed:", e));
    }
  }

  normalizeAnswer(answer) {
    return answer.toLowerCase().replace(/\s+/g, ' ').replace(/[()]/g, '').replace(/\//g, ' ').trim();
  }

  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  showModal(modalUrl, onClose) {
    this.modalIframe.src = modalUrl;
    this.fullscreenOverlay.classList.add('visible');
    const handler = (event) => {
      if (event.data === 'modalClose') {
        window.removeEventListener('message', handler);
        this.fullscreenOverlay.classList.remove('visible');
        this.modalIframe.src = 'about:blank';
        if (onClose) onClose();
      } else if (event.data === 'modalQuit') {
        window.removeEventListener('message', handler);
        window.location.href = this.redirectUrl;
      } else if (event.data && event.data.type === 'refillHearts') {
        window.removeEventListener('message', handler);
        this.fullscreenOverlay.classList.remove('visible');
        this.modalIframe.src = 'about:blank';
        this.lives = 5;
        this.livesCountSpan.textContent = this.lives;
        this.updateHeartIcon();
        this.resetCurrentQuestion();
        if (onClose) onClose();
      } else if (event.data && event.data.type === 'streakClosed') {
        this.currentStreakDays = event.data.streakDays;
        this.saveStreakToStorage();
        if (onClose) onClose();
      }
    };
    window.addEventListener('message', handler);
  }

  resetCurrentQuestion() {
    this.showQuestion(this.currentQuestion);
  }

  handleCorrectAnswer() {
    this.currentStreak++;
    this.updateStreakCounter();
    if (this.currentStreak % 5 === 0 && this.currentStreak > 0) {
      this.pendingCelebration = true;
      this.pendingCelebrationStreak = this.currentStreak;
    }
  }

  handleIncorrectAnswer() {
    this.currentStreak = 0;
    this.updateStreakCounter();
  }

  processAfterExplanation(onComplete) {
    if (this.pendingCelebration) {
      const streak = this.pendingCelebrationStreak;
      this.pendingCelebration = false;
      this.pendingCelebrationStreak = null;
      this.waitingForCelebration = true;
      this.showModal(`answer-streak.html?streak=${streak}`, () => {
        this.waitingForCelebration = false;
        if (onComplete) onComplete();
      });
    } else {
      if (onComplete) onComplete();
    }
  }

  showResultOverlay(questionNumber, isCorrect, explanationHTML, onComplete) {
    const overlay = document.getElementById(`resultOverlay-${questionNumber}`);
    const container = document.getElementById(`resultContainer-${questionNumber}`);
    const header = document.getElementById(`resultHeader-${questionNumber}`);
    const icon = document.getElementById(`resultIcon-${questionNumber}`);
    const actionIcon = document.getElementById(`actionIcon-${questionNumber}`);
    const explanationDiv = document.getElementById(`explanationContainer-${questionNumber}`);
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

    explanationDiv.innerHTML = explanationHTML;
    overlay.classList.add('visible');

    continueBtn.onclick = () => {
      overlay.classList.remove('visible');
      this.processAfterExplanation(onComplete);
    };
  }

  moveToNextQuestion() {
    if (this.waitingForCelebration) {
      return false;
    }
   
    if (this.inRetryMode) {
      this.currentQuestion++;
      if (this.currentQuestion >= this.retryQueue.length) {
        this.inRetryMode = false;
        this.retryQueue = [];
        this.showedRetryMessage = false;
        this.currentQuestion = 0;
        this.finishQuiz();
        return false;
      }
      this.showQuestion(this.currentQuestion);
      return true;
    } else {
      this.currentQuestion++;
      if (this.currentQuestion >= this.totalQuestions) {
        if (this.retryQueue.length > 0) {
          this.inRetryMode = true;
          this.currentQuestion = 0;
          if (!this.showedRetryMessage) {
            this.showedRetryMessage = true;
            this.showModal('review-questions.html', () => {
              this.showQuestion(this.currentQuestion);
            });
            return false;
          }
          this.showQuestion(this.currentQuestion);
          return true;
        } else {
          this.finishQuiz();
          return false;
        }
      }
      this.showQuestion(this.currentQuestion);
      return true;
    }
  }

  showCoinsReward(amount, onClose) {
    this.showModal(`coins-reward.html?amount=${amount}`, onClose);
  }

  showBoostReward(multiplier, duration, onClose) {
    this.showModal(`boost-reward.html?multiplier=${multiplier}&duration=${duration}`, onClose);
  }

  showHeartReward(heartsParam, onClose) {
    this.showModal(`heart-reward.html?hearts=${heartsParam}`, onClose);
  }

  showLessonCompleteModal(correct, total, time, onComplete) {
    const url = `lesson-complete.html?correctAttempts=${correct}&totalAttempts=${total}&time=${time}`;
    this.showModal(url, onComplete);
  }

  showAchievementModal(onComplete) {
    this.showModal('achievement.html', onComplete);
  }

  showStreakModal(onComplete) {
    this.showModal('streak.html', onComplete);
  }

  showDailyQuestAndHandleClaims(correctAttempts, totalAttempts) {
    let claimed = { bronze: false, silver: false, gold: false };
    const url = `daily-quest.html?correctAttempts=${correctAttempts}&totalAttempts=${totalAttempts}&completed=true`;
    this.modalIframe.src = url;
    this.fullscreenOverlay.classList.add('visible');

    const handler = (event) => {
      if (event.data && event.data.type === 'chestClaimed') {
        claimed[event.data.chestId] = true;
        this.showCoinsReward(event.data.amount, () => {});
      } else if (event.data && event.data.type === 'dailyQuestContinue') {
        window.removeEventListener('message', handler);
        this.fullscreenOverlay.classList.remove('visible');
        this.modalIframe.src = 'about:blank';

        const unclaimed = [];
        if (event.data.chestEligible.bronze && !claimed.bronze) unclaimed.push(50);
        if (event.data.chestEligible.silver && !claimed.silver) unclaimed.push(75);
        if (event.data.chestEligible.gold && !claimed.gold) unclaimed.push(100);
        const allEligible = event.data.chestEligible.bronze && event.data.chestEligible.silver && event.data.chestEligible.gold;
        if (allEligible && unclaimed.length > 0) {
          const sum = unclaimed.reduce((a,b)=>a+b,0);
          this.showCoinsReward(sum, () => { this.goToAchievement(); });
        } else {
          this.goToAchievement();
        }
      }
    };
    window.addEventListener('message', handler);
  }

  goToAchievement() {
    this.showAchievementModal(() => {
      this.showCoinsReward(400, () => {
        window.location.href = this.redirectUrl;
      });
    });
  }

  finishQuiz() {
    if (this.quizCompleted) return;
    this.quizCompleted = true;
    const timeSeconds = Math.floor((Date.now() - this.quizStartTime) / 1000);
    let finalCorrect = 0;
    for (let i = 0; i < this.questionFinalCorrect.length; i++) {
      if (this.questionFinalCorrect[i]) finalCorrect++;
    }
    
    // SAFETY: Ensure totalAttempts is at least finalCorrect (prevents >100% scores)
    if (this.totalAttempts < finalCorrect) {
      console.warn(`totalAttempts (${this.totalAttempts}) < finalCorrect (${finalCorrect}). Adjusting.`);
      this.totalAttempts = finalCorrect;
    }
    
    this.heartsAtCompletion = this.lives;
    this.incrementStreak();

    this.showLessonCompleteModal(finalCorrect, this.totalAttempts, timeSeconds, () => {
      this.showStreakModal(() => {
        const random = Math.random();
        const showBoost = random < 0.5;
        if (showBoost) {
          const multipliers = [{ mult: 1.5, dur: 30 }, { mult: 2, dur: 20 }, { mult: 3, dur: 15 }];
          const chosen = multipliers[Math.floor(Math.random() * multipliers.length)];
          this.showBoostReward(chosen.mult, chosen.dur, () => {
            this.showDailyQuestAndHandleClaims(finalCorrect, this.totalAttempts);
          });
        } else {
          if (this.heartsAtCompletion <= 2) {
            let param = 'full';
            if (this.heartsAtCompletion === 1) param = '1';
            else if (this.heartsAtCompletion === 2) param = '2';
            this.showHeartReward(param, () => {
              this.showDailyQuestAndHandleClaims(finalCorrect, this.totalAttempts);
            });
          } else {
            this.showBoostReward(1.5, 30, () => {
              this.showDailyQuestAndHandleClaims(finalCorrect, this.totalAttempts);
            });
          }
        }
      });
    });
  }

  showQuestion(questionIndex) {
    throw new Error('showQuestion must be implemented by the lesson');
  }
}
