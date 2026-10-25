# Super Peach Bros

**[🎮 Play the game online here!](https://afyas.github.io/Super-Peach-Bros-2D-Mario-Platformer/)**
Super Peach Bros is a reverse-platformer built in JavaScript where players take on the role of Princess Peach, Daisy, or Rosalina on a mission to rescue Mario from Bowser. 

The game is designed to be played directly in a web browser and was built using the Phaser 3 game engine. Rather than relying on external image files, every sprite in the game is procedurally generated at runtime using canvas graphics.

## Technologies Used

* HTML5 Canvas
* JavaScript (ES6+)
* Phaser 3 Framework
* Vite (Build tool)

## Core Mechanics

The game features three distinct levels: Gardens, Ice, and Castle. Players must navigate obstacles, defeat enemies, and reach the flagpole or defeat the boss before the 300-second timer expires.

### Playable Characters
* **Peach**: Can float temporarily while falling by holding the jump button.
* **Daisy**: Can perform a double jump in mid-air.
* **Rosalina**: Can execute a Star Spin attack in mid-air to defeat enemies without stomping on them.

### Power-ups
* **Crown**: Transforms the player into their "Big" state, allowing them to break brick blocks and take an extra hit. Collecting a second Crown turns the player "Huge".
* **Parasol**: Grants the ability to shoot projectile attacks using the X key.
* **Super Star**: Grants 10 seconds of complete invincibility, allowing the player to defeat any enemy on contact.

### Enemies and Hazards
* **Shroom Goons**: Basic enemies defeated by a single stomp.
* **Shell Creepers**: Stomping them turns them into a shell. Walking into the shell kicks it, turning it into a projectile that can defeat other enemies.
* **Piranha Plants**: Hide in pipes and move vertically. They cannot be stomped.
* **Thwomps**: Wait near the ceiling and slam down when the player passes underneath.
* **Bowser**: The final boss guarding Mario in the Castle. Touching Bowser results in an instant Game Over.
* **Lava or Pits**: Falling out of bounds or into lava results in an instant life loss.

## Controls

* **Left / Right Arrows or A / D**: Move horizontally
* **Up Arrow or Spacebar**: Jump (Hold for higher jumps)
* **Down Arrow or S**: Crouch / Enter Warp Pipes
* **Shift**: Hold to sprint
* **X**: Shoot projectiles (requires Parasol) or perform Star Spin (requires Rosalina)
* **P or ESC**: Pause the game
* **E**: Toggle Easy Mode on the title screen (grants unlimited lives)
* **I**: View instructions overlay on the title screen

## How the Game Was Built

This project is built using Phaser 3, a popular framework for making 2D web games. Instead of keeping all the code in one giant file, the game is split up into different "Scenes" (like the title screen, the levels, and the user interface). Here is a breakdown of how the most important parts of the code work.

### Drawing Graphics with Code (BootScene.js)
Most games load images from files, but this game draws everything from scratch using code. In BootScene.js, I used Phaser's Graphics tool to draw rectangles, circles, and triangles with specific colors. Once a character or block is drawn, the game saves it as a texture so it can be used anywhere in the game.

### Building Levels (LevelBuilder.js)
Instead of using a level editor program to place blocks one by one, the levels are written as a grid of letters and symbols in the code. For example, 'G' stands for ground, '?' stands for a question block, and 'E' stands for an enemy. LevelBuilder.js reads this grid line by line and places the correct objects in the game world based on those letters.

### Player Movement (Player.js)
The Player.js file controls how the characters move and jump. To make the platforming feel smooth and responsive, I added a few special features:
* **Variable Jump Height**: If you let go of the jump key early, the game cuts your upward speed so you don't jump as high.
* **Coyote Time**: A hidden timer that lets you jump for a split second even after you walk off the edge of a cliff.
* **Jump Buffering**: If you press the jump key slightly before hitting the ground, the game remembers it and makes you jump the exact moment you land.

### Collisions and Hitting Enemies
The code for handling collisions is inside each level file. 
* When the player hits a solid block, the hitSolid function checks if they hit it from below. If the player has a power-up, it breaks the brick. It also checks if there are any enemies walking on top of the block so it can bump them off.
* The handleEnemyCollision function figures out what happens when you touch an enemy. If you are falling downwards, it counts as a stomp and bounces you back up. If you touch them from the side, you take damage.

### The Score and Timer (HUDScene.js)
HUDScene.js handles the score, coins, lives, and the timer shown at the top of the screen. Instead of redrawing this text in every single level, the HUD runs as a separate layer over the entire game. When you collect a coin or finish a level, the game sends a signal to the HUD so it can update the numbers without interrupting the gameplay.
