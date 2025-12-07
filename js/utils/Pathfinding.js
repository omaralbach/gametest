class Pathfinding {
  constructor(gridWidth, gridHeight, blocked = new Set()) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.blocked = blocked;
  }

  key(x, y) {
    return `${x},${y}`;
  }

  isWalkable(x, y) {
    const within = x >= 0 && y >= 0 && x < this.gridWidth && y < this.gridHeight;
    return within && !this.blocked.has(this.key(x, y));
  }

  neighbors(x, y) {
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    return dirs
      .map(([dx, dy]) => [x + dx, y + dy])
      .filter(([nx, ny]) => this.isWalkable(nx, ny));
  }

  findPath(start, goal) {
    const [sx, sy] = start;
    const [gx, gy] = goal;
    if (!this.isWalkable(gx, gy)) return [];
    const queue = [[sx, sy]];
    const cameFrom = new Map();
    cameFrom.set(this.key(sx, sy), null);

    while (queue.length) {
      const [cx, cy] = queue.shift();
      if (cx === gx && cy === gy) break;
      for (const [nx, ny] of this.neighbors(cx, cy)) {
        const k = this.key(nx, ny);
        if (!cameFrom.has(k)) {
          cameFrom.set(k, [cx, cy]);
          queue.push([nx, ny]);
        }
      }
    }

    const path = [];
    let current = [gx, gy];
    while (current) {
      path.unshift(current);
      const prev = cameFrom.get(this.key(current[0], current[1]));
      current = prev;
    }
    if (path.length && (path[0][0] !== sx || path[0][1] !== sy)) {
      return [];
    }
    return path;
  }
}
