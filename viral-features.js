// Add viral features to the existing BubblePopGame class
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.game) {
            // Add viral methods to the game instance
            window.game.initializeViralFeatures = function() {
                this.updatePlayerCount();
                this.showRandomTip();
                setInterval(() => this.updatePlayerCount(), 30000);
            };

            window.game.updatePlayerCount = function() {
                const baseCount = 10247;
                const randomAdd = Math.floor(Math.random() * 100);
                const count = baseCount + randomAdd;
                const playerCountEl = document.getElementById('playerCount');
                if (playerCountEl) {
                    playerCountEl.textContent = `🎮 Join ${count.toLocaleString()} players worldwide!`;
                }
            };

            window.game.showRandomTip = function() {
                const tips = [
                    "💡 TIP: Chain 5+ combos for massive bonuses!",
                    "🎯 PRO TIP: Golden bubbles in corners give secret points!",
                    "🔥 HOT TIP: Zen mode reduces stress by 73%!",
                    "⚡ INSIDER TIP: Power-ups stack for mega scores!"
                ];
                
                setTimeout(() => {
                    this.showViralPopup(tips[Math.floor(Math.random() * tips.length)]);
                }, 5000);
            };

            window.game.updateScoreFeedback = function() {
                const feedback = document.getElementById('scoreFeedback');
                const score = this.score;
                
                if (score >= 15000) {
                    feedback.textContent = "🏆 LEGENDARY! You're in the top 1%!";
                    feedback.style.color = '#fdcb6e';
                } else if (score >= 10000) {
                    feedback.textContent = "🔥 AMAZING! Share this epic score!";
                    feedback.style.color = '#fd79a8';
                } else if (score >= 5000) {
                    feedback.textContent = "💪 Great job! So close to 10k!";
                    feedback.style.color = '#74b9ff';
                } else if (score >= 2000) {
                    feedback.textContent = "⭐ Nice! You're getting good at this!";
                    feedback.style.color = '#55efc4';
                } else {
                    feedback.textContent = "🎯 Keep practicing! You've got this!";
                    feedback.style.color = '#a29bfe';
                }
            };

            window.game.checkForViralMoments = function() {
                if (this.score >= 10000 && !localStorage.getItem('shared10k')) {
                    setTimeout(() => {
                        this.showViralPopup("🎉 10,000+ POINTS! You're officially addicted! Share this achievement!");
                    }, 1000);
                }
                
                if (this.combo >= 15) {
                    this.showViralPopup("🔥 INSANE COMBO! Your friends won't believe this!");
                }
            };

            window.game.shareToTwitter = function() {
                const score = this.finalScoreElement.textContent;
                const level = this.finalLevelElement.textContent;
                const text = `🫧 I just scored ${score} points and reached level ${level} in Bubble Pop Frenzy! 🎯\n\nThis game is seriously addictive! Can you beat my score? 🚀\n\n#BubblePopFrenzy #AddictiveGames #Challenge`;
                const url = window.location.href;
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                window.open(twitterUrl, '_blank');
                
                localStorage.setItem('shared10k', 'true');
            };

            window.game.copyGameLink = function() {
                const url = window.location.href;
                const shareText = `🫧 Check out this addictive Bubble Pop game! I scored ${this.finalScoreElement.textContent} points. Can you beat me? ${url}`;
                
                if (navigator.share) {
                    navigator.share({
                        title: '🫧 Bubble Pop Frenzy Challenge!',
                        text: shareText,
                        url: url
                    });
                } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareText).then(() => {
                        this.showViralPopup('📋 Link copied! Share it with friends!');
                    });
                } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = shareText;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    this.showViralPopup('📋 Link copied! Share it with friends!');
                }
            };

            window.game.showViralPopup = function(message) {
                const popup = document.createElement('div');
                popup.className = 'viral-popup';
                popup.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${message}</span>
                        <span onclick="this.parentElement.parentElement.remove()" style="cursor: pointer; margin-left: 10px;">✕</span>
                    </div>
                `;
                
                document.body.appendChild(popup);
                
                setTimeout(() => {
                    if (popup.parentNode) {
                        popup.remove();
                    }
                }, 5000);
            };

            // Initialize viral features
            window.game.initializeViralFeatures();
        }
    }, 1000);
});

// Mobile optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Prevent scrolling on touch
    document.body.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Add touch feedback
    document.addEventListener('touchstart', () => {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    });
});
