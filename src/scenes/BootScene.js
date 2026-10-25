import Phaser from 'phaser';

/**
 * BootScene handles the generation of all programmatically drawn textures.
 * It serves as the primary asset generator before moving onto the TitleScene.
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        // Generate textures programmatically using Graphics
        const g = this.make.graphics();

        // ------------------------------------------------------------------------
        // PLAYER TEXTURES
        // ------------------------------------------------------------------------
        
        const drawChar = (g, w, h, dressColor, hairColor, jewelColor, hasCrown, isWhite) => {
            g.clear();
            const scale = w === 16 ? 1 : 1.5;
            const headSize = 8 * scale;
            const headX = (w - headSize) / 2;
            const headY = 4 * scale;
            
            // Hair / Crown base
            g.fillStyle(hairColor, 1);
            g.fillRect(headX - 1*scale, headY - 2*scale, headSize + 2*scale, headSize);
            
            // Crown
            if (hasCrown) {
                g.fillStyle(0xFFD700, 1);
                g.fillRect(headX, headY - 4*scale, headSize, 3*scale);
            }
            
            // Face (Skin) - Plane face, no eyes
            g.fillStyle(0xFFE0BD, 1);
            g.fillRect(headX, headY, headSize, headSize);
            
            // Dress
            g.fillStyle(isWhite ? 0xFFFFFF : dressColor, 1);
            g.beginPath();
            g.moveTo(w/2, headY + headSize); // Top center of dress
            g.lineTo(w - 2*scale, h); // Bottom right
            g.lineTo(2*scale, h); // Bottom left
            g.closePath();
            g.fillPath();
            
            // Jewelry on the dress (brooch/gem on chest)
            g.fillStyle(0xFFD700, 1); // Gold casing
            g.fillCircle(w/2, headY + headSize + 2*scale, 2*scale);
            g.fillStyle(jewelColor, 1); // Gem
            g.fillCircle(w/2, headY + headSize + 2*scale, 1*scale);

            // Hands (Gloves)
            g.fillStyle(0xFFFFFF, 1);
            g.fillRect(1*scale, headY + headSize + 1*scale, 3*scale, 3*scale);
            g.fillRect(w - 1*scale - 3*scale, headY + headSize + 1*scale, 3*scale, 3*scale);
        };

        // Peach (Pink dress, yellow hair, blue jewel)
        drawChar(g, 16, 24, 0xFF69B4, 0xFFD700, 0x0000FF, true, false);
        g.generateTexture('player-peach-small', 16, 24);
        drawChar(g, 24, 36, 0xFF69B4, 0xFFD700, 0x0000FF, true, false);
        g.generateTexture('player-peach-big', 24, 36);

        // Daisy (Orange dress, brown hair, green jewel)
        drawChar(g, 16, 24, 0xFFA500, 0x8B4513, 0x00FF00, true, false);
        g.generateTexture('player-daisy-small', 16, 24);
        drawChar(g, 24, 36, 0xFFA500, 0x8B4513, 0x00FF00, true, false);
        g.generateTexture('player-daisy-big', 24, 36);

        // Rosalina (Cyan dress, platinum hair, silver/star jewel)
        drawChar(g, 16, 24, 0x00FFFF, 0xE5E4E2, 0xFFFFFF, true, false);
        g.generateTexture('player-rosa-small', 16, 24);
        g.generateTexture('player-rosalina-small', 16, 24); // fallback alias
        drawChar(g, 24, 36, 0x00FFFF, 0xE5E4E2, 0xFFFFFF, true, false);
        g.generateTexture('player-rosa-big', 24, 36);
        g.generateTexture('player-rosalina-big', 24, 36); // fallback alias

        // Parasol State (White dress, matching character)
        drawChar(g, 16, 24, 0xFFFFFF, 0xFFD700, 0xFF0000, true, true);
        g.generateTexture('player-parasol-small', 16, 24);
        drawChar(g, 24, 36, 0xFFFFFF, 0xFFD700, 0xFF0000, true, true);
        g.generateTexture('player-parasol-big', 24, 36);

        // ------------------------------------------------------------------------
        // ENEMY TEXTURES
        // ------------------------------------------------------------------------

        // SWAP: Replace with this.load.image('shroom-goon', path) in preload for custom sprites
        // Shroom Goon: Brown square, darker feet, two white dot eyes
        g.clear();
        g.fillStyle(0x8B4513, 1);
        g.fillRect(0, 0, 20, 16);
        g.fillStyle(0x5C2D06, 1);
        g.fillRect(0, 16, 20, 4);
        g.fillStyle(0xFFFFFF, 1);
        g.fillRect(4, 4, 4, 4);
        g.fillRect(12, 4, 4, 4);
        g.generateTexture('shroom-goon', 20, 20);

        // SWAP: Replace with this.load.image('shell-creeper', path) in preload for custom sprites
        // Shell Creeper: Green rectangle with lighter belly
        g.clear();
        g.fillStyle(0x228B22, 1);
        g.fillRect(0, 0, 20, 28);
        g.fillStyle(0x32CD32, 1);
        g.fillRect(4, 8, 12, 20);
        g.fillStyle(0xFFFFFF, 1);
        g.fillRect(4, 2, 4, 4);
        g.fillRect(12, 2, 4, 4);
        g.generateTexture('shell-creeper', 20, 28);

        // SWAP: Replace with this.load.image('shell', path) in preload for custom sprites
        // Shell: Green dome
        g.clear();
        g.fillStyle(0x228B22, 1);
        g.fillRect(0, 4, 20, 12);
        g.fillStyle(0x32CD32, 1);
        g.fillRect(2, 2, 16, 4);
        g.generateTexture('shell', 20, 16);

        // SWAP: Replace with this.load.image('piranha-plant', path) in preload for custom sprites
        // Piranha Plant: Red circle head, white teeth, green stem
        g.clear();
        g.fillStyle(0x228B22, 1);
        g.fillRect(8, 12, 8, 12);
        g.fillStyle(0xFF0000, 1);
        g.fillCircle(12, 12, 12);
        g.fillStyle(0xFFFFFF, 1);
        g.fillRect(6, 6, 4, 4);
        g.fillRect(14, 6, 4, 4);
        g.fillRect(10, 12, 4, 4);
        g.generateTexture('piranha-plant', 24, 24);

        // SWAP: Replace with this.load.image('bowser', path) in preload for custom sprites
        // Bowser: Highly accurate 64x64 pixel art
        g.clear();
        // Shell (Green)
        g.fillStyle(0x006400, 1);
        g.fillRect(32, 16, 24, 40);
        g.beginPath(); g.arc(32, 36, 20, 0, Math.PI*2); g.fillPath();
        // Spikes on shell (White)
        g.fillStyle(0xFFFFFF, 1);
        g.fillTriangle(48, 12, 52, 4, 56, 12);
        g.fillTriangle(56, 24, 62, 20, 56, 28);
        g.fillTriangle(44, 48, 48, 56, 52, 48);
        // Body (Yellow)
        g.fillStyle(0xFFD700, 1);
        g.fillRect(16, 32, 24, 24);
        // Belly (Peach)
        g.fillStyle(0xFFCC99, 1);
        g.fillRect(16, 36, 8, 20);
        g.fillRect(24, 36, 4, 20); // Add stripes with lineStyle later
        // Head (Yellow)
        g.fillStyle(0xFFD700, 1);
        g.fillRect(8, 12, 24, 24);
        // Snout/Mouth (Peach)
        g.fillStyle(0xFFCC99, 1);
        g.fillRect(2, 20, 18, 16);
        // Teeth
        g.fillStyle(0xFFFFFF, 1);
        g.fillRect(2, 28, 4, 4);
        g.fillRect(10, 28, 4, 4);
        // Hair (Orange)
        g.fillStyle(0xFF4500, 1);
        g.fillTriangle(12, 12, 20, 2, 28, 12);
        // Horns (White)
        g.fillStyle(0xFFFFFF, 1);
        g.fillTriangle(24, 12, 28, 4, 32, 12);
        // Eyes (Red)
        g.fillStyle(0xFF0000, 1);
        g.fillRect(12, 16, 4, 4);
        // Arms
        g.fillStyle(0xFFD700, 1);
        g.fillRect(8, 36, 16, 8);
        // Claws
        g.fillStyle(0xFFFFFF, 1);
        g.fillRect(2, 36, 6, 2);
        g.fillRect(2, 40, 6, 2);
        // Feet
        g.fillStyle(0xFFD700, 1);
        g.fillRect(12, 56, 12, 8);
        g.fillRect(28, 56, 12, 8);
        // Spiked Collars (Black/White)
        g.fillStyle(0x000000, 1);
        g.fillRect(16, 32, 12, 4); // Neck
        g.fillRect(12, 34, 4, 12); // Arm
        g.generateTexture('bowser', 64, 64);

        // ------------------------------------------------------------------------
        // POWER-UP TEXTURES
        // ------------------------------------------------------------------------

        // SWAP: Replace with this.load.image('crown', path) in preload for custom sprites
        // Crown: Gold shape with black outline and jewels
        g.clear();
        g.fillStyle(0x000000, 1);
        g.fillPoints([{x:0,y:2},{x:4,y:8},{x:8,y:0},{x:12,y:8},{x:16,y:2},{x:16,y:14},{x:0,y:14}]);
        g.fillStyle(0xFFD700, 1); // Gold base
        g.fillPoints([{x:1,y:4},{x:4,y:9},{x:8,y:2},{x:12,y:9},{x:15,y:4},{x:15,y:13},{x:1,y:13}]);
        // Jewels
        g.fillStyle(0xFF0000, 1); // Center Red
        g.fillRect(7, 9, 2, 3);
        g.fillStyle(0x00BFFF, 1); // Blue Sides
        g.fillRect(3, 9, 2, 2);
        g.fillRect(11, 9, 2, 2);
        g.generateTexture('crown', 16, 16);

        // SWAP: Replace with this.load.image('parasol-item', path) in preload for custom sprites
        // Parasol: Pink/White umbrella top, brown handle, black outline
        g.clear();
        g.fillStyle(0x000000, 1); // Outline for canopy and handle
        g.beginPath(); g.arc(8, 8, 8, Math.PI, 0, false); g.fillPath();
        g.fillRect(7, 8, 2, 7);
        g.fillRect(6, 13, 3, 2); // hook bottom
        g.fillStyle(0x8B4513, 1); // Handle wood
        g.fillRect(7, 8, 1, 6);
        // Canopy Pink
        g.fillStyle(0xFF69B4, 1);
        g.beginPath(); g.arc(8, 8, 7, Math.PI, 0, false); g.fillPath();
        // Canopy White Stripe
        g.fillStyle(0xFFFFFF, 1);
        g.beginPath(); g.moveTo(8, 1); g.lineTo(10, 8); g.lineTo(6, 8); g.closePath(); g.fillPath();
        g.generateTexture('parasol-item', 16, 16);

        // SWAP: Replace with this.load.image('star-item', path) in preload for custom sprites
        // Star: Yellow 5-pointed star with black outline and cute eyes
        g.clear();
        g.fillStyle(0x000000, 1); // Outline
        const starOutline = [
            {x:10,y:0},{x:13,y:6},{x:20,y:7},{x:15,y:12},{x:16,y:19},
            {x:10,y:15},{x:4,y:19},{x:5,y:12},{x:0,y:7},{x:7,y:6}
        ];
        g.fillPoints(starOutline, true);
        g.fillStyle(0xFFD700, 1); // Yellow Fill
        const starInner = [
            {x:10,y:2},{x:12,y:7},{x:18,y:8},{x:14,y:12},{x:15,y:17},
            {x:10,y:14},{x:5,y:17},{x:6,y:12},{x:2,y:8},{x:8,y:7}
        ];
        g.fillPoints(starInner, true);
        g.fillStyle(0x000000, 1); // Eyes
        g.fillRect(7, 8, 2, 4);
        g.fillRect(11, 8, 2, 4);
        g.generateTexture('star-item', 20, 20);

        // SWAP: Replace with this.load.image('coin', path) in preload for custom sprites
        // Coin: Detailed 16x16 pixel art coin
        g.clear();
        g.fillStyle(0x000000, 1); // Outline
        g.fillRect(4, 0, 8, 16);
        g.fillRect(2, 2, 12, 12);
        g.fillStyle(0xFFD700, 1); // Gold body
        g.fillRect(5, 1, 6, 14);
        g.fillRect(3, 3, 10, 10);
        g.fillStyle(0xFFFFFF, 1); // Shine
        g.fillRect(5, 3, 2, 6);
        g.fillStyle(0xB8860B, 1); // Center dark slot
        g.fillRect(7, 4, 2, 8);
        g.generateTexture('coin', 16, 16);

        // SWAP: Replace with this.load.image('heart-projectile', path) in preload for custom sprites
        // Heart Projectile: Pink heart shape with outline
        g.clear();
        g.fillStyle(0x000000, 1);
        g.fillCircle(4, 4, 4);
        g.fillCircle(8, 4, 4);
        g.fillTriangle(0, 5, 12, 5, 6, 12);
        g.fillStyle(0xFF69B4, 1);
        g.fillCircle(4, 4, 3);
        g.fillCircle(8, 4, 3);
        g.fillTriangle(1, 5, 11, 5, 6, 11);
        g.generateTexture('heart-projectile', 12, 12);

        // ------------------------------------------------------------------------
        // BLOCK TEXTURES
        // ------------------------------------------------------------------------

        // SWAP: Replace with this.load.image('question-block', path) in preload for custom sprites
        // Question Block: Yellow square with brown border and '?' pattern
        g.clear();
        g.fillStyle(0xFFD700, 1);
        g.fillRect(0, 0, 24, 24);
        g.lineStyle(2, 0x8B4513, 1);
        g.strokeRect(1, 1, 22, 22);
        g.fillStyle(0x8B4513, 1);
        g.fillRect(8, 6, 8, 2);
        g.fillRect(14, 8, 2, 4);
        g.fillRect(10, 10, 4, 2);
        g.fillRect(10, 12, 2, 4);
        g.fillRect(10, 18, 2, 2);
        g.generateTexture('question-block', 24, 24);

        // SWAP: Replace with this.load.image('question-block-used', path) in preload for custom sprites
        // Used Block: Dark brown square
        g.clear();
        g.fillStyle(0x5C2D06, 1);
        g.fillRect(0, 0, 24, 24);
        g.lineStyle(2, 0x3E1E04, 1);
        g.strokeRect(1, 1, 22, 22);
        g.generateTexture('question-block-used', 24, 24);

        // SWAP: Replace with this.load.image('brick', path) in preload for custom sprites
        // Brick: Reddish-brown with mortar lines
        g.clear();
        g.fillStyle(0xCD853F, 1);
        g.fillRect(0, 0, 24, 24);
        g.fillStyle(0x8B4513, 1);
        g.fillRect(0, 11, 24, 2);
        g.fillRect(11, 0, 2, 11);
        g.fillRect(5, 13, 2, 11);
        g.fillRect(19, 13, 2, 11);
        g.generateTexture('brick', 24, 24);
        
        // Brick Gardens: Alias for regular brick
        g.generateTexture('brick-gardens', 24, 24);

        // SWAP: Replace with this.load.image('brick-castle', path) in preload for custom sprites
        // Castle Brick: Dark with gray mortar lines
        g.clear();
        g.fillStyle(0x1C1C1C, 1);
        g.fillRect(0, 0, 24, 24);
        g.fillStyle(0x444444, 1);
        g.fillRect(0, 11, 24, 2);
        g.fillRect(11, 0, 2, 11);
        g.fillRect(5, 13, 2, 11);
        g.fillRect(19, 13, 2, 11);
        g.generateTexture('brick-castle', 24, 24);

        // ------------------------------------------------------------------------
        // ENVIRONMENT TEXTURES
        // ------------------------------------------------------------------------

        // SWAP: Replace with this.load.image('ground-gardens', path) in preload for custom sprites
        // Gardens Ground: Green top, brown bottom
        g.clear();
        g.fillStyle(0x32CD32, 1);
        g.fillRect(0, 0, 24, 8);
        g.fillStyle(0x8B4513, 1);
        g.fillRect(0, 8, 24, 16);
        g.generateTexture('ground-gardens', 24, 24);

        // SWAP: Replace with this.load.image('ground-ice', path) in preload for custom sprites
        // Ice Ground: Ice blue top, white-blue bottom
        g.clear();
        g.fillStyle(0xE0FFFF, 1);
        g.fillRect(0, 0, 24, 8);
        g.fillStyle(0xFFFFFF, 0.9);
        g.fillRect(0, 8, 24, 16);
        g.generateTexture('ground-ice', 24, 24);

        // SWAP: Replace with this.load.image('ground-castle', path) in preload for custom sprites
        // Castle Ground: Dark gray top, near-black bottom, orange glow
        g.clear();
        g.fillStyle(0x333333, 1);
        g.fillRect(0, 0, 24, 8);
        g.fillStyle(0x1C1C1C, 1);
        g.fillRect(0, 8, 24, 16);
        g.fillStyle(0xFF4500, 0.5);
        g.fillRect(0, 8, 24, 2);
        g.generateTexture('ground-castle', 24, 24);

        // SWAP: Replace with this.load.image('pipe-top', path) in preload for custom sprites
        // Pipe Top: Dark green rectangle
        g.clear();
        g.fillStyle(0x006400, 1);
        g.fillRect(0, 0, 32, 24);
        g.fillStyle(0x228B22, 1);
        g.fillRect(4, 0, 8, 24);
        g.generateTexture('pipe-top', 32, 24);

        // SWAP: Replace with this.load.image('pipe-body', path) in preload for custom sprites
        // Pipe Body: Dark green narrower rectangle
        g.clear();
        g.fillStyle(0x006400, 1);
        g.fillRect(2, 0, 28, 24);
        g.fillStyle(0x228B22, 1);
        g.fillRect(6, 0, 6, 24);
        g.generateTexture('pipe-body', 32, 24);

        // SWAP: Replace with this.load.image('lava', path) in preload for custom sprites
        // Lava: Orange-red with yellow highlights
        g.clear();
        g.fillStyle(0xFF4500, 1);
        g.fillRect(0, 4, 24, 20);
        g.fillStyle(0xFFFF00, 1);
        g.fillTriangle(0, 8, 6, 4, 12, 8);
        g.fillTriangle(12, 8, 18, 4, 24, 8);
        g.generateTexture('lava', 24, 24);

        // SWAP: Replace with this.load.image('thwomp', path) in preload for custom sprites
        // Thwomp: Dark gray with angry face
        g.clear();
        g.fillStyle(0x696969, 1);
        g.fillRect(0, 0, 32, 32);
        g.fillStyle(0xFFFFFF, 1);
        g.fillTriangle(6, 12, 14, 12, 10, 18);
        g.fillTriangle(26, 12, 18, 12, 22, 18);
        g.generateTexture('thwomp', 32, 32);

        // SWAP: Replace with this.load.image('flagpole-pole', path) in preload for custom sprites
        // Flagpole pole: Gray thin rectangle
        g.clear();
        g.fillStyle(0x808080, 1);
        g.fillRect(0, 0, 8, 240);
        g.generateTexture('flagpole-pole', 8, 240);

        // SWAP: Replace with this.load.image('flagpole-flag', path) in preload for custom sprites
        // Flagpole flag: Pink triangle
        g.clear();
        g.fillStyle(0xFFB6C1, 1);
        g.fillTriangle(0, 0, 24, 8, 0, 16);
        g.generateTexture('flagpole-flag', 24, 16);

        // SWAP: Replace with this.load.image('cage', path) in preload for custom sprites
        // Cage: Grid pattern with solid top/bottom and lock
        g.clear();
        // Top plate
        g.fillStyle(0x404040, 1);
        g.fillRect(0, 0, 48, 6);
        // Bottom plate
        g.fillRect(0, 42, 48, 6);
        // Bars
        g.lineStyle(4, 0x696969, 1);
        g.beginPath();
        for(let i=6; i<=42; i+=12) {
            g.moveTo(i, 6); g.lineTo(i, 42); // vertical
        }
        g.strokePath();
        // Horizontal crossbars
        g.fillStyle(0x696969, 1);
        g.fillRect(0, 16, 48, 4);
        g.fillRect(0, 32, 48, 4);
        // Lock
        g.fillStyle(0xFFD700, 1); // Gold
        g.fillRect(20, 24, 8, 8);
        g.fillStyle(0x000000, 1);
        g.fillRect(23, 26, 2, 4);
        g.generateTexture('cage', 48, 48);

        // Mario Prisoner
        g.clear();
        // Base / shoes
        g.fillStyle(0x8B4513, 1); // brown
        g.fillRect(2, 28, 8, 4);
        g.fillRect(14, 28, 8, 4);
        // Overalls
        g.fillStyle(0x0000FF, 1); // blue
        g.fillRect(6, 16, 12, 12);
        // Shirt
        g.fillStyle(0xFF0000, 1); // red
        g.fillRect(4, 12, 16, 8);
        // Buttons
        g.fillStyle(0xFFFF00, 1); // yellow
        g.fillRect(6, 16, 2, 4);
        g.fillRect(16, 16, 2, 4);
        // Hands
        g.fillStyle(0xFFFFFF, 1); // white gloves
        g.fillRect(0, 18, 6, 6);
        g.fillRect(18, 18, 6, 6);
        // Face / Skin
        g.fillStyle(0xFFCC99, 1); // peach
        g.fillRect(6, 4, 12, 8);
        // Hair / Sideburns
        g.fillStyle(0x5C2D06, 1); // dark brown
        g.fillRect(4, 4, 4, 6);
        // Nose
        g.fillStyle(0xFFCC99, 1);
        g.fillRect(16, 6, 6, 4);
        // Mustache
        g.fillStyle(0x000000, 1); // black
        g.fillRect(14, 10, 8, 2);
        // Eye
        g.fillRect(14, 4, 2, 4);
        // Hat
        g.fillStyle(0xFF0000, 1);
        g.fillRect(4, 0, 14, 4);
        g.fillRect(10, 2, 12, 2); // Hat brim
        g.generateTexture('mario-prisoner', 24, 32);

        // SWAP: Replace with this.load.image('moving-platform', path) in preload for custom sprites
        // Moving Platform: Brown with surface details
        g.clear();
        g.fillStyle(0xCD853F, 1);
        g.fillRect(0, 0, 64, 24);
        g.fillStyle(0x8B4513, 1);
        g.fillRect(0, 0, 64, 2);
        g.fillRect(0, 10, 64, 2);
        g.fillRect(0, 20, 64, 2);
        g.generateTexture('moving-platform', 64, 24);

        // Castle End Goal: Brown with towers and a black door
        g.clear();
        // Base
        g.fillStyle(0xCD853F, 1);
        g.fillRect(16, 40, 64, 56);
        // Towers
        g.fillRect(0, 8, 24, 88);
        g.fillRect(72, 8, 24, 88);
        // Battlements (left tower)
        g.fillRect(0, 0, 6, 8);
        g.fillRect(9, 0, 6, 8);
        g.fillRect(18, 0, 6, 8);
        // Battlements (right tower)
        g.fillRect(72, 0, 6, 8);
        g.fillRect(81, 0, 6, 8);
        g.fillRect(90, 0, 6, 8);
        // Door
        g.fillStyle(0x000000, 1);
        g.fillRect(36, 64, 24, 32);
        g.beginPath();
        g.arc(48, 64, 12, Math.PI, 0, false);
        g.fillPath();
        g.generateTexture('castle', 96, 96);

        // ------------------------------------------------------------------------
        // BACKGROUND TEXTURES
        // ------------------------------------------------------------------------

        // SWAP: Replace with this.load.image('cloud', path) in preload for custom sprites
        // Cloud: White overlapping circles
        g.clear();
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(12, 16, 8);
        g.fillCircle(24, 12, 12);
        g.fillCircle(36, 16, 8);
        g.fillRect(12, 16, 24, 8);
        g.generateTexture('cloud', 48, 24);

        // SWAP: Replace with this.load.image('star-bg', path) in preload for custom sprites
        // Star Background: Small white dot
        g.clear();
        g.fillStyle(0xFFFFFF, 1);
        g.fillRect(1, 1, 2, 2);
        g.generateTexture('star-bg', 4, 4);

        // SWAP: Replace with this.load.image('snowflake', path) in preload for custom sprites
        // Snowflake: Small cross shape
        g.clear();
        g.fillStyle(0xFFFFFF, 1);
        g.fillRect(2, 0, 2, 6);
        g.fillRect(0, 2, 6, 2);
        g.generateTexture('snowflake', 6, 6);

        // ------------------------------------------------------------------------
        // UI TEXTURES
        // ------------------------------------------------------------------------

        // SWAP: Replace with this.load.image('coin-icon', path) in preload for custom sprites
        // Coin Icon: Small gold coin
        g.clear();
        g.fillStyle(0x000000, 1);
        g.fillRect(3, 0, 6, 12);
        g.fillRect(1, 2, 10, 8);
        g.fillStyle(0xFFD700, 1);
        g.fillRect(4, 1, 4, 10);
        g.fillRect(2, 3, 8, 6);
        g.fillStyle(0xFFFFFF, 1);
        g.fillRect(4, 3, 2, 4);
        g.generateTexture('coin-icon', 12, 12);

        // Cleanup
        g.destroy();

        // Start the title scene
        this.scene.start('TitleScene');
    }
}
