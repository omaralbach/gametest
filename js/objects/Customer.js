class Customer {
  constructor(scene, id, spriteKey, position, patience = 100) {
    this.scene = scene;
    this.id = id;
    this.sprite = scene.add.sprite(position.x, position.y, spriteKey).setOrigin(0.5, 0.8);
    this.sprite.setDepth(position.y);
    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.customerRef = this;
    this.patience = patience;
    this.state = 'waiting';
    this.order = [];
    this.table = null;
    this.bubble = null;
  }

  setState(state) {
    this.state = state;
  }

  setTable(table) {
    this.table = table;
  }

  setOrder(order) {
    this.order = order;
    this.showOrderBubble();
  }

  showOrderBubble() {
    if (this.bubble) {
      this.bubble.destroy();
    }
    const text = this.order.map((o) => o.icon).join(' ');
    this.bubble = this.scene.add.text(this.sprite.x, this.sprite.y - 60, text, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: { x: 6, y: 4 },
    }).setOrigin(0.5);
    this.bubble.setDepth(this.sprite.depth + 1);
  }

  hideOrderBubble() {
    if (this.bubble) {
      this.bubble.destroy();
      this.bubble = null;
    }
  }

  updatePatience(delta) {
    if (['waiting', 'seated', 'ordering'].includes(this.state)) {
      this.patience -= delta * 0.01;
      if (this.patience <= 0) {
        this.patience = 0;
        this.state = 'leaving';
      }
    }
  }

  destroy() {
    this.hideOrderBubble();
    this.sprite.destroy();
  }
}
