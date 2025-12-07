class OrderManager {
  constructor(scene) {
    this.scene = scene;
    this.menu = [
      { name: 'Chicken Mandi', icon: '🍗', frame: 0 },
      { name: 'Lamb Mandi', icon: '🍖', frame: 1 },
      { name: 'Kabsa', icon: '🍛', frame: 2 },
      { name: 'Kunafa', icon: '🍮', frame: 3 },
      { name: 'Drink', icon: '🥤', frame: 4 },
    ];
  }

  randomOrder() {
    const count = Phaser.Math.Between(1, 3);
    const picks = Phaser.Utils.Array.Shuffle([...this.menu]).slice(0, count);
    return picks;
  }
}
