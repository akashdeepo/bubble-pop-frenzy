class BubblePopGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.gameRunning = false;
        this.paused = false;
        this.muted = false;
        this.zenMode = false;
        this.bubbles = [];
        this.powerUps = [];
        this.particles = [];
        this.combo = 0;
        this.comboTimer = null;
        this.scoreMultiplier = 1;
        this.freezeTimeLeft = 0;
        this.gameTimer = null;
        this.bubbleSpawnTimer = null;
        this.ambientSounds = null;
        
        this.gameArea = document.getElementById('gameArea');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.timerElement = document.getElementById('timer');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalLevelElement = document.getElementById('finalLevel');
        this.comboElement = document.getElementById('combo');
        this.comboCountElement = document.getElementById('comboCount');
        
        this.bindEvents();
        this.createBackgroundBubbles();
        this.initializeViralFeatures();
    }

    bindEvents() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('zenBtn').addEventListener('click', () => this.startGame(true));
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());
        document.getElementById('zenToggle').addEventListener('click', () => this.toggleZenMode());
        document.getElementById('shareTwitter').addEventListener('click', () => this.shareToTwitter());
        document.getElementById('shareScore').addEventListener('click', () => this.copyGameLink());
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
            }
        });
    }

    createBackgroundBubbles() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.createBackgroundBubble(), i * 1000);
        }
    }

    createBackgroundBubble() {
        if (this.gameRunning) return;
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble normal';
        bubble.style.width = Math.random() * 60 + 40 + 'px';
        bubble.style.height = bubble.style.width;
        bubble.style.left = Math.random() * (this.gameArea.offsetWidth - 100) + 'px';
        bubble.style.top = Math.random() * (this.gameArea.offsetHeight - 100) + 'px';
        bubble.style.opacity = '0.3';
        
        this.gameArea.appendChild(bubble);
        
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.remove();
            }
            if (!this.gameRunning) {
                setTimeout(() => this.createBackgroundBubble(), Math.random() * 2000 + 1000);
            }
        }, 5000);
    }

    startGame(zenMode = false) {
        this.gameRunning = true;
        this.paused = false;
        this.zenMode = zenMode;
        this.score = 0;
        this.level = 1;
        this.timeLeft = zenMode ? 300 : 60;
        this.bubbles = [];
        this.powerUps = [];
        this.combo = 0;
        this.scoreMultiplier = 1;
        this.freezeTimeLeft = 0;
        
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        if (zenMode) {
            document.body.classList.add('zen-mode');
            this.startAmbientSounds();
        }
        
        this.updateUI();
        this.startTimers();
        this.spawnBubbles();
        if (!zenMode) this.spawnPowerUps();
    }

    startTimers() {
        this.gameTimer = setInterval(() => {
            if (!this.paused) {
                if (this.freezeTimeLeft > 0) {
                    this.freezeTimeLeft--;
                } else {
                    this.timeLeft--;
                }
                this.timerElement.textContent = this.timeLeft;
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
                
                const levelInterval = this.zenMode ? 30 : 15;
                if (this.timeLeft % levelInterval === 0 && this.timeLeft > 0) {
                    this.levelUp();
                }
            }
        }, 1000);
    }

    spawnBubbles() {
        if (!this.gameRunning || this.paused) return;
        
        const bubble = this.createBubble();
        this.bubbles.push(bubble);
        this.gameArea.appendChild(bubble);
        
        this.cleanupBubbles();
        
        const spawnRate = Math.max(800 - (this.level * 100), 200);
        this.bubbleSpawnTimer = setTimeout(() => this.spawnBubbles(), spawnRate);
    }

    createBubble() {
        const bubble = document.createElement('div');
        const rand = Math.random();
        
        if (rand < 0.08) {
            bubble.className = 'bubble golden';
            bubble.dataset.points = '50';
            bubble.dataset.type = 'golden';
        } else if (rand < 0.15 && !this.zenMode) {
            bubble.className = 'bubble danger';
            bubble.dataset.points = '-20';
            bubble.dataset.type = 'danger';
        } else {
            bubble.className = 'bubble normal';
            bubble.dataset.points = '10';
            bubble.dataset.type = 'normal';
        }
        
        // Larger bubbles on mobile for better touch targets
        const isMobile = window.innerWidth <= 768;
        const size = isMobile ? Math.random() * 50 + 45 : Math.random() * 40 + 30;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * (this.gameArea.offsetWidth - size) + 'px';
        bubble.style.top = Math.random() * (this.gameArea.offsetHeight - size) + 'px';
        
        // Better touch handling for mobile
        bubble.addEventListener('click', (e) => this.popBubble(e.target));
        bubble.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.popBubble(e.target);
        }, { passive: false });
        
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.remove();
                this.bubbles = this.bubbles.filter(b => b !== bubble);
            }
        }, 4000 + (this.level * 500));
        
        return bubble;
    }

    popBubble(bubble) {
        if (!this.gameRunning || this.paused) return;
        
        const points = parseInt(bubble.dataset.points);
        const type = bubble.dataset.type;
        
        if (points > 0) {
            this.combo++;
            clearTimeout(this.comboTimer);
            this.comboTimer = setTimeout(() => this.resetCombo(), 3000);
            this.updateCombo();
        } else {
            this.resetCombo();
        }
        
        const finalPoints = Math.floor(points * this.scoreMultiplier * (1 + (this.combo - 1) * 0.1));
        this.score += finalPoints;
        this.updateUI();
        
        this.createParticles(bubble, type);
        this.showScorePopup(bubble, finalPoints);
        this.playSound(type);
        
        bubble.classList.add('popping');
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.remove();
            }
        }, 300);
        
        this.bubbles = this.bubbles.filter(b => b !== bubble);
        
        if (type === 'danger' && points < 0) {
            this.addScreenShake();
        }
    }

    createParticles(bubble, type) {
        const colors = {
            normal: ['#74b9ff', '#0984e3'],
            golden: ['#fdcb6e', '#e17055'],
            danger: ['#fd79a8', '#e84393']
        };
        
        const particleColors = colors[type] || colors.normal;
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.background = particleColors[Math.floor(Math.random() * particleColors.length)];
            particle.style.width = Math.random() * 6 + 4 + 'px';
            particle.style.height = particle.style.width;
            particle.style.left = bubble.style.left;
            particle.style.top = bubble.style.top;
            
            const angle = (i / 8) * Math.PI * 2;
            const velocity = Math.random() * 50 + 20;
            particle.style.setProperty('--dx', Math.cos(angle) * velocity + 'px');
            particle.style.setProperty('--dy', Math.sin(angle) * velocity + 'px');
            
            this.gameArea.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 2000);
        }
    }

    updateCombo() {
        if (this.combo >= 3) {
            this.comboElement.classList.remove('hidden');
            this.comboCountElement.textContent = this.combo;
            
            if (this.combo === 5 || this.combo === 10 || this.combo >= 15) {
                this.showComboIndicator();
            }
        }
    }

    showComboIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'combo-indicator';
        indicator.textContent = `${this.combo}x COMBO!`;
        indicator.style.right = '20px';
        indicator.style.top = '20%';
        
        this.gameArea.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 2000);
    }

    resetCombo() {
        this.combo = 0;
        this.comboElement.classList.add('hidden');
    }

    showScorePopup(bubble, points) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = points > 0 ? `+${points}` : points;
        popup.style.left = bubble.style.left;
        popup.style.top = bubble.style.top;
        popup.style.color = points > 0 ? '#4ecdc4' : '#ff6b6b';
        
        this.gameArea.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 1000);
    }

    addScreenShake() {
        this.gameArea.style.animation = 'none';
        setTimeout(() => {
            this.gameArea.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }

    playSound(type) {
        if (this.muted) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'normal':
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                break;
            case 'golden':
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                break;
            case 'danger':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    levelUp() {
        this.level++;
        this.levelElement.textContent = this.level;
        
        const levelUpPopup = document.createElement('div');
        levelUpPopup.className = 'score-popup';
        levelUpPopup.textContent = `Level ${this.level}!`;
        levelUpPopup.style.left = '50%';
        levelUpPopup.style.top = '30%';
        levelUpPopup.style.transform = 'translateX(-50%)';
        levelUpPopup.style.fontSize = '2em';
        levelUpPopup.style.color = '#fdcb6e';
        
        this.gameArea.appendChild(levelUpPopup);
        
        setTimeout(() => {
            if (levelUpPopup.parentNode) {
                levelUpPopup.remove();
            }
        }, 2000);
    }

    cleanupBubbles() {
        this.bubbles = this.bubbles.filter(bubble => bubble.parentNode);
        
        if (this.bubbles.length > 15) {
            const oldBubble = this.bubbles.shift();
            if (oldBubble.parentNode) {
                oldBubble.remove();
            }
        }
    }

    togglePause() {
        if (!this.gameRunning) return;
        
        this.paused = !this.paused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.paused ? '▶️ Resume' : '⏸️ Pause';
        
        if (!this.paused) {
            this.spawnBubbles();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        const muteBtn = document.getElementById('muteBtn');
        muteBtn.textContent = this.muted ? '🔇 Muted' : '🔊 Sound';
    }

    endGame() {
        this.gameRunning = false;
        this.paused = false;
        
        clearInterval(this.gameTimer);
        clearTimeout(this.bubbleSpawnTimer);
        
        this.bubbles.forEach(bubble => {
            if (bubble.parentNode) {
                bubble.remove();
            }
        });
        this.bubbles = [];
        
        this.finalScoreElement.textContent = this.score;
        this.finalLevelElement.textContent = this.level;
        this.updateScoreFeedback();
        this.gameOverScreen.classList.remove('hidden');
        this.checkForViralMoments();
        
        document.getElementById('pauseBtn').textContent = '⏸️ Pause';
        document.body.classList.remove('zen-mode');
        this.stopAmbientSounds();
        this.resetCombo();
        
        setTimeout(() => this.createBackgroundBubbles(), 1000);
    }

    restartGame() {
        this.startGame();
    }

    spawnPowerUps() {
        if (!this.gameRunning || this.paused || this.zenMode) return;
        
        if (Math.random() < 0.3) {
            const powerUp = this.createPowerUp();
            this.powerUps.push(powerUp);
            this.gameArea.appendChild(powerUp);
        }
        
        setTimeout(() => this.spawnPowerUps(), Math.random() * 10000 + 15000);
    }

    createPowerUp() {
        const powerUp = document.createElement('div');
        const types = ['freeze', 'multiply'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        powerUp.className = `power-up ${type}`;
        powerUp.dataset.type = type;
        powerUp.style.left = Math.random() * (this.gameArea.offsetWidth - 40) + 'px';
        powerUp.style.top = Math.random() * (this.gameArea.offsetHeight - 40) + 'px';
        
        powerUp.addEventListener('click', () => this.activatePowerUp(powerUp));
        powerUp.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.activatePowerUp(powerUp);
        }, { passive: false });
        
        setTimeout(() => {
            if (powerUp.parentNode) {
                powerUp.remove();
                this.powerUps = this.powerUps.filter(p => p !== powerUp);
            }
        }, 8000);
        
        return powerUp;
    }

    activatePowerUp(powerUp) {
        const type = powerUp.dataset.type;
        
        switch(type) {
            case 'freeze':
                this.freezeTimeLeft = 5;
                this.showPowerUpText('TIME FROZEN!');
                break;
            case 'multiply':
                this.scoreMultiplier = 2;
                this.showPowerUpText('DOUBLE POINTS!');
                setTimeout(() => { this.scoreMultiplier = 1; }, 10000);
                break;
        }
        
        powerUp.remove();
        this.powerUps = this.powerUps.filter(p => p !== powerUp);
        this.playPowerUpSound();
    }

    showPowerUpText(text) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = text;
        popup.style.left = '50%';
        popup.style.top = '40%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.fontSize = '1.5em';
        popup.style.color = '#fd79a8';
        
        this.gameArea.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 2000);
    }

    playPowerUpSound() {
        if (this.muted) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    startAmbientSounds() {
        if (this.muted) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator1.frequency.setValueAtTime(220, audioContext.currentTime);
            oscillator2.frequency.setValueAtTime(330, audioContext.currentTime);
            
            oscillator1.type = 'sine';
            oscillator2.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.02, audioContext.currentTime);
            
            oscillator1.start(audioContext.currentTime);
            oscillator2.start(audioContext.currentTime);
            
            this.ambientSounds = { oscillator1, oscillator2, gainNode, audioContext };
            
            const modulation = () => {
                if (this.ambientSounds && this.zenMode && !this.muted) {
                    const time = Date.now() / 1000;
                    oscillator1.frequency.setValueAtTime(220 + Math.sin(time * 0.1) * 20, audioContext.currentTime);
                    oscillator2.frequency.setValueAtTime(330 + Math.cos(time * 0.15) * 15, audioContext.currentTime);
                    setTimeout(modulation, 100);
                }
            };
            modulation();
        } catch (e) {
            console.log('Ambient sounds not supported');
        }
    }

    stopAmbientSounds() {
        if (this.ambientSounds) {
            try {
                this.ambientSounds.oscillator1.stop();
                this.ambientSounds.oscillator2.stop();
                this.ambientSounds = null;
            } catch (e) {
                console.log('Error stopping ambient sounds');
            }
        }
    }

    toggleZenMode() {
        if (!this.gameRunning) return;
        
        this.zenMode = !this.zenMode;
        
        if (this.zenMode) {
            document.body.classList.add('zen-mode');
            this.startAmbientSounds();
            document.getElementById('zenToggle').textContent = '🌟 Normal';
        } else {
            document.body.classList.remove('zen-mode');
            this.stopAmbientSounds();
            document.getElementById('zenToggle').textContent = '🧘 Zen';
        }
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
    }
}

const addShakeAnimation = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .particle {
            animation: particleExplosion 2s ease-out;
        }
        
        @keyframes particleExplosion {
            0% {
                opacity: 1;
                transform: translate(0, 0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(var(--dx, 0), var(--dy, 0)) scale(0.3);
            }
        }
    `;
    document.head.appendChild(style);
};

document.addEventListener('DOMContentLoaded', () => {
    addShakeAnimation();
    window.game = new BubblePopGame();
});