import Phaser from 'phaser';

/**
 * Base Enemy class extending Phaser's Arcade Sprite.
 * Provides shared physics setup and state for all enemy types.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene - The scene this enemy belongs to.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     * @param {string} textureKey - The texture key for the enemy sprite.
     * @param {object} config - Additional configuration for the enemy.
     */
    constructor(scene, x, y, textureKey, config = {}) {
        super(scene, x, y, textureKey);
        
        // Add this sprite to the scene
        this.scene.add.existing(this);
        // Enable arcade physics for this sprite
        this.scene.physics.add.existing(this);
        
        // Ensure gravity affects this enemy by default
        this.body.allowGravity = true;
        
        // State tracking
        this.isAlive = true;
    }

    /**
     * Abstract-ish patrol method. Can be overridden by subclasses.
     */
    patrol() {
        // Base implementation does nothing
    }

    /**
     * Generic death handler when hit by projectile or shell.
     */
    die() {
        if (!this.isAlive) return;
        this.isAlive = false;
        
        // Disable physics interactions
        if (this.body) {
            this.body.enable = false;
        }
        
        // Generic flip and fall death animation
        this.setFlipY(true);
        this.scene.tweens.add({
            targets: this,
            y: this.y - 50,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this,
                    y: this.y + 600,
                    duration: 1000,
                    ease: 'Quad.easeIn',
                    onComplete: () => this.destroy()
                });
            }
        });
    }
}

/**
 * ShroomGoon enemy (Goomba equivalent).
 * Walks left by default, turns around on wall collisions.
 * Can be stomped by the player.
 */
export class ShroomGoon extends Enemy {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'shroom-goon', config);
        
        // Configure physics body size
        this.body.setSize(20, 20);
        
        this.moveSpeed = 60;
        this.direction = -1;
        
        // Initial movement (walks left)
        this.body.setVelocityX(this.moveSpeed * this.direction);
    }

    /**
     * Called when the player jumps on this enemy.
     * @returns {boolean} True if stomp succeeded.
     */
    stomp() {
        if (!this.isAlive) return false;
        
        this.isAlive = false;
        
        // Stop movement
        this.body.setVelocityX(0);
        // Disable physics body so it doesn't interact anymore
        this.body.enable = false;

        // Squish animation: tween scaleY to 0.2 over 200ms
        this.scene.tweens.add({
            targets: this,
            scaleY: 0.2,
            y: this.y + 8, // Adjust y to stay on the ground while squishing
            duration: 200,
            onComplete: () => {
                // Emit score event to the HUD
                this.scene.game.events.emit('addScore', { points: 100, x: this.x, y: this.y });
                this.destroy();
            }
        });
        
        return true;
    }

    update() {
        if (!this.isAlive) return;

        // Check for wall collision and reverse direction
        if (this.body.blocked.left) {
            this.direction = 1;
            this.body.setVelocityX(this.moveSpeed * this.direction);
        } else if (this.body.blocked.right) {
            this.direction = -1;
            this.body.setVelocityX(this.moveSpeed * this.direction);
        }

        // Destroy if fallen off the world
        if (this.y > 600) {
            this.destroy();
        }
    }
}

/**
 * ShellCreeper enemy (Koopa equivalent).
 * Walks left. When stomped, turns into a shell.
 * When stomped again, kicks the shell to slide and destroy other enemies.
 */
export class ShellCreeper extends Enemy {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'shell-creeper', config);
        
        // Configure physics body size
        this.body.setSize(20, 28);
        
        this.moveSpeed = 50;
        this.shellSpeed = 400;
        this.direction = -1;
        
        // Initial movement (walks left)
        this.body.setVelocityX(this.moveSpeed * this.direction);
        
        // State tracking for shell mechanics
        this.isShell = false;
        this.isMovingShell = false;
    }

    /**
     * Called when player jumps on it.
     * @returns {boolean} True if stomp succeeded.
     */
    stomp() {
        if (!this.isAlive) return false;

        if (!this.isShell) {
            // Become a shell
            this.isShell = true;
            this.setTexture('shell');
            
            // Stop moving
            this.body.setVelocityX(0);
            
            // Resize body to be shorter for the shell
            this.body.setSize(20, 16);
            
            // Adjust y position slightly to account for smaller height
            this.y += 6;
            
            // Give score for stomping the creeper
            this.scene.game.events.emit('addScore', { points: 100 });
            return true;
        } else if (this.isShell && !this.isMovingShell) {
            // Player stomped a static shell, let's kick it
            // (Assuming kick is handled directly by player collision, but if called via stomp)
            // We just let the collision handler do the kick, or trigger it here if no direction known
            return true;
        }
        
        return false;
    }

    /**
     * Kick the shell in a specific direction.
     * @param {number} direction 1 for right, -1 for left.
     */
    kick(direction) {
        if (!this.isAlive) return;
        
        this.isMovingShell = true;
        this.direction = direction;
        this.body.setVelocityX(this.shellSpeed * this.direction);
    }

    update() {
        if (!this.isAlive) return;

        // Check wall collision
        if (this.body.blocked.left) {
            if (this.isMovingShell || !this.isShell) {
                this.direction = 1;
                this.body.setVelocityX((this.isMovingShell ? this.shellSpeed : this.moveSpeed) * this.direction);
            }
        } else if (this.body.blocked.right) {
            if (this.isMovingShell || !this.isShell) {
                this.direction = -1;
                this.body.setVelocityX((this.isMovingShell ? this.shellSpeed : this.moveSpeed) * this.direction);
            }
        }

        // Destroy if fallen off the world or off screen significantly
        if (this.y > 600 || this.x < -100 || this.x > this.scene.physics.world.bounds.width + 100) {
            this.destroy();
        }
    }
}

/**
 * PiranhaPlant enemy.
 * Emerges from pipes on a timer. Cannot be stomped, but can be shot.
 */
export class PiranhaPlant extends Enemy {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'piranha-plant', config);
        
        // Piranha plant is not affected by gravity
        this.body.allowGravity = false;
        // Piranha plant does not move via physics
        this.body.immovable = true;
        
        // Setup positions based on config or current y
        this.pipeY = config.pipeY || y;
        this.hiddenY = this.pipeY + 24;
        this.shownY = this.pipeY - 20;
        
        // Start hidden
        this.y = this.hiddenY;
        
        // Start the tween loop
        this.startTweenLoop();
    }

    /**
     * Starts the endless looping animation of hiding and showing.
     */
    startTweenLoop() {
        if (!this.isAlive) return;
        
        // Tween up to show
        this.scene.tweens.add({
            targets: this,
            y: this.shownY,
            duration: 800,
            delay: 1500, // Wait 1500ms before coming out
            onComplete: () => {
                if (!this.isAlive) return;
                
                // Tween down to hide
                this.scene.tweens.add({
                    targets: this,
                    y: this.hiddenY,
                    duration: 800,
                    delay: 2000, // Wait 2000ms while fully shown
                    onComplete: () => {
                        this.startTweenLoop(); // Loop again
                    }
                });
            }
        });
    }

    /**
     * Piranha plant can be destroyed by projectiles (like heart projectiles).
     * @param {Phaser.GameObjects.Sprite} projectile The projectile hitting it.
     * @returns {boolean}
     */
    canBeShotBy(projectile) {
        return true;
    }

    /**
     * Called when killed by a projectile.
     */
    die() {
        if (!this.isAlive) return;
        this.isAlive = false;
        
        // Disable body
        this.body.enable = false;
        
        // Death animation: fade out
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.scene.game.events.emit('addScore', { points: 200 });
                this.destroy();
            }
        });
    }

    update() {
        // No custom update logic needed, handled by tweens
    }
}

export default Enemy;
