import Phaser from 'phaser';
import Player from '../entities/Player.js';
import LevelBuilder from '../utils/LevelBuilder.js';
import { ShroomGoon, ShellCreeper, PiranhaPlant } from '../entities/Enemy.js';
import { QuestionBlock, Crown, ParasolItem, StarItem, Coin } from '../entities/PowerUp.js';

// Custom Thwomp Obstacle Class
class Thwomp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'thwomp');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.immovable = true;
    this.body.allowGravity = false;
    this.body.moves = false;
    this.startY = y;
    this.slamDistance = 120; // pixels to fall
    this.state = 'hovering'; // 'hovering', 'slamming', 'waiting', 'rising'
    this.detectRange = 80; // horizontal pixels to detect player
  }
  
  update(time, delta, playerX) {
    if (this.state === 'hovering') {
      if (Math.abs(this.x - playerX) < this.detectRange) {
        this.state = 'slamming';
        this.scene.tweens.add({
          targets: this,
          y: this.startY + this.slamDistance,
          duration: 200,
          ease: 'Quad.easeIn',
          onComplete: () => {
            this.state = 'waiting';
            this.body.updateFromGameObject();
            this.scene.time.delayedCall(1000, () => {
              this.state = 'rising';
              this.scene.tweens.add({
                targets: this,
                y: this.startY,
                duration: 1000,
                ease: 'Quad.easeOut',
                onComplete: () => {
                  this.state = 'hovering';
                  this.body.updateFromGameObject();
                }
              });
            });
          }
        });
      }
    }
    // Continuously sync physics body during tween
    this.body.updateFromGameObject();
  }
}

export default class Level3_Castle extends Phaser.Scene {
  constructor() {
    super({ key: 'Level3_Castle' });
  }
  
  init(data) {
    this.characterKey = data?.characterKey || 'peach';
  }
  
  create() {
    // 1. Draw background
    this.cameras.main.setBackgroundColor('#2F4F4F'); // Dark Slate Gray
    
    // Animated background lava glow
    const glow = this.add.rectangle(0, 480 - 48, 4800, 96, 0xFF4500);
    glow.setOrigin(0, 0);
    glow.setScrollFactor(0);
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.6, to: 1.0 },
      duration: 1500,
      yoyo: true,
      repeat: -1
    });

    // 2. Create projectiles group
    this.projectiles = this.physics.add.group();

    // 3. Build level from tile map (200 cols x 20 rows)
    const levelData = [
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................................................................................................................................................................",
      "........................................................BBBB............................................................................................................................................",
      "........................?.................S...................................................................BBBBBBBBBBB.....................................................BB......................",
      ".............................................................................C......................................................................................................M...................",
      "............................................................................................BB......................................E...E...E...E.......................................................",
      "................E.....................................o..o..o..................................................................BBBBBBBBBBBBBBBBBBBBBBB................................................",
      ".....................................E...............o........o...........K.......K......................K..........................................................................................",
      "GGGGGGGGGGGGGGGGGGGGGGGG......GGGGGGGGGGGGGGGGGG..........GGGGGGGGGGGGGGGGGGGGGGGGGGGG......GGGGGGGGGGGGGGGGGGGGGG................GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGGGGGGGGGG......GGGGGGGGGGGGGGGGGG..........GGGGGGGGGGGGGGGGGGGGGGGGGGGG......GGGGGGGGGGGGGGGGGGGGGG................GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ];

    const theme = {
      ground: 'ground-castle',
      brick: 'brick' // use castle brick if available
    };

    // 4. Store references
    const result = LevelBuilder.build(this, levelData, theme);
    this.platforms = result.platforms;
    this.groundTiles = result.groundTiles;
    this.bricks = result.bricks;
    this.questionBlocks = result.questionBlocks;
    this.coins = result.coins;
    this.enemies = result.enemies;
    this.flagpole = result.flagpole;



    // Add Lava group (visual and physics)
    this.lavaGroup = this.physics.add.staticGroup();
    // Create lava blocks across the entire bottom just below the screen
    for (let i = 0; i < levelData[0].length; i++) {
        // Find if ground is missing here
        const isGround = levelData[18][i] === 'G';
        if (!isGround) {
            this.lavaGroup.create(i * 24 + 12, 19 * 24 + 12, 'lava');
        }
    }

    // Add Thwomps
    this.thwomps = this.physics.add.group();
    // Add a thwomp near the castle entrance
    this.thwomps.add(new Thwomp(this, 130 * 24, 4 * 24));

    // Moving Platforms over Lava
    this.movingPlatforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    
    const platCoords = [
      { x: 27 * 24, y: 17 * 24 },   // Gap 1
      { x: 50 * 24, y: 17 * 24 },   // Gap 2
      { x: 55 * 24, y: 17 * 24 },   // Gap 2
      { x: 89 * 24, y: 17 * 24 },   // Gap 3
      { x: 118 * 24, y: 17 * 24 },  // Gap 4
      { x: 126 * 24, y: 17 * 24 }   // Gap 4
    ];

    platCoords.forEach(coord => {
      const p = this.physics.add.sprite(coord.x, coord.y, 'moving-platform');
      this.movingPlatforms.add(p);
      
      p.body.allowGravity = false;
      p.body.immovable = true;
      p.body.moves = true; // Use physics velocity to carry player
      
      p.body.setVelocityX(60);
      
      this.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => {
          if (p && p.body) {
            p.body.velocity.x *= -1;
          }
        }
      });
    });

    // Mario's Cage (Victory Area)
    this.cage = this.physics.add.sprite(188 * 24, 14 * 24 - 12, 'cage'); // Near end
    this.cage.body.allowGravity = false;
    this.cage.body.immovable = true;
    this.cage.setDepth(10); // Cage in front
    
    // Draw Mario inside
    const mario = this.add.sprite(188 * 24, 14 * 24 - 12 + 2, 'mario-prisoner');
    mario.setDepth(5); // Behind cage bars
    this.cageGroup = this.add.group([this.cage, mario]);

    // Final Boss (Bowser)
    this.bowser = this.physics.add.sprite(185 * 24, 18 * 24 - 32, 'bowser'); 
    this.bowser.body.immovable = true;
    this.bowser.body.allowGravity = false;
    this.bowser.setFlipX(true); // Face left towards player
    
    // Single Jump Block in front of Bowser
    this.jumpBlock = this.physics.add.sprite(182 * 24, 14 * 24, 'brick');
    this.jumpBlock.body.immovable = true;
    this.jumpBlock.body.allowGravity = false;
    this.platforms.add(this.jumpBlock); // Add to platforms so player can stand on it

    // 5. Create player at spawn point
    this.player = new Player(this, 48, 400, this.characterKey);

    // 6. Set up collisions
    this.setupCollisions();

    // 7. Set up camera & bounds
    this.cameras.main.setBounds(0, 0, result.levelWidth, result.levelHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, result.levelWidth, result.levelHeight);
    this.physics.world.setBoundsCollision(true, true, true, false);

    // 8. Launch HUD
    this.scene.launch('HUDScene', { currentLevel: this.scene.key });
    this.scene.bringToTop('HUDScene');

    // Round Intro Text
    const roundText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "ROUND 3\nBowser's Castle", {
        fontFamily: 'Arial Black, Impact, sans-serif',
        fontSize: '48px',
        color: '#FF4500',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
    
    this.tweens.add({
        targets: roundText,
        alpha: 0,
        y: roundText.y - 50,
        duration: 1000,
        delay: 2000,
        onComplete: () => roundText.destroy()
    });

    // 9. Listen for events
    this.game.events.on('timerExpired', this.onTimerExpired, this);
    this.events.once('shutdown', this.shutdown, this);
    
    this.isLevelComplete = false;
  }

  setupCollisions() {
    this.physics.add.collider(this.player, this.questionBlocks, this.hitBlock, null, this);
    this.physics.add.collider(this.player, this.platforms, this.hitSolid, null, this);
    this.physics.add.collider(this.player, this.movingPlatforms);
    
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.questionBlocks);
    this.physics.add.collider(this.enemies, this.enemies, this.handleEnemyVsEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.projectiles, this.enemies, this.projectileHitEnemy, null, this);
    this.physics.add.collider(this.projectiles, this.platforms);
    this.physics.add.collider(this.projectiles, this.questionBlocks);
    
    // Lava collision = instant death
    this.physics.add.overlap(this.player, this.lavaGroup, () => {
      if (!this.isLevelComplete) this.player.die('lava');
    });

    // Thwomp collision = damage or destroy if HUGE
    this.physics.add.overlap(this.player, this.thwomps, (p, t) => {
      if ((p.isInvincible && p.starTimer > 0) || p.isHuge) {
          t.destroy();
          this.game.events.emit('addScore', { points: 500 });
      } else if (t.state === 'slamming' || t.state === 'waiting') {
        p.takeDamage();
      }
    });

    // Bowser collision = Engulfed in Flames & Game Over
    this.physics.add.overlap(this.player, this.bowser, () => {
      if (!this.player.isDead && !this.isLevelComplete) {
        this.player.isDead = true;
        this.player.body.enable = false;
        
        // Flames effect
        this.player.setTint(0xFF4500); 
        
        const flame = this.add.sprite(this.player.x, this.player.y, 'lava');
        flame.setScale(1.5);
        this.tweens.add({
          targets: flame,
          y: flame.y - 40,
          alpha: 0,
          duration: 1000,
          ease: 'Power2'
        });
        
        // Force 0 lives for Game Over screen
        this.registry.set('lives', 0); 
        this.game.events.emit('playerDied');
        
        this.time.delayedCall(1500, () => {
           this.scene.start('GameOverScene');
        });
      }
    });

    // Victory Cage
    this.physics.add.overlap(this.player, this.cage, this.rescueMario, null, this);
  }

  hitSolid(player, platform) {
    if (player.body.touching.up && platform.body.touching.down) {
      // Check if it's a brick (texture starts with 'brick')
      if (platform.texture && platform.texture.key.startsWith('brick')) {
        
        // Bump enemies standing on top BEFORE destroying the block
        this.bumpEnemiesAbove(platform);

        if (player.powerState !== 'small') {
          // Break the brick
          this.spawnBrickDebris(platform.x, platform.y, platform.texture.key);
          platform.destroy();
          this.game.events.emit('addScore', { points: 50, x: platform.x, y: platform.y });
        } else {
          // Just bump it
          this.tweens.add({
            targets: platform,
            y: platform.y - 6,
            yoyo: true,
            duration: 100
          });
        }
      }
    }
  }

  bumpEnemiesAbove(block) {
    if (!this.enemies) return;
    this.enemies.children.each(enemy => {
      if (enemy.isAlive && Math.abs(enemy.x - block.x) < 24) {
        if (enemy.body && enemy.body.bottom <= block.body.top + 4 && enemy.body.bottom >= block.body.top - 4) {
          if (enemy.die) enemy.die();
          else if (enemy.stomp) enemy.stomp();
          this.game.events.emit('addScore', { points: 200, x: enemy.x, y: enemy.y });
        }
      }
    });
  }

  spawnBrickDebris(x, y, textureKey) {
    // 4 small pieces shooting out
    const vels = [ [-100, -250], [100, -250], [-150, -150], [150, -150] ];
    vels.forEach(v => {
      const debris = this.physics.add.sprite(x, y, textureKey);
      debris.setDisplaySize(12, 12); // half size
      debris.body.setVelocity(v[0], v[1]);
      debris.body.allowGravity = true;
      debris.body.checkCollision.none = true; // no collision
      
      this.tweens.add({
        targets: debris,
        angle: 360,
        duration: 500,
        repeat: -1
      });
      
      this.time.delayedCall(1500, () => debris.destroy());
    });
  }

  handleEnemyCollision(player, enemy) {
    if (!enemy.isAlive || this.isLevelComplete) return;

    // Star power invincibility or HUGE size destroys enemy on contact
    if ((player.isInvincible && player.starTimer > 0) || player.isHuge) {
      if (enemy.die) enemy.die();
      else if (enemy.stomp) enemy.stomp();
      this.game.events.emit('addScore', { points: 100 });
      return;
    }

    // Piranha plants cannot be stomped
    if (enemy.constructor.name === 'PiranhaPlant') {
      player.takeDamage();
      return;
    }

    // Static Shell: Walking into it or stomping it kicks it
    if (enemy.isShell && !enemy.isMovingShell) {
      const kickDir = (player.x < enemy.x) ? 1 : -1;
      enemy.kick(kickDir);
      this.game.events.emit('addScore', { points: 100 });
      if (player.body.velocity.y > 0) {
        player.body.setVelocityY(-200);
      }
      return;
    }

    // Stomp detection: falling onto enemy from above
    if (player.body.velocity.y > 0 && player.body.bottom <= enemy.body.top + 15) {
      const stomped = enemy.stomp();
      if (stomped) {
        player.body.setVelocityY(-250);
        this.game.events.emit('addScore', { points: 100, x: enemy.x, y: enemy.y });
      }
    } else {
      player.takeDamage();
    }
  }

  handleEnemyVsEnemy(e1, e2) {
    if (e1.isMovingShell && e2.isAlive && !e2.isMovingShell) {
      if (e2.die) e2.die();
      else if (e2.stomp) e2.stomp();
      this.game.events.emit('addScore', { points: 200, x: e2.x, y: e2.y });
    } else if (e2.isMovingShell && e1.isAlive && !e1.isMovingShell) {
      if (e1.die) e1.die();
      else if (e1.stomp) e1.stomp();
      this.game.events.emit('addScore', { points: 200, x: e1.x, y: e1.y });
    }
  }

  hitBlock(player, block) {
    if (player.body.touching.up && block.body.touching.down) {
      if (block.hit && !block.isUsed) {
        this.bumpEnemiesAbove(block);
        const item = block.hit(player);
        if (item) {
          this.physics.add.collider(item, this.platforms);
          this.physics.add.collider(item, this.questionBlocks);
          this.physics.add.collider(item, this.movingPlatforms);
          this.physics.add.overlap(this.player, item, (p, i) => {
            if (i.collect) i.collect(p);
          });
        }
      }
    }
  }

  collectCoin(player, coin) {
    if (coin && coin.active) {
      if (coin.collect) {
        coin.collect();
      } else {
        const cx = coin.x;
        const cy = coin.y;
        coin.destroy();
        this.game.events.emit('addCoin');
        this.game.events.emit('addScore', { points: 200, x: cx, y: cy });
      }
    }
  }
  
  projectileHitEnemy(projectile, enemy) {
    if (!enemy.isAlive) return;
    if (enemy.die) enemy.die();
    projectile.destroy();
    this.game.events.emit('addScore', { points: 100 });
  }

  rescueMario(player, cage) {
    if (this.isLevelComplete) return;
    this.isLevelComplete = true;

    this.game.events.emit('addScore', { points: 5000 });
    this.game.events.emit('levelComplete');
    
    player.body.setVelocityX(0);
    player.body.setAccelerationX(0);
    player.disableInput = true;

    // Celebration
    this.cameras.main.flash(500, 255, 255, 255);
    const vicText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, "MARIO RESCUED!", {
      fontSize: '48px',
      fontFamily: 'Arial Black, Impact, sans-serif',
      fill: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6
    }).setScrollFactor(0).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      this.scene.start('VictoryScene');
    });
  }

  onTimerExpired() {
    this.player.die();
  }

  update(time, delta) {
    if (!this.isLevelComplete) {
      this.player.update(time, delta);
      
      // Emit level progress (clamped between 0 and 1)
      const maxW = this.physics.world.bounds.width;
      const progress = Phaser.Math.Clamp(this.player.x / maxW, 0, 1);
      this.game.events.emit('updateProgress', progress);
    }
    
    // Update Thwomps
    if (this.thwomps) {
      this.thwomps.children.each(thwomp => {
        thwomp.update(time, delta, this.player.x);
      });
    }

    // Update enemies
    if (this.enemies) {
      this.enemies.children.each(enemy => {
        if (enemy.update) enemy.update(time, delta);
      });
    }

    // Moving platforms carry player
    if (this.movingPlatforms && this.player.body.touching.down) {
      this.movingPlatforms.children.each(platform => {
        // Simple manual check if player is standing on this specific platform
        if (
            this.player.body.bottom >= platform.body.top &&
            this.player.body.bottom <= platform.body.top + 5 &&
            this.player.body.right > platform.body.left &&
            this.player.body.left < platform.body.right
        ) {
          // Carry player by the platform's velocity
          this.player.x += platform.body.velocity.x * (delta / 1000);
        }
      });
    }

    if (this.player.y > this.physics.world.bounds.height + 50) {
      this.player.die('fall');
    }
  }

  shutdown() {
    this.game.events.off('timerExpired', this.onTimerExpired, this);
    this.scene.stop('HUDScene');
  }
}
