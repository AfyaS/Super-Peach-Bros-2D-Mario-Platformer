import Phaser from 'phaser';

export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.scene.stop('HUDScene');

        const score = this.registry.get('score') || 0;

        // Celebration background (Navy Blue)
        const bg = this.add.graphics();
        bg.fillStyle(0x000040, 1);
        bg.fillRect(0, 0, width, height);

        // Fireworks effect
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(2, 6);
            const alpha = Phaser.Math.FloatBetween(0.4, 1.0);
            const star = this.add.rectangle(x, y, size, size, 0xFFD700, alpha);
            this.tweens.add({
                targets: star,
                alpha: 0,
                y: y - 50,
                duration: Phaser.Math.Between(1000, 3000),
                repeat: -1,
                yoyo: true
            });
        }

        // "YOU WIN" text
        this.add.text(width / 2, height / 2 - 60, "YOU WIN!", {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '72px',
            color: '#FFD700', // Gold
            stroke: '#FFFFFF',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // "Mario Rescued" text
        this.add.text(width / 2, height / 2 + 10, "MARIO RESCUED", {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '32px',
            color: '#4169E1', // Mario blue
            stroke: '#FFFFFF',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Score text
        this.add.text(width / 2, height / 2 + 70, `TOTAL POINTS: ${score}`, {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '28px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        // Restart prompt
        const restartText = this.add.text(width / 2, height / 2 + 140, "Press ENTER to Return to Title", {
            fontFamily: 'Arial, sans-serif',
            fontSize: '20px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

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
