import Phaser from 'phaser';
import Player from '../entities/Player.js';
import LevelBuilder from '../utils/LevelBuilder.js';
import { ShroomGoon, ShellCreeper, PiranhaPlant } from '../entities/Enemy.js';
import { QuestionBlock, Crown, ParasolItem, StarItem, Coin } from '../entities/PowerUp.js';

export default class Level1_Gardens extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1_Gardens' });
  }
  
  init(data) {
    this.characterKey = data?.characterKey || 'peach';
  }
  
  create() {
    // 1. Draw background
    this.cameras.main.setBackgroundColor('#87CEEB');
    
    // Decorative clouds with parallax scrolling
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.sprite(200 + i * 800, 100 + (Math.random() * 100), 'cloud');
      cloud.setScrollFactor(0.3);
      cloud.setScale(1.5 + Math.random());
    }

    // 2. Create projectiles group
    this.projectiles = this.physics.add.group();

    // 3. Build level from tile map (170 cols x 20 rows)
    const levelData = [
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      "..........................................................................................................................................................................",
      ".................................................oooo.....................................................................................................................",
      "........................?B?.................o...oooooo...o.....................BB?BB.......................................B?B............................................",
      "..............................................B........B.............................................S....................................................................",
      "...............C....................................................o.......................o....................o...........................................o..........",
      "...................................................................oo....E.................oo........K..........oo......K...................................oo..........",
      ".................................E...........................P....ooo.....................ooo..................ooo....................F....................ooo..........",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
      "GGGGGGGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGPGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
    ];

    const theme = {
      ground: 'ground-gardens',
      brick: 'brick'
    };

    const level = LevelBuilder.build(this, levelData, theme, 24);

    // 4. Store references
    this.platforms = level.platforms;
    this.groundTiles = level.groundTiles;
    this.bricks = level.bricks;
    this.questionBlocks = level.questionBlocks;
    this.coins = level.coins;
    this.enemies = level.enemies;
    this.flagpole = level.flagpole;

    // 5. Create player at spawn point
    this.player = new Player(this, 48, 400, this.characterKey);

    // Decorative Castle at the end
    if (this.flagpole) {
      const castle = this.add.sprite(this.flagpole.x + 120, this.flagpole.y - 48, 'castle');
      castle.setDepth(-5);
    }

    // 6. Set up collisions
    this.setupCollisions();

    // 7. Set up camera & bounds
    this.cameras.main.setBounds(0, 0, level.levelWidth, level.levelHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, level.levelWidth, level.levelHeight);
    this.physics.world.setBoundsCollision(true, true, true, false);

    // 8. Launch HUD
    this.scene.launch('HUDScene', { currentLevel: this.scene.key });
    this.scene.bringToTop('HUDScene');

    // Round Intro Text
    const roundText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "ROUND 1\nMushroom Gardens", {
        fontFamily: 'Arial Black, Impact, sans-serif',
        fontSize: '48px',
        color: '#FFFFFF',
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
    this.game.events.on('levelComplete', this.onLevelComplete, this);
    this.events.once('shutdown', this.shutdown, this);
    
    this.isLevelComplete = false;
  }

  setupCollisions() {
    this.physics.add.collider(this.player, this.questionBlocks, this.hitBlock, null, this);
    this.physics.add.collider(this.player, this.platforms, this.hitSolid, null, this);
    
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.questionBlocks);
    this.physics.add.collider(this.enemies, this.enemies, this.handleEnemyVsEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.projectiles, this.enemies, this.projectileHitEnemy, null, this);
    this.physics.add.collider(this.projectiles, this.platforms);
    this.physics.add.collider(this.projectiles, this.questionBlocks);
    if (this.flagpole) {
      this.physics.add.overlap(this.player, this.flagpole.zone, this.reachFlagpole, null, this);
    }
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

  reachFlagpole(player, flagpoleZone) {
    if (this.isLevelComplete) return;
    this.isLevelComplete = true;

    // Use the actual Flagpole class's built-in activation logic
    // which handles the sliding, lock-on, and variable scoring
    if (this.flagpole && this.flagpole.activate) {
        this.flagpole.activate(player);
    }

    // Still award the coin and emit completion signal
    this.game.events.emit('addCoin');
    this.game.events.emit('levelComplete');

    this.time.delayedCall(2000, () => {
      this.scene.stop('HUDScene');
      this.scene.start('Level2_Ice', { characterKey: this.characterKey });
    });
  }

  onTimerExpired() {
    this.player.die();
  }
  
  onLevelComplete() {}

  update(time, delta) {
    if (!this.isLevelComplete) {
      this.player.update(time, delta);
      
      // Emit level progress (clamped between 0 and 1)
      const maxW = this.physics.world.bounds.width;
      const progress = Phaser.Math.Clamp(this.player.x / maxW, 0, 1);
      this.game.events.emit('updateProgress', progress);
    }
    if (this.enemies) {
      this.enemies.children.each(enemy => {
        if (enemy.update) enemy.update(time, delta);
      });
    }
    if (this.player.y > this.physics.world.bounds.height + 50) {
      this.player.die();
    }
  }

  shutdown() {
    this.game.events.off('timerExpired', this.onTimerExpired, this);
    this.game.events.off('levelComplete', this.onLevelComplete, this);
    this.scene.stop('HUDScene');
  }
}
