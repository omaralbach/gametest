class MandiAfandiDash {
  constructor() {
    this.game = null;
  }

  launch() {
    if (this.game) {
      return;
    }
    const config = {
      type: Phaser.AUTO,
      width: 960,
      height: 640,
      parent: 'game-container',
      backgroundColor: '#0f1017',
      pixelArt: true,
      scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
    };

    this.game = new Phaser.Game(config);
  }
}

window.mandiAfandiDash = new MandiAfandiDash();

const startBtn = document.getElementById('startBtn');
if (startBtn) {
  startBtn.addEventListener('click', () => window.mandiAfandiDash.launch());
}
