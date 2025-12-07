# Mandi Afandi Diner Rush

A flashy, text-only browser game where you juggle hungry diners, rack up streaks, and keep the rush under control. Everything is plain HTML, CSS, and JavaScript—no builds, no assets.

## Play locally
1. Clone or download this repository.
2. Open `index.html` directly in your browser (double-click or drag it into a tab).

## Deploy on GitHub Pages
1. Push this repository to GitHub.
2. In repo settings, enable **GitHub Pages** for the `main` branch (root folder).
3. After Pages builds, open the published URL to play.

## How to play
- Customers arrive with 1–3 menu items. Pick a customer card to target.
- Tap kitchen buttons to stack emoji dishes on your tray, then hit **Serve Selected**.
- Serve accurate orders before timers expire to gain points, tips, and streak multipliers.
- Rush levels rise automatically; full seats warn you to clear tables faster.
- Wrong or late service resets your streak and costs points.

## Tweaking the menu
Edit `Game.menuItems` in `game.js` to swap icons or names:
```js
menuItems: [
  { icon: '🍗', name: 'Chicken Mandi' },
  { icon: '🍮', name: 'Kunafa' },
  // add more here
],
```
Add, remove, or reorder entries freely—the UI and logic update automatically.
