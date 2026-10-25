import Phaser from 'phaser';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    init() {
        this.selectedIndex = 0;
        this.characterKeys = ['peach', 'daisy', 'rosalina'];
        
        // Data for each character's stats and descriptions
        this.charactersData = [
            {
                key: 'peach',
                name: 'PEACH',
                themeColor: '#FFB6C1', // Pink
                stats: { speed: 3, jump: 3, special: 4 },
                desc: "DRESS FLOAT\nHold jump to glide"
            },
            {
                key: 'daisy',
                name: 'DAISY',
                themeColor: '#FFA500', // Orange
                stats: { speed: 5, jump: 2, special: 3 },
                desc: "DOUBLE JUMP\nJump again in mid-air"
            },
            {
                key: 'rosalina',
                name: 'ROSALINA',
                themeColor: '#00FFFF', // Cyan
                stats: { speed: 2, jump: 5, special: 5 },
                desc: "STAR SPIN\nPress X to spin attack"
            }
        ];
        
        this.panels = [];
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Background: deep purple (#2E0854) gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x2E0854, 0x2E0854, 0x1A0033, 0x1A0033, 1, 1, 1, 1);
        bg.fillRect(0, 0, width, height);

        // Header text
        this.add.text(width / 2, 40, "CHOOSE YOUR PRINCESS", {
            fontFamily: 'Arial Black, Impact, sans-serif',
            fontSize: '28px',
            color: '#FFFFFF',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, fill: true }
        }).setOrigin(0.5);

        // Layout constants for the panels
        const panelWidth = 200;
        const panelHeight = 320;
        const spacing = 40;
        const totalWidth = (panelWidth * 3) + (spacing * 2);
        const startX = (width - totalWidth) / 2 + (panelWidth / 2);
        const startY = height / 2 + 20;

        // Render each panel
        this.charactersData.forEach((char, index) => {
            const px = startX + index * (panelWidth + spacing);
            const py = startY;

            // Container to group panel elements
            const panelContainer = this.add.container(px, py);
            
            // Panel background (dimmed slightly)
            const panelBg = this.add.graphics();
            panelBg.fillStyle(0x000000, 0.4);
            panelBg.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 16);
            panelContainer.add(panelBg);

            // Sprite preview (big variant)
            const sprite = this.add.sprite(0, -60, `player-${char.key}-big`).setScale(2);
            panelContainer.add(sprite);

            // Character Name
            const nameText = this.add.text(0, 20, char.name, {
                fontFamily: 'Arial Black, sans-serif',
                fontSize: '24px',
                color: char.themeColor,
                shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 0, fill: true }
            }).setOrigin(0.5);
            panelContainer.add(nameText);

            // Stat bars helper function
            const drawStatBar = (yOffset, label, value, color) => {
                const labelText = this.add.text(-85, yOffset - 8, label, {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '11px',
                    fontStyle: 'bold',
                    color: '#FFFFFF'
                });
                
                // Max 5 chunks
                const barWidth = 95;
                const fillWidth = (value / 5) * barWidth;
                
                const barBg = this.add.graphics();
                barBg.fillStyle(0x333333, 1);
                barBg.fillRect(-5, yOffset - 4, barWidth, 10);
                
                const barFill = this.add.graphics();
                barFill.fillStyle(color, 1);
                barFill.fillRect(-5, yOffset - 4, fillWidth, 10);

                panelContainer.add([labelText, barBg, barFill]);
            };

            // Draw Speed (green), Jump (blue), Special (purple)
            drawStatBar(50, "SPEED", char.stats.speed, 0x00FF00);
            drawStatBar(70, "JUMP", char.stats.jump, 0x00BFFF);
            drawStatBar(90, "SPECIAL", char.stats.special, 0xDA70D6);

            // Ability description
            const descText = this.add.text(0, 130, char.desc, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                color: '#CCCCCC',
                align: 'center'
            }).setOrigin(0.5);
            panelContainer.add(descText);

            // Save panel reference
            this.panels.push(panelContainer);
        });

        // Add selection border (bright gold 4px thick stroke)
        this.selectionBorder = this.add.graphics();
        this.updateSelection();

        // Controls Info at bottom
        this.add.text(width / 2, height - 25, "CONTROLS: [ARROWS] Move • [SPACE] Jump • [SHIFT] Run • [X] Special • [ENTER] Start", {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#DDDDDD',
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 1, fill: true }
        }).setOrigin(0.5);

        // Inputs
        this.input.keyboard.on('keydown-LEFT', () => {
            this.selectedIndex--;
            if (this.selectedIndex < 0) this.selectedIndex = 2;
            this.updateSelection();
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            this.selectedIndex++;
            if (this.selectedIndex > 2) this.selectedIndex = 0;
            this.updateSelection();
        });

        this.input.keyboard.once('keydown-ENTER', () => {
            this.confirmSelection();
        });
    }

    updateSelection() {
        const panelWidth = 200;
        const panelHeight = 320;
        
        // Dim non-selected panels and highlight selected
        this.panels.forEach((panel, index) => {
            if (index === this.selectedIndex) {
                panel.setAlpha(1.0);
                
                // Move selection border to active panel
                this.selectionBorder.clear();
                this.selectionBorder.lineStyle(4, 0xFFD700, 1);
                this.selectionBorder.strokeRoundedRect(
                    panel.x - panelWidth / 2 - 2, 
                    panel.y - panelHeight / 2 - 2, 
                    panelWidth + 4, 
                    panelHeight + 4, 
                    16
                );
            } else {
                panel.setAlpha(0.6);
            }
        });
    }

    confirmSelection() {
        // Brief flash effect using camera
        this.cameras.main.flash(200, 255, 255, 255);
        
        // Wait for flash, then transition
        this.time.delayedCall(250, () => {
            // Reset global registry state for a fresh game
            this.registry.set('score', 0);
            this.registry.set('coins', 0);
            this.registry.set('lives', 3);
            
            const selectedKey = this.characterKeys[this.selectedIndex];
            this.scene.start('Level1_Gardens', { characterKey: selectedKey });
        });
    }
}
