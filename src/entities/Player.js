import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, characterKey) {
        // Initialize with small texture based on character key
        const textureKey = `player-${characterKey}-small`;
        super(scene, x, y, textureKey);
        
        // Add to scene display and physics lists
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.characterKey = characterKey;
        
        // Character specific stats
        this.stats = this.getCharacterStats(characterKey);
        
        // Core state variables
        this.powerState = 'small'; // 'small', 'big', 'parasol'
        this.isInvincible = false;
        this.iFrameTimer = 0;
        this.starTimer = 0;
        this.lives = 3;
        this.isDead = false;
        this.facingRight = true;

        // Physics variables for smooth platforming
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.wasGrounded = false;

        // Character specific ability variables
        this.floatTimer = 0; // For Peach
        this.hasDoubleJump = false; // For Daisy
        this.canDoubleJump = false; // For Daisy
        this.spinCooldown = 0; // For Rosalina
        
        // Shooting variables
        this.shootCooldown = 0;

        // Configure physics body
        // 16x24 for small player
        this.body.setSize(16, 24);
        this.body.setOffset(0, 0); // Adjust as needed for specific sprites
        
        // Cap falling speed, and limit maximum speed based on character
        this.body.setMaxVelocity(this.stats.maxRunSpeed, 600);
        this.body.setBounce(0, 0); // No bouncing
        
        // Collide with world bounds on sides only (fall off bottom)
        this.body.setCollideWorldBounds(true);
        // Note: Scene should do: scene.physics.world.setBoundsCollision(true, true, true, false)
        
        // Prevent falling too fast and tunneling through platforms
        this.body.setMaxVelocity(600, 600);
        
        // Input setup
        this.setupInput();
        
        // Setup initial timers
        this.lastTime = 0;
    }

    getCharacterStats(key) {
        const stats = {
            peach: {
                maxWalkSpeed: 200,
                maxRunSpeed: 320,
                acceleration: 600,
                jumpVelocity: -420,
                groundDrag: 800,
                airDrag: 200
            },
            daisy: {
                maxWalkSpeed: 240,
                maxRunSpeed: 400,
                acceleration: 750,
                jumpVelocity: -380,
                groundDrag: 800,
                airDrag: 200
            },
            rosalina: {
                maxWalkSpeed: 180,
                maxRunSpeed: 280,
                acceleration: 450,
                jumpVelocity: -480,
                groundDrag: 500,
                airDrag: 150
            }
        };
        return stats[key] || stats.peach;
    }

    setupInput() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.jumpKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.runKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.shootKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.spinKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Jump buffer tracking
        this.jumpKey.on('down', () => {
            this.jumpBufferTimer = 100; // 100ms jump buffer
        });
    }

    update(time, delta) {
        if (this.isDead || this.disableInput) return;

        // Check grounded state
        const isGrounded = this.body.blocked.down || this.body.touching.down;
        
        // Update coyote timer
        if (isGrounded) {
            this.coyoteTimer = 100; // 100ms coyote time
            this.floatTimer = 1500; // Reset Peach's float timer
            this.canDoubleJump = true; // Reset Daisy's double jump
        } else {
            this.coyoteTimer -= delta;
        }
        
        // Update jump buffer timer
        if (this.jumpBufferTimer > 0) {
            this.jumpBufferTimer -= delta;
        }

        // Update timers
        if (this.spinCooldown > 0) this.spinCooldown -= delta;
        if (this.shootCooldown > 0) this.shootCooldown -= delta;
        
        this.updateTimers(delta);
        
        // Execute buffered jump if grounded
        if (isGrounded && this.jumpBufferTimer > 0) {
            this.executeJump();
            this.jumpBufferTimer = 0;
        }

        this.handleMovement(delta, isGrounded);
        this.handleJumping(delta, isGrounded);
        this.handleAbilities(delta, isGrounded);
        this.handleShooting();
    }

    handleMovement(delta, isGrounded) {
        const leftDown = this.cursors.left.isDown;
        const rightDown = this.cursors.right.isDown;
        const runDown = this.runKey.isDown;
        
        // Determine target speed and acceleration based on star power and run key
        const speedMultiplier = this.starTimer > 0 ? 1.3 : 1;
        const maxCurrentSpeed = runDown ? this.stats.maxRunSpeed * speedMultiplier : this.stats.maxWalkSpeed * speedMultiplier;
        
        // Determine acceleration, reduce it by 35% if in air (air control)
        let accel = this.stats.acceleration;
        if (!isGrounded) {
            accel *= 0.65;
        }

        if (leftDown) {
            // Apply friction for snappy turning if moving opposite direction
            if (this.body.velocity.x > 0) accel *= 1.5;
            
            this.body.setAccelerationX(-accel);
            this.facingRight = false;
            this.setFlipX(true);
        } else if (rightDown) {
            // Apply friction for snappy turning if moving opposite direction
            if (this.body.velocity.x < 0) accel *= 1.5;
            
            this.body.setAccelerationX(accel);
            this.facingRight = true;
            this.setFlipX(false);
        } else {
            // No input, apply drag to slow down
            this.body.setAccelerationX(0);
            const drag = isGrounded ? this.stats.groundDrag : this.stats.airDrag;
            this.body.setDragX(drag);
        }

        // Clamp velocity to max speed
        if (Math.abs(this.body.velocity.x) > maxCurrentSpeed) {
            this.body.velocity.x = Math.sign(this.body.velocity.x) * maxCurrentSpeed;
        }
    }

    handleJumping(delta, isGrounded) {
        // Variable Jump Height: Cut jump short if jump key is released while ascending
        if (Phaser.Input.Keyboard.JustUp(this.jumpKey) && this.body.velocity.y < 0) {
            this.body.velocity.y *= 0.45;
        }

        // Standard jump execution is handled by the jump buffer in update()
        // But we also check manual jumps with coyote time
        if (Phaser.Input.Keyboard.JustDown(this.jumpKey) && this.coyoteTimer > 0) {
            this.executeJump();
        }
    }
    
    executeJump() {
        this.body.velocity.y = this.stats.jumpVelocity;
        this.coyoteTimer = 0; // Consume coyote time
    }

    handleAbilities(delta, isGrounded) {
        // 1. Peach - Dress Float
        if (this.characterKey === 'peach' && !isGrounded && this.body.velocity.y > 0) {
            if (this.jumpKey.isDown && this.floatTimer > 0) {
                // Cap falling velocity at 60 (40% of normal terminal ~150)
                if (this.body.velocity.y > 60) {
                    this.body.velocity.y = 60;
                }
                this.floatTimer -= delta;
                
                // Visual wobble could be handled with a scene tween or manually
                this.angle = Math.sin(this.scene.time.now / 50) * 5;
            } else {
                this.angle = 0;
            }
        } else {
            this.angle = 0;
        }

        // 2. Daisy - Double Jump
        if (this.characterKey === 'daisy' && !isGrounded && this.body.velocity.y > 0) {
            this.hasDoubleJump = true;
        }
        
        if (this.characterKey === 'daisy' && !isGrounded && Phaser.Input.Keyboard.JustDown(this.jumpKey) && this.canDoubleJump) {
            this.body.velocity.y = this.stats.jumpVelocity * 0.8;
            this.canDoubleJump = false;
            
            // Brief scale bounce animation
            this.scene.tweens.add({
                targets: this,
                scaleY: 1.2,
                scaleX: 0.8,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeInOut'
            });
        }

        // 3. Rosalina - Star Spin
        if (this.characterKey === 'rosalina' && Phaser.Input.Keyboard.JustDown(this.spinKey)) {
            if (!isGrounded && this.spinCooldown <= 0) {
                this.body.velocity.y = -120; // Brief hover boost
                
                // Create spin hitbox
                const spinZone = this.scene.add.zone(this.x, this.y, 60, 60);
                this.scene.physics.add.existing(spinZone);
                spinZone.body.setCircle(30);
                
                // The zone should follow player for 300ms
                spinZone.update = () => {
                    spinZone.x = this.x;
                    spinZone.y = this.y;
                };
                
                this.scene.events.on('update', spinZone.update);
                
                // Store reference if needed for overlap
                this.scene.spinHitbox = spinZone;

                // Damage any enemies touched by the star spin
                if (this.scene.enemies) {
                    this.scene.physics.add.overlap(spinZone, this.scene.enemies, (zone, enemy) => {
                        if (enemy && enemy.isAlive) {
                            if (enemy.die) enemy.die();
                            else if (enemy.stomp) enemy.stomp();
                            this.scene.game.events.emit('addScore', { points: 200 });
                        }
                    });
                }

                // Cleanup spin hitbox after 300ms
                this.scene.time.delayedCall(300, () => {
                    this.scene.events.off('update', spinZone.update);
                    spinZone.destroy();
                    this.scene.spinHitbox = null;
                });

                // Spin animation
                this.scene.tweens.add({
                    targets: this,
                    angle: 360,
                    duration: 300,
                    onComplete: () => {
                        this.angle = 0;
                    }
                });

                this.spinCooldown = 800; // Reset cooldown
            }
        }
    }

    handleShooting() {
        if (this.shootKey.isDown && this.powerState === 'parasol' && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = 400; // 400ms cooldown
        }
    }

    shoot() {
        // Create heart projectile
        const projX = this.x + (this.facingRight ? 20 : -20);
        const projectile = this.scene.physics.add.sprite(projX, this.y, 'heart-projectile');
        
        // Add to scene's projectiles group if it exists
        if (!this.scene.projectiles) {
            this.scene.projectiles = this.scene.physics.add.group();
        }
        this.scene.projectiles.add(projectile);

        projectile.body.setAllowGravity(true);
        projectile.body.setGravityY(600 - this.scene.physics.world.gravity.y); // Adjust since world gravity is 900
        projectile.body.velocity.x = this.facingRight ? 300 : -300;
        projectile.body.velocity.y = -100;
        projectile.body.setBounce(0.8, 0);

        // Destroy after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            if (projectile.active) projectile.destroy();
        });
    }

    updateTimers(delta) {
        // i-frames
        if (this.iFrameTimer > 0) {
            this.iFrameTimer -= delta;
            this.isInvincible = true;
            // Flashing effect (toggle visible every 100ms)
            this.visible = Math.floor(this.iFrameTimer / 100) % 2 === 0;
            
            if (this.iFrameTimer <= 0) {
                this.isInvincible = this.starTimer > 0;
                this.visible = true;
            }
        }

        // star power
        if (this.starTimer > 0) {
            this.starTimer -= delta;
            this.isInvincible = true;
            
            // Cycle tint colors
            const colors = [0xff0000, 0xffa500, 0xffff00, 0x008000, 0x0000ff, 0x4b0082, 0xee82ee];
            const colorIndex = Math.floor((10000 - this.starTimer) / 100) % colors.length;
            this.setTint(colors[colorIndex]);

            if (this.starTimer <= 0) {
                this.isInvincible = this.iFrameTimer > 0;
                this.clearTint();
            }
        }
    }

    collectCrown() {
        if (this.powerState === 'small') {
            this.powerState = 'big';
            this.setTexture(`player-${this.characterKey}-big`);
            this.body.setSize(24, 36);
            this.y -= 12; // Shift up to prevent clipping into platforms
            
            // Brief grow animation
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 150,
                yoyo: true
            });
        } else if (!this.isHuge) {
            // Become HUGE! (Double size)
            this.isHuge = true;
            this.y -= 36; // Shift up because we are 36 pixels taller when scaled
            
            this.scene.tweens.add({
                targets: this,
                scaleX: 2.0,
                scaleY: 2.0,
                duration: 300,
                ease: 'Bounce.easeOut'
            });
            this.scene.game.events.emit('addScore', { points: 1000 });
        } else {
            this.scene.game.events.emit('addScore', { points: 1000 });
        }
    }

    collectParasol() {
        if (this.powerState === 'small') {
            this.collectCrown();
            // Now we are big, continue to become parasol
            this.powerState = 'parasol';
            this.setTexture(`player-parasol-big`);
        } else if (this.powerState === 'big') {
            this.powerState = 'parasol';
            this.setTexture(`player-parasol-big`);
        } else if (this.powerState === 'parasol') {
            this.scene.game.events.emit('addScore', { points: 1000 });
        }
    }

    collectStar() {
        this.starTimer = 10000; // 10 seconds of star power
        this.isInvincible = true;
        this.scene.game.events.emit('addScore', { points: 1000 });
    }

    takeDamage() {
        if (this.isInvincible) return;

        if (this.isHuge) {
            this.isHuge = false;
            this.scene.tweens.killTweensOf(this); // stop the huge yoyo tween
            
            // scale back to 1
            this.scene.tweens.add({
                targets: this,
                scaleX: 1,
                scaleY: 1,
                duration: 200
            });
            this.iFrameTimer = 1000;
        } else if (this.powerState === 'parasol') {
            this.powerState = 'big';
            this.setTexture(`player-${this.characterKey}-big`);
            this.iFrameTimer = 1000;
        } else if (this.powerState === 'big') {
            this.powerState = 'small';
            this.setTexture(`player-${this.characterKey}-small`);
            this.body.setSize(16, 24);
            this.iFrameTimer = 1000;
        } else if (this.powerState === 'small') {
            this.die('fall');
        }
    }

    die(cause = 'enemy') {
        if (this.isDead) return;
        this.isDead = true;
        
        const isEasyMode = this.scene.registry.get('easyMode');
        let currentLives = this.scene.registry.get('lives');
        if (currentLives === undefined) currentLives = 3;
        
        if (!isEasyMode) {
            currentLives -= 1;
            this.scene.registry.set('lives', currentLives);
        }
        
        this.scene.game.events.emit('playerDied');
        
        // Death animation
        this.body.enable = false; // Disable physics collisions
        
        if (cause === 'lava' || cause === 'fall') {
            // Just sink/fall down
            this.scene.tweens.add({
                targets: this,
                y: this.y + 600,
                duration: 600,
                ease: 'Quad.easeIn'
            });
        } else {
            // We use a tween for the jump so we don't rely on physics update
            this.scene.tweens.add({
                targets: this,
                y: this.y - 100, // jump up
                duration: 300,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    this.scene.tweens.add({
                        targets: this,
                        y: this.y + 600, // fall off screen
                        duration: 600,
                        ease: 'Quad.easeIn'
                    });
                }
            });
        }

        this.scene.time.delayedCall(2000, () => {
            if (currentLives > 0) {
                this.scene.game.events.emit('levelRestart', { currentLevel: this.scene.scene.key });
                this.scene.scene.restart();
            } else {
                this.scene.scene.start('GameOverScene');
            }
        });
    }
}
