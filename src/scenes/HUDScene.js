import Phaser from 'phaser';

export default class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene' });
    }

    init(data) {
        // Load from registry or set defaults
        this.score = this.registry.get('score') || 0;
        this.coins = this.registry.get('coins') || 0;
        this.lives = this.registry.get('lives') !== undefined ? this.registry.get('lives') : 3;
        
        this.registry.set('score', this.score);
        this.registry.set('coins', this.coins);
        this.registry.set('lives', this.lives);
        
        this.timer = 300; // 300 seconds default per level
        this.timerActive = true;
        this.currentLevel = data.currentLevel;
        this.isPaused = false;
    }

    create() {
        const width = this.scale.width;
        
        // The HUD scene ignores camera scroll intrinsically because its camera doesn't follow the player
        this.scene.setVisible(true);

        // Pause text (hidden by default)
        this.pausedText = this.add.text(width / 2, this.scale.height / 2, "PAUSED", {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '64px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5).setVisible(false).setDepth(100);

        // Pause Button (Top Right)
        this.pauseButtonBg = this.add.rectangle(width - 30, 25, 40, 40, 0x000000, 0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', this.togglePause, this);
        this.pauseIcon = this.add.text(width - 30, 25, '||', { 
            fontFamily: 'Arial Black', 
            fontSize: '24px', 
            color: '#FFFFFF' 
        }).setOrigin(0.5);

        // Pause input listener
        this.input.keyboard.on('keydown-ESC', this.togglePause, this);
        this.input.keyboard.on('keydown-P', this.togglePause, this);

        // TOP-LEFT: SCORE label and value
        this.scoreLabelText = this.add.text(10, 8, "SCORE", {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '16px',
            color: '#FFFFFF'
        });
        this.scoreValueText = this.add.text(10, 26, this.score.toString(), {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '16px',
            color: '#FFFFFF'
        });
        
        // TOP-LEFT: LIVES label and value
        this.livesLabelText = this.add.text(100, 8, "LIVES", {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '16px',
            color: '#FFB6C1'
        });
        
        const isEasyMode = this.registry.get('easyMode');
        const livesDisplay = isEasyMode ? "∞" : this.lives.toString();
        const fontSize = isEasyMode ? '24px' : '16px';
        const yOffset = isEasyMode ? 22 : 26;
        
        this.livesValueText = this.add.text(100, yOffset, livesDisplay, {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: fontSize,
            color: '#FFB6C1'
        });

        // TOP-CENTER: Coin icon and value
        const centerOffset = width / 2;
        this.add.sprite(centerOffset - 30, 16, 'coin').setScale(1.2);
        
        this.coinsText = this.add.text(centerOffset - 12, 8, `× ${this.coins}`, {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '16px',
            color: '#FFFFFF'
        });

        // TOP-RIGHT: TIME label and value
        this.timeLabelText = this.add.text(width - 10, 8, "TIME", {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '16px',
            color: '#FFFFFF'
        }).setOrigin(1, 0); // Right-aligned

        this.timeValueText = this.add.text(width - 10, 26, this.timer.toString(), {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '16px',
            color: '#FFFFFF'
        }).setOrigin(1, 0);

        // Progress Bar near the time
        this.add.text(width - 110, 50, "PROGRESS", {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '10px',
            color: '#FFFFFF'
        }).setOrigin(0, 0);
        
        this.progressBarBg = this.add.graphics();
        this.progressBarBg.fillStyle(0x333333, 1);
        this.progressBarBg.fillRect(width - 110, 62, 100, 6);
        
        this.progressBarFill = this.add.graphics();
        this.progressBarFill.fillStyle(0x00FF00, 1);
        this.progressBarFill.fillRect(width - 110, 62, 0, 6);

        // Register Global Event Listeners via this.game.events
        this.game.events.on('addScore', this.handleAddScore, this);
        this.game.events.on('addCoin', this.handleAddCoin, this);
        this.game.events.on('resetHUD', this.handleResetHUD, this);
        this.game.events.on('playerDied', this.handlePlayerDied, this);
        this.game.events.on('levelComplete', this.handleLevelComplete, this);
        this.game.events.on('updateProgress', this.handleUpdateProgress, this);
        this.game.events.on('levelRestart', this.handleLevelRestart, this);

        // Setup Timer Event: ticks every 1000ms
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.tickTimer,
            callbackScope: this,
            loop: true
        });

        this.events.once('shutdown', this.shutdown, this);
    }

    togglePause() {
        if (!this.currentLevel || !this.timerActive && this.timer <= 0) return; // don't allow pause if dead/ended

        if (this.isPaused) {
            // Resume
            this.isPaused = false;
            this.pausedText.setVisible(false);
            if (this.pauseIcon) this.pauseIcon.setText('||');
            if (this.timerActive) this.timerEvent.paused = false;
            this.scene.resume(this.currentLevel);
        } else {
            // Pause
            this.isPaused = true;
            this.pausedText.setVisible(true);
            if (this.pauseIcon) this.pauseIcon.setText('▶');
            if (this.timerActive) this.timerEvent.paused = true;
            this.scene.pause(this.currentLevel);
        }
    }

    handleAddScore(data) {
        const points = typeof data === 'number' ? data : (data?.points || 0);
        if (points > 0) {
            this.score += points;
            this.registry.set('score', this.score);
            this.scoreValueText.setText(this.score.toString());
            
            // Spawn floating text if coordinates are provided
            if (data.x !== undefined && data.y !== undefined) {
                const activeScene = this.scene.manager.getScenes(true).find(s => s.sys.settings.key.startsWith('Level'));
                if (activeScene) {
                    const txt = activeScene.add.text(data.x, data.y - 10, points.toString(), {
                        fontFamily: 'Arial Black, sans-serif',
                        fontSize: '12px',
                        color: '#FFFFFF',
                        stroke: '#000000',
                        strokeThickness: 2
                    }).setDepth(150);
                    activeScene.tweens.add({
                        targets: txt,
                        y: txt.y - 40,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => txt.destroy()
                    });
                }
            }
        }
    }

    handleAddCoin() {
        this.coins += 1;
        
        // 100 coins gives an extra life (1up logic)
        if (this.coins >= 100) {
            this.coins -= 100;
            if (!this.registry.get('easyMode')) {
                this.lives += 1;
                this.registry.set('lives', this.lives);
                this.livesValueText.setText(this.lives.toString());
            }
            // Optionally play 1up sound here or emit another event
        }
        
        this.registry.set('coins', this.coins);
        this.coinsText.setText(`× ${this.coins}`);
    }

    handleUpdateProgress(progress) {
        if (!this.progressBarFill) return;
        const width = this.scale.width;
        this.progressBarFill.clear();
        this.progressBarFill.fillStyle(0x00FF00, 1);
        this.progressBarFill.fillRect(width - 110, 62, 100 * progress, 6);
    }

    handleResetHUD() {
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.timer = 300;
        this.timerActive = true;
        
        this.scoreValueText.setText("0");
        this.coinsText.setText("× 0");
        
        const isEasyMode = this.registry.get('easyMode');
        if (isEasyMode) {
            this.livesValueText.setText("∞");
            this.livesValueText.setFontSize('24px');
            this.livesValueText.setY(22);
        } else {
            this.livesValueText.setText("3");
            this.livesValueText.setFontSize('16px');
            this.livesValueText.setY(26);
        }
        
        this.timeValueText.setText("300");
        this.timeValueText.setColor('#FFFFFF');
        
        if (this.timerEvent.paused) {
            this.timerEvent.paused = false;
        }
    }

    handlePlayerDied() {
        this.timerActive = false;
        this.timerEvent.paused = true;
    }

    handleLevelRestart(data) {
        if (data && data.currentLevel) {
            this.currentLevel = data.currentLevel;
        }
        this.timer = 300;
        this.timerActive = true;
        this.timeValueText.setText("300");
        this.timeValueText.setColor('#FFFFFF');
        if (this.timerEvent.paused) {
            this.timerEvent.paused = false;
        }
    }

    handleLevelComplete() {
        this.timerActive = false;
        this.timerEvent.paused = true;
        
        // Time bonus: Remaining seconds * 50 points
        const timeBonus = this.timer * 50;
        this.score += timeBonus;
        this.registry.set('score', this.score);
        this.scoreValueText.setText(this.score.toString());
    }

    tickTimer() {
        if (!this.timerActive) return;

        this.timer -= 1;
        this.timeValueText.setText(this.timer.toString());

        // Timer turns red when less than 60 seconds remain
        if (this.timer < 60) {
            this.timeValueText.setColor('#FF0000');
        } else {
            this.timeValueText.setColor('#FFFFFF');
        }

        // Handle timer expiration
        if (this.timer <= 0) {
            this.timer = 0;
            this.timerActive = false;
            this.timerEvent.paused = true;
            this.timeValueText.setText("0");
            
            // Emit event so gameplay scene can kill the player
            this.game.events.emit('timerExpired');
        }
    }

    shutdown() {
        // Critical: Remove all event listeners attached to the global event bus
        // to prevent memory leaks when the HUDScene is restarted or destroyed
        this.game.events.off('addScore', this.handleAddScore, this);
        this.game.events.off('addCoin', this.handleAddCoin, this);
        this.game.events.off('resetHUD', this.handleResetHUD, this);
        this.game.events.off('playerDied', this.handlePlayerDied, this);
        this.game.events.off('levelComplete', this.handleLevelComplete, this);
        this.game.events.off('updateProgress', this.handleUpdateProgress, this);
        this.game.events.off('levelRestart', this.handleLevelRestart, this);
    }
}
