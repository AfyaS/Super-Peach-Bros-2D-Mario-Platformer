import Phaser from 'phaser';

/**
 * Flagpole representing the end of a level.
 */
export default class Flagpole {
    /**
     * @param {Phaser.Scene} scene - The Phaser scene.
     * @param {number} x - The x coordinate of the flagpole base.
     * @param {number} y - The y coordinate of the flagpole base (bottom).
     */
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // Pole height (assuming 240px tall pole, origin at center)
        const poleHeight = 240;
        
        // Create the pole sprite
        // We position it so its bottom touches y. 
        // If origin is 0.5, we offset by poleHeight/2
        this.pole = this.scene.add.sprite(x, y - poleHeight / 2, 'flagpole-pole');
        
        // Create the flag sprite, starts at top of the pole
        this.flag = this.scene.add.sprite(x - 12, y - poleHeight + 24, 'flagpole-flag');
        
        // Create a trigger zone for physics overlapping
        this.triggerZone = this.scene.add.zone(x, y - poleHeight / 2, 32, poleHeight);
        this.scene.physics.add.existing(this.triggerZone);
        
        // Trigger zone doesn't fall
        this.triggerZone.body.allowGravity = false;
        this.triggerZone.body.immovable = true;
        
        // To prevent multiple triggers
        this.isActivated = false;

        // Alias for level scenes that reference this.flagpole.zone
        this.zone = this.triggerZone;
    }

    /**
     * Called when player overlaps the trigger zone.
     * @param {Phaser.Physics.Arcade.Sprite} player 
     */
    activate(player) {
        if (this.isActivated) return;
        this.isActivated = true;

        // Calculate score based on player's height on the flagpole
        // The higher the player's Y (lower number), the more points
        const poleBottom = this.y;
        const hitHeight = poleBottom - player.y; // distance from bottom
        
        let points = 100;
        
        // Exact NES tier structure
        if (hitHeight > 220) {
            points = 5000; // Very tip of the pole
        } else if (hitHeight > 190) {
            points = 4000; // Upper section
        } else if (hitHeight > 150) {
            points = 2000; // Upper-middle
        } else if (hitHeight > 100) {
            points = 800; // Dead middle
        } else if (hitHeight > 40) {
            points = 400; // Lower-middle
        } else {
            points = 100; // Very bottom
        }
        
        // Emit score event on the global game event bus
        this.scene.game.events.emit('addScore', { points });

        // Slide the flag down
        this.scene.tweens.add({
            targets: this.flag,
            y: poleBottom - 24,
            duration: 1000,
            ease: 'Linear'
        });

        // Halt player horizontal movement and snap to pole X coordinate
        player.disableInput = true;
        player.body.setVelocity(0, 0);
        player.body.setAcceleration(0, 0);
        player.body.allowGravity = false;
        player.setX(this.x - 8); // Align perfectly with pole
        
        // Show "ROUND COMPLETED" text in the center of the screen
        const cam = this.scene.cameras.main;
        const completeText = this.scene.add.text(cam.centerX, cam.centerY - 50, "COURSE CLEAR!", {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '40px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, fill: true }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        
        // Show floating score text just like the arcade
        const scoreText = this.scene.add.text(this.x + 16, player.y - 10, points.toString(), {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '14px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(150);
        
        this.scene.tweens.add({
            targets: scoreText,
            y: scoreText.y - 40,
            alpha: 0,
            duration: 1500,
            onComplete: () => scoreText.destroy()
        });

        // Slide player down
        this.scene.tweens.add({
            targets: player,
            y: poleBottom - player.height / 2,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                // Animate player walking off to the right slightly (towards the castle)
                player.setFlipX(false);
                player.setX(this.x + 12); // Hop off pole
                player.body.setVelocityX(120);
                
                // After 2 seconds, emit levelComplete on the global game event bus
                this.scene.time.delayedCall(2000, () => {
                    player.body.setVelocityX(0);
                    this.scene.game.events.emit('levelComplete');
                });
            }
        });
    }
}
