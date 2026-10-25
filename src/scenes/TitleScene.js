import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Visual Layout: Background gradient from sky blue to warm gold
        // fillGradientStyle(topLeft, topRight, bottomLeft, bottomRight, alphaTopLeft, ...)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xFFD700, 0xFFD700, 1, 1, 1, 1);
        bg.fillRect(0, 0, width, height);

        // Visual Layout: 2-3 white cloud sprites floating slowly across
        this.clouds = this.add.group();
        for (let i = 0; i < 3; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(20, 150);
            
            // Reusing 'cloud' texture. If you swap in custom sprites, ensure they are loaded.
            const cloud = this.add.sprite(x, y, 'cloud');
            
            // Assign a custom property for slow rightward velocity
            cloud.speed = Phaser.Math.FloatBetween(0.2, 0.6);
            this.clouds.add(cloud);
        }

        // Title text: "SUPER PEACH BROS."
        this.add.text(width / 2, height / 2 - 90, "SUPER PEACH BROS.", {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            shadow: { offsetX: 4, offsetY: 4, color: '#FFB6C1', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Remix of Mario text (popping side-to-side)
        const remixText = this.add.text(width / 2, height / 2 - 30, "Remix of Super Mario Bros", {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '20px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Tween for popping side to side and scaling
        this.tweens.add({
            targets: remixText,
            angle: { from: -5, to: 5 },
            scaleX: { from: 0.9, to: 1.1 },
            scaleY: { from: 0.9, to: 1.1 },
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Credits text
        this.add.text(width - 10, height - 10, "Made by Afya Shaikh", {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '14px',
            color: '#FFFFFF',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
        }).setOrigin(1, 1).setDepth(100);

        // "Press ENTER to Start" text with blinking effect
        const startText = this.add.text(width / 2, height / 2 + 50, "Press ENTER to Start", {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '24px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, fill: true }
        }).setOrigin(0.5);
        
        // Easy Mode text
        const easyText = this.add.text(width / 2, height / 2 + 85, "Press E for Easy Mode (Unlimited Lives)", {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#228B22' // Forest Green
        }).setOrigin(0.5);

        // Instructions prompt
        const instText = this.add.text(width / 2, height / 2 + 120, "Press I for Instructions", {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '22px',
            color: '#FF69B4', // Hot pink
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Tween for the blinking effect
        this.tweens.add({
            targets: [startText, instText],
            alpha: 0.2,
            yoyo: true,
            repeat: -1,
            duration: 600 // 600ms per fade
        });

        // Decorative ground strip at the bottom using ground-gardens texture
        const groundHeight = 48;
        this.add.tileSprite(width / 2, height - groundHeight / 2, width, groundHeight, 'ground-gardens');

        // Create Instruction Overlay Container
        this.instructionContainer = this.add.container(0, 0).setDepth(200).setVisible(false);
        
        const overlayBg = this.add.graphics();
        overlayBg.fillStyle(0x000000, 0.95);
        overlayBg.fillRect(0, 0, width, height);
        this.instructionContainer.add(overlayBg);

        // Header
        const header = this.add.text(width / 2, 60, "=== HOW TO PLAY ===", {
            fontFamily: 'Arial Black, sans-serif', fontSize: '24px', color: '#FFD700'
        }).setOrigin(0.5);
        
        // ROW 1: Controls
        const controlsText = this.add.text(width / 2, 110, 
            "[ARROWS]: Move   |   [SPACE]: Jump   |   [SHIFT]: Run   |   [X]: Special", {
            fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#FFFFFF'
        }).setOrigin(0.5);
        
        // ROW 2: Scoring diagrams
        const scoreHeader = this.add.text(width / 2, 160, "- POINTS & ITEMS -", {
            fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#90EE90'
        }).setOrigin(0.5);
        
        // Create a layout of sprites + text
        // Left column
        const coinSprite = this.add.sprite(220, 210, 'coin').setScale(1.5);
        const coinText = this.add.text(250, 210, "Coin (200 pts)\nCollect 100 for a 1UP", { fontSize: '14px', color: '#FFF' }).setOrigin(0, 0.5);
        
        const crownSprite = this.add.sprite(220, 270, 'crown').setScale(1.5);
        const crownText = this.add.text(250, 270, "Crown (1000 pts)\nMakes you BIG!", { fontSize: '14px', color: '#FFF' }).setOrigin(0, 0.5);
        
        const goombaSprite = this.add.sprite(220, 330, 'shroom-goon').setScale(1.5);
        const goombaText = this.add.text(250, 330, "Stomp Enemies (100 pts)\nHit block below to flip!", { fontSize: '14px', color: '#FFF' }).setOrigin(0, 0.5);

        // Right column
        const brickSprite = this.add.sprite(480, 210, 'brick').setScale(1.2);
        const brickText = this.add.text(510, 210, "Shatter Bricks (50 pts)\n(Must be BIG)", { fontSize: '14px', color: '#FFF' }).setOrigin(0, 0.5);
        
        const flagSprite = this.add.sprite(480, 270, 'flagpole-flag');
        const flagText = this.add.text(510, 270, "Hit Flagpole Top (5k pts)", { fontSize: '14px', color: '#FFF' }).setOrigin(0, 0.5);
        
        const cageSprite = this.add.sprite(480, 330, 'cage').setScale(0.7);
        const cageText = this.add.text(510, 330, "Rescue Mario (Win!)\nRound 3 Goal", { fontSize: '14px', color: '#FFF' }).setOrigin(0, 0.5);

        // Secret / Tip
        const tipText = this.add.text(width / 2, 390, 
            "TIP: If you collect two crowns, you become a HUGE bulldozer!", {
            fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#FFB6C1', fontStyle: 'italic'
        }).setOrigin(0.5);

        const closeText = this.add.text(width / 2, 440, "Press I to close instructions", {
            fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#FF0000'
        }).setOrigin(0.5);
        
        // Blink close text
        this.tweens.add({
            targets: closeText, alpha: 0.2, yoyo: true, repeat: -1, duration: 600
        });

        this.instructionContainer.add([
            header, controlsText, scoreHeader, 
            coinSprite, coinText, crownSprite, crownText, goombaSprite, goombaText,
            brickSprite, brickText, flagSprite, flagText, cageSprite, cageText,
            tipText, closeText
        ]);

        // Input Handling
        this.isInstructionsOpen = false;

        this.input.keyboard.on('keydown-I', () => {
            this.isInstructionsOpen = !this.isInstructionsOpen;
            this.instructionContainer.setVisible(this.isInstructionsOpen);
        });

        const startGame = (easyMode) => {
            if (this.isInstructionsOpen) return;
            this.input.keyboard.off('keydown-ENTER');
            this.input.keyboard.off('keydown-E');
            this.input.keyboard.off('keydown-I');
            this.registry.set('easyMode', easyMode);
            this.scene.start('CharacterSelectScene');
        };

        this.input.keyboard.on('keydown-ENTER', () => startGame(false));
        this.input.keyboard.on('keydown-E', () => startGame(true));
    }

    update(time, delta) {
        // Move clouds slowly across the screen, wrap around when they go off-screen
        this.clouds.children.iterate((cloud) => {
            cloud.x += cloud.speed * (delta / 16.6); // Normalize speed across framerates
            
            if (cloud.x > this.scale.width + cloud.width) {
                // Wrap around to the left side
                cloud.x = -cloud.width;
                // Optionally randomize Y position slightly on wrap
                cloud.y = Phaser.Math.Between(20, 150);
            }
        });
    }
}
