import { ShroomGoon, ShellCreeper, PiranhaPlant } from '../entities/Enemy.js';
import { QuestionBlock, Coin } from '../entities/PowerUp.js';
import Flagpole from '../entities/Flagpole.js';

/**
 * LevelBuilder — Utility to parse a 2D tile map and build physics groups and entities.
 *
 * Level data is an array of strings. Each character in the string represents one tile.
 * The theme parameter can be either a string ('gardens', 'ice', 'castle') or an object
 * with { ground, brick } texture key overrides.
 *
 * TILE CODES:
 *   '.' = empty space
 *   'G' = ground tile
 *   'B' = brick block
 *   '?' = question block (contains crown)
 *   'S' = question block containing star
 *   'C' = coin
 *   'o' = floating brick/platform block (same as brick but placed in the air)
 *   'P' = pipe (top section — static, 2-wide visual implied by texture)
 *   'E' = Shroom-Goon enemy spawn
 *   'K' = Shell-Creeper enemy spawn (or cage in Level 3 — determined by context)
 *   'F' = flagpole position
 *   'L' = lava tile (instant kill)
 *   'T' = thwomp position
 *   'M' = moving platform marker
 *
 * SWAP GUIDE: To replace procedural textures with custom sprites, change the texture
 * key strings below (e.g., 'ground-gardens' → 'my-custom-ground').
 */
export default class LevelBuilder {
    /**
     * Builds a level from a string-based tile map.
     *
     * @param {Phaser.Scene} scene  - The active Phaser scene.
     * @param {string[]}     levelData - Array of strings; each char = one tile.
     * @param {string|object} theme - Either a string ('gardens','ice','castle') or
     *                                an object { ground: textureKey, brick: textureKey }.
     * @param {number}       tileSize - Pixel size of each tile (default 24).
     * @returns {object} All generated groups and entities for the level.
     */
    static build(scene, levelData, theme, tileSize = 24) {
        // ── Resolve texture keys from theme ──────────────────────────────
        let groundTexture, brickTexture;
        if (typeof theme === 'string') {
            groundTexture = `ground-${theme}`;
            brickTexture  = theme === 'castle' ? 'brick-castle' : 'brick';
        } else {
            // theme is an object like { ground: 'ground-gardens', brick: 'brick' }
            groundTexture = theme.ground || 'ground-gardens';
            brickTexture  = theme.brick  || 'brick';
        }

        // Determine if this is a castle level (for lava/thwomp support)
        const isCastle = (typeof theme === 'string' && theme === 'castle') ||
                         (typeof theme === 'object' && theme.ground && theme.ground.includes('castle'));

        // ── Create physics groups ────────────────────────────────────────
        const result = {
            platforms:       scene.physics.add.staticGroup(), // All solid tiles the player stands on
            groundTiles:     scene.physics.add.staticGroup(), // Ground only (subset of platforms)
            bricks:          scene.physics.add.staticGroup(), // Brick blocks (subset of platforms)
            questionBlocks:  scene.physics.add.group({ immovable: true, allowGravity: false }), // ? blocks (dynamic for bouncing)
            coins:           scene.physics.add.group({ allowGravity: false, immovable: true }), // Floating coins
            enemies:         scene.physics.add.group(),       // Dynamic enemy sprites
            pipes:           scene.physics.add.staticGroup(), // Pipe segments
            flagpole:        null,                            // Flagpole instance
            lava:            isCastle ? scene.physics.add.staticGroup() : null,
            thwomps:         isCastle ? scene.physics.add.group({ allowGravity: false }) : null,
            movingPlatforms: scene.physics.add.group({ immovable: true, allowGravity: false }),
            cage:            null,                            // Mario's cage sprite
            levelWidth:      0,                               // Computed after parsing
            levelHeight:     levelData.length * tileSize
        };

        // Track the widest row to determine levelWidth
        let maxCols = 0;

        // ── Parse each row and column ────────────────────────────────────
        for (let row = 0; row < levelData.length; row++) {
            const rowStr = levelData[row];
            if (rowStr.length > maxCols) maxCols = rowStr.length;

            for (let col = 0; col < rowStr.length; col++) {
                const tile = rowStr[col];

                // Center position for a tile with 0.5 origin
                const x = col * tileSize + tileSize / 2;
                const y = row * tileSize + tileSize / 2;

                switch (tile) {
                    case '.':
                        // Empty space — skip
                        break;

                    // ── GROUND ────────────────────────────────────────────
                    case 'G': {
                        const ground = result.groundTiles.create(x, y, groundTexture);
                        ground.setDisplaySize(tileSize, tileSize);
                        ground.refreshBody(); // sync physics body to new display size
                        result.platforms.add(ground);
                        break;
                    }

                    // ── BRICK BLOCK ───────────────────────────────────────
                    case 'B': {
                        const brick = result.bricks.create(x, y, brickTexture);
                        brick.setDisplaySize(tileSize, tileSize);
                        brick.refreshBody();
                        result.platforms.add(brick);
                        break;
                    }

                    // ── FLOATING PLATFORM / BLOCK ('o') ───────────────────
                    // Uses the same brick texture but placed in the air
                    case 'o': {
                        const floatBlock = result.bricks.create(x, y, brickTexture);
                        floatBlock.setDisplaySize(tileSize, tileSize);
                        floatBlock.refreshBody();
                        result.platforms.add(floatBlock);
                        break;
                    }

                    // ── QUESTION BLOCK (crown) ────────────────────────────
                    case '?': {
                        const qBlock = new QuestionBlock(scene, x, y, { contents: 'crown' });
                        qBlock.setDisplaySize(tileSize, tileSize);
                        result.questionBlocks.add(qBlock);
                        break;
                    }

                    // ── STAR QUESTION BLOCK ───────────────────────────────
                    case 'S': {
                        const starBlock = new QuestionBlock(scene, x, y, { contents: 'star' });
                        starBlock.setDisplaySize(tileSize, tileSize);
                        result.questionBlocks.add(starBlock);
                        break;
                    }

                    // ── COIN ──────────────────────────────────────────────
                    case 'C': {
                        const coin = new Coin(scene, x, y);
                        result.coins.add(coin);
                        break;
                    }

                    // ── PIPE ──────────────────────────────────────────────
                    case 'P': {
                        const pipe = result.pipes.create(x, y, 'pipe-top');
                        pipe.setDisplaySize(tileSize, tileSize);
                        pipe.refreshBody();
                        result.platforms.add(pipe);
                        break;
                    }

                    // ── SHROOM-GOON ENEMY ─────────────────────────────────
                    case 'E': {
                        const goon = new ShroomGoon(scene, x, y);
                        result.enemies.add(goon);
                        break;
                    }

                    // ── SHELL-CREEPER ENEMY ────────────────────────────────
                    case 'K': {
                        // In castle levels, 'K' at the far right may represent the cage.
                        // We use a simple heuristic: if it's in the last 15% of columns, treat
                        // it as a cage. Otherwise, it's a ShellCreeper.
                        if (isCastle && col > rowStr.length * 0.85) {
                            result.cage = scene.add.sprite(x, y, 'cage');
                        } else {
                            const creeper = new ShellCreeper(scene, x, y);
                            result.enemies.add(creeper);
                        }
                        break;
                    }

                    // ── FLAGPOLE ──────────────────────────────────────────
                    case 'F': {
                        // Flagpole expects the base Y coordinate
                        result.flagpole = new Flagpole(scene, x, y + tileSize / 2);
                        break;
                    }

                    // ── LAVA (castle only) ─────────────────────────────────
                    case 'L': {
                        if (result.lava) {
                            const lava = result.lava.create(x, y, 'lava');
                            lava.setDisplaySize(tileSize, tileSize);
                            lava.refreshBody();
                        }
                        break;
                    }

                    // ── THWOMP (castle only) ──────────────────────────────
                    case 'T': {
                        if (result.thwomps) {
                            const thwomp = scene.physics.add.sprite(x, y, 'thwomp');
                            thwomp.body.immovable = true;
                            thwomp.body.allowGravity = false;
                            thwomp.body.moves = false;
                            thwomp.isFalling = false;
                            thwomp.originYPos = y;
                            result.thwomps.add(thwomp);
                        }
                        break;
                    }

                    // ── MOVING PLATFORM ───────────────────────────────────
                    case 'M': {
                        const mPlat = result.movingPlatforms.create(x, y, 'moving-platform');
                        mPlat.body.immovable = true;
                        mPlat.body.allowGravity = false;
                        mPlat.body.moves = false; // We tween the position manually

                        // Horizontal oscillation — 100px right, 2s cycle
                        scene.tweens.add({
                            targets: mPlat,
                            x: x + 100,
                            duration: 2000,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                        break;
                    }

                    default:
                        // Unknown tile code — silently skip
                        break;
                }
            }
        }

        // Compute final level width
        result.levelWidth = maxCols * tileSize;

        return result;
    }
}
