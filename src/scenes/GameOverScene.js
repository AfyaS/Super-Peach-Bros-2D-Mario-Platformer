import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Stop the HUD
        this.scene.stop('HUDScene');

        const score = this.registry.get('score') || 0;

        // Black background
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 1);
        bg.fillRect(0, 0, width, height);

        // "GAME OVER" text
        this.add.text(width / 2, height / 2 - 40, "GAME OVER", {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '64px',
            color: '#FF0000',
            stroke: '#FFFFFF',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Score text
        this.add.text(width / 2, height / 2 + 40, `FINAL SCORE: ${score}`, {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '24px',
            color: '#FFD700'
        }).setOrigin(0.5);

        // Restart prompt
        const restartText = this.add.text(width / 2, height / 2 + 100, "Press ENTER to Return to Title", {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        // Blinking effect for restart text
        this.tweens.add({
            targets: restartText,
            alpha: 0.2,
            yoyo: true,
            repeat: -1,
            duration: 600
        });

        this.input.keyboard.once('keydown-ENTER', () => {
            this.registry.set('score', 0);
            this.registry.set('coins', 0);
            this.registry.set('lives', 3);
            this.scene.start('TitleScene');
        });
    }
}
