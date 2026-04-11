/* ===== VULANET MATCHING GAME STYLES ===== */

.matching-question {
  position: relative;
}

.game-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 1rem;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: #FFFFFF;
  border: 2px solid #E5E5E5;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.06);
  user-select: none;
  color: #4B4B4B;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.06);
}

.card.selected {
  border-color: #1CB0F6;
  background-color: #E5F5FF;
}

.card.correct {
  border-color: #34A853;
  background-color: #D7FFB8;
  color: #2E7D32;
}

.card.matched {
  opacity: 0.7;
  background-color: #F7F7F7;
  border-color: #AFAFAF;
  color: #777777;
  cursor: default;
}

.card.wrong {
  border-color: #EA4335;
  background-color: #FFDFE0;
  color: #C5221F;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

/* Feedback Overlay for Matching */
.feedback-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 10;
  animation: fadeIn 0.3s ease;
}

.feedback-overlay.visible {
  display: flex;
}

.matching-feedback {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background-color: #FFDFE0;
  width: 90%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.matching-feedback .result-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.matching-feedback .material-icon {
  font-size: 2.5rem;
  width: 1em;
  height: 1em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #C5221F;
}

.matching-feedback .result-header {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  flex-grow: 1;
  color: #C5221F;
}

.feedback-subtitle {
  margin-bottom: 1.25rem;
  font-size: 1rem;
  color: #777777;
  text-align: center;
}

.feedback-button {
  width: 100%;
  background: #EA4335;
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  font-family: 'Atkinson Hyperlegible Next', sans-serif;
}

.feedback-button:hover {
  background: #D3382C;
  transform: translateY(-2px);
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.1);
}

.feedback-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.1);
}

.matching-continue-btn {
  width: 100%;
  background: #4285F4;
  color: #FFFFFF;
  font-size: 1.25rem;
  font-weight: 700;
  padding: 1rem;
  border: none;
  border-bottom: 0.25rem solid #3A75D9;
  border-radius: 0.75rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s;
  font-family: 'Atkinson Hyperlegible Next', sans-serif;
  margin-top: 1rem;
}

.matching-continue-btn:hover {
  background: #3A75D9;
  border-bottom-color: #3166C4;
  transform: translateY(-2px);
}

.matching-continue-btn:active {
  transform: translateY(0);
  border-bottom-width: 0.125rem;
}

@media (max-width: 480px) {
  .game-container { gap: 12px; }
  .card { padding: 14px 10px; font-size: 14px; height: 80px; }
  .matching-feedback { padding: 1rem; }
}

@media (max-width: 320px) {
  .game-container { gap: 10px; }
  .card { padding: 12px 8px; font-size: 13px; height: 75px; }
}
