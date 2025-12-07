const Game = {
  customers: [],
  tray: [],
  nextId: 1,
  score: 0,
  startTime: Date.now(),
  spawnInterval: 4000,
  minSpawn: 1200,
  selectedCustomerId: null,
  menuItems: [
    { icon: '🍗', name: 'Chicken Mandi' },
    { icon: '🍖', name: 'Lamb Mandi' },
    { icon: '🍛', name: 'Kabsa' },
    { icon: '🍮', name: 'Kunafa' },
    { icon: '🥤', name: 'Drink' },
  ],
};

function init() {
  renderMenuButtons();
  renderUI();
  scheduleSpawn();
  setInterval(updateTimers, 500);
  logEvent('The rush begins! Seat hungry guests quickly.');
}

function scheduleSpawn() {
  setTimeout(() => {
    spawnCustomer();
    Game.spawnInterval = Math.max(Game.minSpawn, Game.spawnInterval * 0.97);
    scheduleSpawn();
  }, Game.spawnInterval);
}

function spawnCustomer() {
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const order = Array.from({ length: itemCount }, () => randomMenuItem());
  const remainingTime = 14000 + Math.random() * 10000; // 14-24 seconds
  const customer = {
    id: Game.nextId++,
    order,
    remainingTime,
    maxTime: remainingTime,
    mood: '😃',
  };
  Game.customers.push(customer);
  logEvent(`Customer ${customer.id} sits and orders ${order.map((o) => o.icon).join(' ')}`);
  renderUI();
}

function randomMenuItem() {
  const idx = Math.floor(Math.random() * Game.menuItems.length);
  return Game.menuItems[idx];
}

function updateTimers() {
  const now = Date.now();
  Game.elapsed = Math.floor((now - Game.startTime) / 1000);
  Game.customers.forEach((customer) => {
    customer.remainingTime -= 500;
    const pct = customer.remainingTime / customer.maxTime;
    if (pct < 0.25) {
      customer.mood = '😡';
    } else if (pct < 0.55) {
      customer.mood = '😐';
    } else {
      customer.mood = '😃';
    }
  });

  const expired = Game.customers.filter((c) => c.remainingTime <= 0);
  expired.forEach((c) => handleDeparture(c));
  Game.customers = Game.customers.filter((c) => c.remainingTime > 0);
  renderUI();
}

function handleDeparture(customer) {
  Game.score -= 8;
  logEvent(`Customer ${customer.id} storms out! Order lost. (-8)`, 'warning');
  if (Game.selectedCustomerId === customer.id) {
    Game.selectedCustomerId = null;
  }
}

function renderMenuButtons() {
  const menuButtons = document.getElementById('menuButtons');
  menuButtons.innerHTML = '';
  Game.menuItems.forEach((item) => {
    const btn = document.createElement('button');
    btn.textContent = `${item.icon} ${item.name}`;
    btn.addEventListener('click', () => handlePrepareItem(item));
    menuButtons.appendChild(btn);
  });
}

function handlePrepareItem(item) {
  Game.tray.push(item);
  if (Game.tray.length > 5) {
    Game.tray.shift();
  }
  logEvent(`Prepared ${item.icon} ${item.name}`);
  renderUI();
}

function handleServe() {
  const customer = Game.customers.find((c) => c.id === Game.selectedCustomerId);
  if (!customer) {
    logEvent('Select a customer before serving.', 'warning');
    return;
  }
  if (Game.tray.length === 0) {
    logEvent('Tray is empty. Prepare something first!', 'warning');
    return;
  }

  const correct = compareOrders(customer.order, Game.tray);
  if (customer.remainingTime <= 0) {
    logEvent(`Too late! Customer ${customer.id} already left.`, 'warning');
  }

  if (correct && customer.remainingTime > 0) {
    const tip = Math.floor(Math.random() * 4) + 2;
    Game.score += 12 + tip;
    logEvent(`Served Customer ${customer.id} perfectly! (+12, tip +${tip} 💵)`, 'tip');
    removeCustomer(customer.id);
  } else {
    Game.score -= 6;
    logEvent(`Wrong order for Customer ${customer.id}. (-6)`, 'warning');
  }

  Game.tray = [];
  renderUI();
}

function compareOrders(expected, prepared) {
  if (expected.length !== prepared.length) return false;
  const sortIcons = (arr) => arr.map((i) => i.icon).sort();
  const a = sortIcons(expected);
  const b = sortIcons(prepared);
  return a.every((val, idx) => val === b[idx]);
}

function removeCustomer(id) {
  Game.customers = Game.customers.filter((c) => c.id !== id);
  if (Game.selectedCustomerId === id) {
    Game.selectedCustomerId = null;
  }
}

function renderUI() {
  document.getElementById('score').textContent = `Score: ${Game.score}`;
  document.getElementById('round').textContent = `Rush Time: ${Game.elapsed || 0}s`;
  renderCustomers();
  renderTray();
}

function renderCustomers() {
  const list = document.getElementById('customers');
  list.innerHTML = '';
  if (Game.customers.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = 'Waiting for guests...';
    empty.style.color = '#6b5643';
    list.appendChild(empty);
    return;
  }

  Game.customers.forEach((customer) => {
    const row = document.createElement('div');
    row.className = 'customer';
    if (customer.id === Game.selectedCustomerId) {
      row.classList.add('selected');
    }
    row.addEventListener('click', () => {
      Game.selectedCustomerId = customer.id;
      renderUI();
    });

    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.textContent = '🧑‍🍳';

    const order = document.createElement('div');
    order.className = 'order-items';
    order.textContent = customer.order.map((item) => item.icon).join(' ');

    const timer = document.createElement('div');
    timer.className = 'timer';
    const seconds = Math.max(0, Math.ceil(customer.remainingTime / 1000));
    timer.textContent = `${seconds}s ⏱`;

    const bar = document.createElement('div');
    bar.className = 'timer-bar';
    const fill = document.createElement('div');
    fill.className = 'timer-fill';
    const pct = Math.max(0, (customer.remainingTime / customer.maxTime) * 100);
    fill.style.width = `${pct}%`;
    bar.appendChild(fill);
    timer.appendChild(bar);

    const mood = document.createElement('div');
    mood.className = 'mood';
    mood.textContent = customer.mood;

    row.appendChild(icon);
    row.appendChild(order);
    row.appendChild(timer);
    row.appendChild(mood);

    list.appendChild(row);
  });
}

function renderTray() {
  const tray = document.getElementById('tray');
  tray.innerHTML = '';
  if (Game.tray.length === 0) {
    tray.textContent = 'Empty tray';
    return;
  }
  Game.tray.forEach((item) => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = `${item.icon} ${item.name}`;
    tray.appendChild(chip);
  });
}

function logEvent(text, style) {
  const log = document.getElementById('log');
  if (!log) return; // early if init not complete
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  if (style === 'tip') entry.classList.add('tip');
  if (style === 'warning') entry.classList.add('warning');
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  log.prepend(entry);
  while (log.children.length > 25) {
    log.removeChild(log.lastChild);
  }
}

function clearTray() {
  Game.tray = [];
  renderTray();
}

document.getElementById('serve').addEventListener('click', handleServe);
document.getElementById('clearTray').addEventListener('click', clearTray);
window.addEventListener('load', init);
