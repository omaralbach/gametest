class Table {
  constructor(scene, id, gridPos, projector) {
    this.scene = scene;
    this.id = id;
    this.gridPos = gridPos;
    this.state = 'empty';
    this.customer = null;
    this.order = [];
    this.orderTaken = false;
    const world = projector(gridPos.x, gridPos.y);
    this.sprite = scene.add.sprite(world.x, world.y, 'table_empty').setOrigin(0.5, 0.7);
    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.tableRef = this;
  }

  setState(state) {
    this.state = state;
    const key = {
      empty: 'table_empty',
      seated: 'table_occupied',
      eating: 'table_occupied',
      dirty: 'table_dirty',
    }[state] || 'table_empty';
    this.sprite.setTexture(key);
  }

  setCustomer(customer) {
    this.customer = customer;
  }

  clearCustomer() {
    this.customer = null;
    this.order = [];
    this.orderTaken = false;
    this.setState('empty');
  }

  showOrderBubble(orderIcons) {
    if (!this.customer) return;
    this.customer.setOrder(orderIcons);
  }
}
