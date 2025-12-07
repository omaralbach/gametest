class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    const panelKey = this.pickTexture(['panel_art_glow', 'panel_art', 'panel']);
    this.add.image(width / 2, height / 2 - 40, panelKey).setDisplaySize(520, 320).setAlpha(0.9);
    this.add.text(width / 2, height / 2 - 110, 'Mandi Afandi Dash', {
      fontFamily: 'sans-serif',
      fontSize: '32px',
      color: '#ffb347',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 60, 'Seat guests, take orders, deliver plates, clean tables.', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#f8f5ef',
      wordWrap: { width: 420 },
      align: 'center',
    }).setOrigin(0.5);

    const startBtnKey = this.pickTexture(['button_start_glow', 'button_start']);
    const startBtn = this.add.image(width / 2, height / 2 + 30, startBtnKey).setInteractive({ useHandCursor: true });
    const label = this.add.text(startBtn.x, startBtn.y, 'Start Shift', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#1a1c27',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    startBtn.on('pointerdown', () => {
      this.sound.play('click', { volume: 0.7 });
      this.scene.start('GameScene');
      this.scene.launch('UIScene');
    });
  }

  pickTexture(keys) {
    const found = keys.find((key) => this.textures.exists(key));
    return found || keys[keys.length - 1];
  }
}
