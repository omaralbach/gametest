class Waiter {
  constructor(scene, gridSize, startTile, projector) {
    this.scene = scene;
    this.gridSize = gridSize;
    this.projector = projector;
    const startPos = projector(startTile[0], startTile[1]);
    this.sprite = scene.physics.add.sprite(startPos.x, startPos.y, 'waiter');
    this.sprite.setDepth(1000);
    this.sprite.setOrigin(0.5, 0.8);
    this.speed = 160;
    this.path = [];
  }

  moveAlong(path) {
    this.path = path.slice(1);
  }

  update(delta) {
    if (!this.path.length) {
      this.sprite.setVelocity(0);
      return;
    }
    const [tx, ty] = this.path[0];
    const { x, y } = this.projector(tx, ty);
    const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, x, y);
    const vx = Math.cos(angle) * this.speed;
    const vy = Math.sin(angle) * this.speed;
    this.sprite.setVelocity(vx, vy);
    if (Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, x, y) < 4) {
      this.sprite.setPosition(x, y);
      this.path.shift();
      if (!this.path.length) {
        this.sprite.setVelocity(0);
      }
    }
    this.sprite.setDepth(this.sprite.y);
  }
}
