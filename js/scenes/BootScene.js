class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const panel = this.add.graphics();
    panel.fillStyle(0x0c0f1a, 0.9);
    panel.lineStyle(3, 0xffb347, 1);
    panel.fillRoundedRect(0, 0, 240, 120, 16);
    panel.strokeRoundedRect(0, 0, 240, 120, 16);
    panel.generateTexture('panel', 240, 120);
    panel.destroy();
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
