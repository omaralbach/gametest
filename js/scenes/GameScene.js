class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.tileWidth = 72;
    this.tileHeight = 36;
    this.gridWidth = 12;
    this.gridHeight = 10;
    this.origin = { x: this.scale.width / 2, y: 140 };
    this.blocked = new Set();
    this.waitingLine = [];
    this.customers = [];
    this.tables = [];
    this.tickets = new Map();
    this.orderManager = new OrderManager(this);
    this.levelManager = new LevelManager(this);
    this.score = 0;
    this.served = 0;
    this.selectedCustomer = null;
    this.selectedTable = null;

    this.kitchenTile = { x: 9, y: 2 };
    this.createWorld();
    this.pathfinder = new Pathfinding(this.gridWidth, this.gridHeight, this.blocked);
    this.waiterTile = { x: this.kitchenTile.x, y: this.kitchenTile.y + 1 };
    this.waiter = new Waiter(this, this.tileWidth, [this.waiterTile.x, this.waiterTile.y], this.toIso.bind(this));

    this.input.on('gameobjectdown', this.handleObjectClick, this);
    this.time.addEvent({ delay: 1200, callback: () => this.spawnCustomer(), loop: false });

    this.sound.play('bgm', { loop: true, volume: 0.25 });
  }

  toIso(gx, gy) {
    return {
      x: this.origin.x + (gx - gy) * (this.tileWidth / 2),
      y: this.origin.y + (gx + gy) * (this.tileHeight / 2),
    };
  }

  createWorld() {
    // floor grid
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        const pos = this.toIso(x, y);
        const floor = this.add.image(pos.x, pos.y, 'floor').setDisplaySize(this.tileWidth, this.tileHeight);
        floor.setDepth(pos.y);
        if (y === 0) {
          const wall = this.add.image(pos.x, pos.y - this.tileHeight / 1.5, 'wall').setDisplaySize(this.tileWidth, this.tileHeight);
          wall.setDepth(pos.y - 10);
        }
      }
    }

    // kitchen counter obstacle
    const kitchenPos = this.toIso(this.kitchenTile.x, this.kitchenTile.y);
    const counter = this.add.image(kitchenPos.x, kitchenPos.y - 8, 'kitchen').setDisplaySize(this.tileWidth * 1.4, this.tileHeight * 1.5);
    counter.setDepth(kitchenPos.y + 10);
    this.blocked.add(`${this.kitchenTile.x},${this.kitchenTile.y}`);

    const tableCoords = [
      { x: 3, y: 3 },
      { x: 5, y: 3 },
      { x: 7, y: 3 },
      { x: 4, y: 6 },
      { x: 6, y: 6 },
      { x: 8, y: 6 },
    ];
    tableCoords.forEach((coord, idx) => {
      const table = new Table(this, idx, coord, this.toIso.bind(this));
      table.sprite.setDepth(this.toIso(coord.x, coord.y).y + 2);
      this.tables.push(table);
    });

    // waiting line tiles (walkable but reserved spots)
    this.waitingSlots = [
      { x: 1, y: 8 },
      { x: 1, y: 7 },
      { x: 1, y: 6 },
      { x: 1, y: 5 },
    ];
  }

  walkToTile(target, onArrive) {
    const path = this.pathfinder.findPath([this.waiterTile.x, this.waiterTile.y], [target.x, target.y]);
    if (path.length) {
      this.waiter.moveAlong(path);
      const duration = Math.max(260, path.length * 160);
      this.time.delayedCall(duration, () => {
        this.waiterTile = { x: target.x, y: target.y };
        if (onArrive) onArrive();
      });
    } else if (onArrive) {
      onArrive();
    }
  }

  spawnCustomer() {
    const slot = this.waitingSlots.find((s) => !this.waitingLine.find((c) => c.slot === s));
    if (!slot) return;
    const id = Phaser.Math.Between(1000, 9999);
    const spriteKey = Phaser.Math.Between(0, 1) === 0 ? 'customer1' : 'customer2';
    const world = this.toIso(slot.x, slot.y);
    const customer = new Customer(this, id, spriteKey, { x: world.x, y: world.y }, Phaser.Math.Between(85, 120));
    customer.slot = slot;
    this.waitingLine.push(customer);
    this.customers.push(customer);
    this.events.emit('hud:update', this.hudState());
  }

  handleObjectClick(pointer, gameObject) {
    if (gameObject.tableRef) {
      this.onTableClick(gameObject.tableRef);
    } else if (gameObject.customerRef) {
      this.onCustomerClick(gameObject.customerRef);
    }
  }

  onCustomerClick(customer) {
    if (customer.state !== 'waiting') return;
    this.selectedCustomer = customer;
    this.customers.forEach((c) => c.sprite.clearTint());
    customer.sprite.setTint(0xffb347);
  }

  onTableClick(table) {
    if (this.selectedCustomer && table.state === 'empty') {
      this.seatCustomer(table, this.selectedCustomer);
      return;
    }

    if (table.customer && table.customer.state === 'ordering' && !table.orderTaken) {
      this.takeOrder(table);
      return;
    }

    if (table.orderReady) {
      this.deliverOrder(table);
      return;
    }

    if (table.state === 'dirty') {
      this.cleanTable(table);
    }
  }

  seatCustomer(table, customer) {
    customer.sprite.clearTint();
    this.selectedCustomer = null;
    table.setCustomer(customer);
    table.setState('seated');
    customer.setState('seated');
    this.waitingLine = this.waitingLine.filter((c) => c !== customer);
    const tablePos = this.toIso(table.gridPos.x, table.gridPos.y);
    this.walkToTile(table.gridPos, () => {
      this.tweens.add({
        targets: customer.sprite,
        x: tablePos.x,
        y: tablePos.y,
        duration: 700,
        onComplete: () => {
          customer.sprite.setDepth(tablePos.y + 6);
          this.startOrdering(table, customer);
        },
      });
    });
    this.events.emit('hud:update', this.hudState());
  }

  startOrdering(table, customer) {
    this.time.delayedCall(900, () => {
      if (customer.state !== 'seated') return;
      customer.setState('ordering');
      const order = this.orderManager.randomOrder();
      table.order = order;
      table.showOrderBubble(order);
      this.events.emit('hud:update', this.hudState());
    });
  }

  takeOrder(table) {
    table.orderTaken = true;
    table.customer.setState('waiting_food');
    const ticketText = `${table.order.map((o) => o.icon).join(' ')} (Table ${table.id + 1})`;
    const ticket = this.add.text(this.scale.width - 220, 60 + this.tickets.size * 26, ticketText, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffb347',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: { x: 6, y: 4 },
    });
    this.sound.play('click', { volume: 0.7 });
    this.tickets.set(table, ticket);
    this.walkToTile(this.kitchenTile, () => {
      this.time.delayedCall(1200, () => {
        table.orderReady = true;
        ticket.setColor('#9ef0b3');
        ticket.setText(`Ready ▶ ${ticketText}`);
      });
    });
  }

  deliverOrder(table) {
    table.orderReady = false;
    this.walkToTile(table.gridPos, () => {
      table.customer.setState('eating');
      this.served += 1;
      this.score += 40 + table.order.length * 15;
      if (this.tickets.has(table)) {
        this.tickets.get(table).destroy();
        this.tickets.delete(table);
      }
      table.customer.hideOrderBubble();
      this.sound.play('serve', { volume: 0.8 });
      this.events.emit('hud:update', this.hudState());
      this.time.delayedCall(2500, () => {
        table.setState('dirty');
        table.customer.setState('done');
      });
    });
  }

  cleanTable(table) {
    this.walkToTile(table.gridPos, () => {
      table.setState('empty');
      if (table.customer) {
        table.customer.destroy();
        this.customers = this.customers.filter((c) => c !== table.customer);
      }
      table.clearCustomer();
      this.score += 10;
      this.sound.play('success', { volume: 0.7 });
      this.events.emit('hud:update', this.hudState());
    });
  }

  hudState() {
    return {
      score: this.score,
      served: this.served,
      waiting: this.waitingLine.length,
      level: Math.round(this.levelManager.level),
    };
  }

  update(time, delta) {
    this.waiter.update(delta);
    this.levelManager.update(delta);
    this.customers.forEach((c) => c.updatePatience(delta));
    this.customers
      .filter((c) => c.state === 'leaving')
      .forEach((c) => {
        c.destroy();
        this.customers = this.customers.filter((cust) => cust !== c);
        this.waitingLine = this.waitingLine.filter((cust) => cust !== c);
        this.score = Math.max(0, this.score - 20);
        this.events.emit('hud:update', this.hudState());
      });
  }
}
