class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.elapsed = 0;
    this.spawnInterval = 6000;
    this.minInterval = 2600;
    this.level = 1;
  }

  update(delta) {
    this.elapsed += delta;
    const interval = Math.max(this.minInterval, this.spawnInterval - this.level * 200);
    if (this.elapsed >= interval) {
      this.elapsed = 0;
      this.scene.spawnCustomer();
      this.level += 0.2;
    }
  }
}
