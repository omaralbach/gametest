class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.gameScene = this.scene.get('GameScene');
    const panel = this.add.image(0, 0, 'panel').setOrigin(0).setDisplaySize(this.scale.width, 70).setAlpha(0.8);
    panel.setScrollFactor(0);

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '18px', fontFamily: 'sans-serif' });
    this.servedText = this.add.text(200, 16, 'Served: 0', { fontSize: '18px', fontFamily: 'sans-serif' });
    this.waitingText = this.add.text(380, 16, 'Line: 0', { fontSize: '18px', fontFamily: 'sans-serif' });
    this.levelText = this.add.text(520, 16, 'Level: 1', { fontSize: '18px', fontFamily: 'sans-serif' });
    this.instructions = this.add.text(16, 44, 'Click guest → table to seat. Click table to take orders, deliver, clean.', {
      fontSize: '14px',
      fontFamily: 'sans-serif',
      color: '#e9e6ff',
    });

    this.gameScene.events.on('hud:update', this.updateHUD, this);
    this.updateHUD(this.gameScene.hudState());
  }

  updateHUD(state) {
    this.scoreText.setText(`Score: ${state.score}`);
    this.servedText.setText(`Served: ${state.served}`);
    this.waitingText.setText(`Line: ${state.waiting}`);
    this.levelText.setText(`Level: ${state.level}`);
  }
}
