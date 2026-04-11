// ===== VULANET AUDIO MANAGER =====

export class AudioManager {
  constructor() {
    this.sounds = {
      correct: new Audio('../../public/assets/audio/correct.mp3'),
      incorrect: new Audio('../../public/assets/audio/incorrect.mp3'),
      clapping: new Audio('../../public/assets/audio/clapping.mp3')
    };
    
    // Preload all sounds
    Object.values(this.sounds).forEach(audio => {
      audio.preload = 'auto';
      audio.load();
    });
  }
  
  play(soundName) {
    try {
      const audio = this.sounds[soundName];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log(`Audio play failed (${soundName}):`, e));
      }
    } catch (error) {
      console.log(`Error playing sound (${soundName}):`, error);
    }
  }
  
  playCorrect() {
    this.play('correct');
  }
  
  playIncorrect() {
    this.play('incorrect');
  }
  
  playCelebration() {
    this.play('clapping');
  }
}
