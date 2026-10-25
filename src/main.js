import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import Level1_Gardens from './scenes/Level1_Gardens.js';
import Level2_Ice from './scenes/Level2_Ice.js';
import Level3_Castle from './scenes/Level3_Castle.js';
import HUDScene from './scenes/HUDScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

const config = {
    type: Phaser.AUTO,
    width: 854,
    height: 480,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false,
            fps: 120 // Target 120hz physics for smoother movement
        }
    },
    fps: {
        target: 120,
        forceSetTimeOut: false
    },
    pixelArt: true,
    roundPixels: false, // Disabling roundPixels fixes camera stutter/jitter for a smoother experience
    resolution: window.devicePixelRatio || 2, // Use higher pixel density for a crisper display
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container'
    },
    scene: [
        BootScene,
        TitleScene,
        CharacterSelectScene,
        Level1_Gardens,
        Level2_Ice,
        Level3_Castle,
        HUDScene,
        GameOverScene,
        VictoryScene
    ]
};

const game = new Phaser.Game(config);

export default game;
