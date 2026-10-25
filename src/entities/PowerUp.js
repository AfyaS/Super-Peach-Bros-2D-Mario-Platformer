import Phaser from 'phaser';

/**
 * QuestionBlock contains items or coins.
 * When hit from below by the player, it bounces and spawns its contents.
 */
export class QuestionBlock extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'question-block');
        
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        // Block should not move or be affected by gravity
        this.body.immovable = true;
        this.body.allowGravity = false;
        
        this.isUsed = false;
        // Determine contents from config, default to 'coin'
        this.contents = config.contents || 'coin';
    }

    /**
     * Called when the player hits the block from below.
     * @param {Phaser.Physics.Arcade.Sprite} player 
     * @returns {Phaser.GameObjects.Sprite|null} The spawned item, or null.
     */
    hit(player) {
        if (this.isUsed) return null;
        
        this.isUsed = true;
        this.setTexture('question-block-used');
        
        // Bounce animation for the block
        this.scene.tweens.add({
            targets: this,
            y: this.y - 6,
            yoyo: true,
            duration: 100
        });

        const spawnX = this.x;
        const spawnY = this.y - 24;
        let spawnedItem = null;

        // Spawn contents
        switch (this.contents) {
            case 'crown':
                spawnedItem = new Crown(this.scene, spawnX, spawnY);
                break;
            case 'parasol':
                spawnedItem = new ParasolItem(this.scene, spawnX, spawnY);
                break;
            case 'star':
                spawnedItem = new StarItem(this.scene, spawnX, spawnY);
                break;
            case 'coin':
                // Quick coin animation
                const coinDummy = this.scene.add.sprite(spawnX, spawnY, 'coin');
                this.scene.tweens.add({
                    targets: coinDummy,
                    y: spawnY - 40,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        coinDummy.destroy();
                    }
                });
                // Emit events for coin and score
                this.scene.game.events.emit('addCoin');
                this.scene.game.events.emit('addScore', { points: 200, x: spawnX, y: spawnY });
                break;
        }

        return spawnedItem;
    }
}

/**
 * Crown Power-up (Mushroom equivalent).
 * Slides along the ground and bounces off walls.
 */
export class Crown extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'crown');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        this.body.setSize(16, 12);
        this.body.allowGravity = true;
        
        // Slides to the right
        this.body.setVelocityX(60);
        // Bounces off walls
        this.body.setBounceX(1);
    }
    
    update() {
        // Auto-destroy if it falls off screen
        if (this.y > this.scene.physics.world.bounds.height || this.x < -100 || this.x > this.scene.physics.world.bounds.width + 100) {
            this.destroy();
        }
    }

    /**
     * Called when collected by player.
     */
    collect(player) {
        if (player && player.collectCrown) player.collectCrown();
        this.destroy();
    }
}

/**
 * ParasolItem Power-up (Fire Flower equivalent).
 * Pops out of the block and stays stationary.
 */
export class ParasolItem extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'parasol-item');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        // Stays where spawned, no gravity
        this.body.allowGravity = false;
        this.body.immovable = true;
        
        // Spawning bounce animation
        const startY = this.y;
        this.y += 24; // start lower (inside block)
        this.scene.tweens.add({
            targets: this,
            y: startY,
            duration: 400,
            ease: 'Power2'
        });
    }

    /**
     * Called when collected by player.
     */
    collect(player) {
        if (player && player.collectParasol) player.collectParasol();
        this.destroy();
    }
}

/**
 * StarItem Power-up.
 * Bounces infinitely along the ground.
 */
export class StarItem extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'star-item');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        this.body.allowGravity = true;
        
        // Bounces infinitely
        this.body.setBounce(1.0, 1.0);
        
        // Shoots up and to the right initially
        this.body.setVelocity(100, -200);
    }
    
    update() {
        if (this.y > this.scene.physics.world.bounds.height || this.x < -100 || this.x > this.scene.physics.world.bounds.width + 100) {
            this.destroy();
        }
    }

    /**
     * Called when collected by player.
     */
    collect(player) {
        if (player && player.collectStar) player.collectStar();
        this.destroy();
    }
}

/**
 * Coin collectible.
 * Static item that gently hovers.
 */
export class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'coin');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        
        // Floats in place
        this.body.allowGravity = false;
        this.body.immovable = true;
        this.isCollected = false;
        
        // Gentle hover tween
        this.scene.tweens.add({
            targets: this,
            y: this.y - 3,
            yoyo: true,
            repeat: -1,
            duration: 1000,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * Called when collected by player.
     */
    collect() {
        if (this.isCollected) return;
        this.isCollected = true;
        
        this.scene.game.events.emit('addCoin');
        this.scene.game.events.emit('addScore', { points: 200 });
        
        this.body.enable = false;
        this.scene.tweens.add({
            targets: this,
            y: this.y - 18,
            alpha: 0,
            scaleX: 1.4,
            scaleY: 1.4,
            duration: 200,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}

export default {
    QuestionBlock,
    Crown,
    ParasolItem,
    StarItem,
    Coin
};
