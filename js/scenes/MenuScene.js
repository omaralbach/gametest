class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2 - 40, 'panel').setDisplaySize(520, 320).setAlpha(0.88);
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

    const startBtn = this.add.image(width / 2, height / 2 + 30, 'button_start').setInteractive({ useHandCursor: true });
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
}
