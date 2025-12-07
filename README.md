# Mandi Afandi Diner Rush

A tiny browser game where you juggle hungry diners and orders using only plain HTML, CSS, and JavaScript.

## Play locally
1. Clone or download this repository.
2. Open `index.html` directly in your browser (double-click or drag it into a tab).

## Deploy on GitHub Pages
1. Push this repository to GitHub.
2. In your repo settings, enable **GitHub Pages** and pick the `main` branch (root folder).
3. After Pages builds, open the published URL to play.

## Game loop
- Customers arrive over time with random orders (1–3 items).
- Each diner has a timer. Serve them before it hits zero to earn points and tips.
- Prepare items with the kitchen buttons, select a customer, then press **Serve Selected**.
- Wrong or late service costs points; the rush intensifies as spawn times shrink.

## Changing menu items
Menu items live in `game.js` inside the `Game.menuItems` array. Each entry needs an emoji `icon` and a human-readable `name`:
```js
menuItems: [
  { icon: '🍗', name: 'Chicken Mandi' },
  { icon: '🍮', name: 'Kunafa' },
  // add more here
],
```
Update icons and names as desired—no other changes required.
