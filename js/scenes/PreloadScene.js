class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;
    const barWidth = Math.min(320, width * 0.6);
    const barHeight = 20;
    const bg = this.add
      .image(width / 2, height / 2, 'panel')
      .setDisplaySize(barWidth + 24, barHeight + 24)
      .setAlpha(0.8);
    const bar = this.add
      .rectangle(width / 2 - barWidth / 2, height / 2, barWidth, barHeight, 0xffb347)
      .setOrigin(0, 0.5);
    this.load.on('progress', (value) => bar.setScale(value, 1));

    this.registerFallbackHandlers();
    this.queueArt();
    this.queueUI();
    this.queueAudio();
  }

  create() {
    this.ensureFallbackTextures();
    this.ensureFallbackAudio();
    this.bakeFromExistingArt();
    this.scene.start('MenuScene');
  }

  registerFallbackHandlers() {
    this.missing = new Set();
    this.load.on('loaderror', (file) => {
      this.missing.add(file.key);
    });
  }

  queueArt() {
    this.load.setPath('assets/sprites');
    this.load.image('waiter', 'waiter.png');
    this.load.image('customer1', 'customer_1.png');
    this.load.image('customer2', 'customer_2.png');
    this.load.image('table_empty', 'table_empty.png');
    this.load.image('table_occupied', 'table_occupied.png');
    this.load.image('table_dirty', 'table_dirty.png');
    this.load.image('floor', 'floor_tiles.png');
    this.load.image('wall', 'wall_tile.png');
    this.load.image('kitchen', 'kitchen_counter.png');
    this.load.spritesheet('order_icons', 'order_icons.png', { frameWidth: 32, frameHeight: 32 });
    this.load.setPath();
  }

  queueUI() {
    this.load.setPath('assets/ui');
    this.load.image('button_start', 'button_start.png');
    this.load.image('button_pause', 'button_pause.png');
    this.load.image('star_empty', 'star_empty.png');
    this.load.image('star_filled', 'star_filled.png');
    this.load.image('panel_art', 'panel.png');
    this.load.setPath();
  }

  queueAudio() {
    const tone = (frequency = 0, duration = 0.2) => {
      const sampleRate = 8000;
      const samples = Math.floor(sampleRate * duration);
      const buffer = new ArrayBuffer(44 + samples * 2);
      const view = new DataView(buffer);
      const writeString = (offset, str) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
      };
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, samples * 2, true);
      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const sample = frequency === 0 ? 0 : Math.sin(2 * Math.PI * frequency * t) * 0.2;
        view.setInt16(44 + i * 2, sample * 0x7fff, true);
      }
      const bytes = new Uint8Array(buffer);
      let binary = '';
      bytes.forEach((b) => (binary += String.fromCharCode(b)));
      return `data:audio/wav;base64,${btoa(binary)}`;
    };

    const wavs = {
      click: tone(880, 0.08),
      serve: tone(660, 0.12),
      success: tone(520, 0.18),
      fail: tone(180, 0.25),
      bgm: tone(0, 1),
    };

    this.load.setPath('assets/audio');
    Object.entries(wavs).forEach(([key, fallback]) => {
      this.load.audio(key, [`${key}.wav`, `${key}.mp3`, fallback]);
    });
    this.load.setPath();
  }

  ensureFallbackTextures() {
    const makeRoundedRect = (w, h, gradientStops, stroke, shadow) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (shadow) {
        ctx.shadowColor = shadow.color;
        ctx.shadowBlur = shadow.blur;
        ctx.shadowOffsetX = shadow.x;
        ctx.shadowOffsetY = shadow.y;
      }
      const grd = ctx.createLinearGradient(0, 0, w, h);
      gradientStops.forEach(([stop, color]) => grd.addColorStop(stop, color));
      ctx.fillStyle = grd;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3;
      const r = Math.min(12, Math.min(w, h) / 4);
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      return canvas.toDataURL();
    };

    const addImageIfMissing = (key, dataUrl) => {
      if (!this.textures.exists(key)) {
        this.textures.addBase64(key, dataUrl);
      }
    };

    const waiter = this.drawCharacter('#f8d19b', '#8b5a2b');
    const customer1 = this.drawCharacter('#7ac7ff', '#1b4d89');
    const customer2 = this.drawCharacter('#ff9ecf', '#9c2f63');
    const tableEmpty = this.drawTable(['#c58c53', '#8e5b2a'], '#3c220c', false);
    const tableOccupied = this.drawTable(['#b56c3c', '#8e4b1c'], '#3c220c', true);
    const tableDirty = this.drawTable(['#8d6b46', '#5b3b1f'], '#3c220c', true, true);
    const floor = this.drawFloorTile();
    const wall = this.drawWallTile();
    const kitchen = this.drawKitchen();
    const orderSheet = this.drawOrderIcons();

    addImageIfMissing('waiter', waiter);
    addImageIfMissing('customer1', customer1);
    addImageIfMissing('customer2', customer2);
    addImageIfMissing('table_empty', tableEmpty);
    addImageIfMissing('table_occupied', tableOccupied);
    addImageIfMissing('table_dirty', tableDirty);
    addImageIfMissing('floor', floor);
    addImageIfMissing('wall', wall);
    addImageIfMissing('kitchen', kitchen);

    if (!this.textures.exists('order_icons')) {
      const sheet = this.textures.addSpriteSheet('order_icons', orderSheet, {
        frameWidth: 32,
        frameHeight: 32,
        endFrame: 4,
      });
      sheet.refresh();
    }

    if (!this.textures.exists('panel_art')) {
      addImageIfMissing(
        'panel_art',
        makeRoundedRect(
          320,
          160,
          [
            [0, 'rgba(24,21,33,0.9)'],
            [1, 'rgba(45,40,60,0.9)'],
          ],
          '#ffb347',
          { color: 'rgba(0,0,0,0.45)', blur: 10, x: 0, y: 6 }
        )
      );
    }

    addImageIfMissing(
      'button_start',
      makeRoundedRect(
        180,
        70,
        [
          [0, '#ffdf99'],
          [0.5, '#ffb347'],
          [1, '#ff9f1c'],
        ],
        '#7a3b0f',
        { color: 'rgba(0,0,0,0.35)', blur: 8, x: 0, y: 4 }
      )
    );

    addImageIfMissing(
      'button_pause',
      makeRoundedRect(
        70,
        70,
        [
          [0, '#e7f1ff'],
          [1, '#7fb3ff'],
        ],
        '#1e4d91',
        { color: 'rgba(0,0,0,0.25)', blur: 6, x: 0, y: 3 }
      )
    );

    addImageIfMissing(
      'star_empty',
      makeRoundedRect(
        42,
        42,
        [
          [0, '#1f1f1f'],
          [1, '#3b3b3b'],
        ],
        '#777',
        { color: 'rgba(0,0,0,0.4)', blur: 4, x: 0, y: 2 }
      )
    );

    addImageIfMissing(
      'star_filled',
      makeRoundedRect(
        42,
        42,
        [
          [0, '#ffe7a7'],
          [1, '#ffba3b'],
        ],
        '#b17618',
        { color: 'rgba(0,0,0,0.35)', blur: 4, x: 0, y: 2 }
      )
    );
  }

  ensureFallbackAudio() {
    // Audio fallbacks are pre-wired via data URLs in the loader queue.
    // If the browser rejects everything, the scenes will still run silently.
  }

  bakeFromExistingArt() {
    const tiltAndShadow = (key, newKey, config = {}) => {
      if (!this.textures.exists(key) || this.textures.exists(newKey)) return;
      const source = this.textures.get(key).getSourceImage();
      const width = config.width || source.width;
      const height = config.height || source.height;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;

      if (config.shadow) {
        ctx.shadowColor = config.shadow.color || 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = config.shadow.blur || 10;
        ctx.shadowOffsetX = config.shadow.x || 0;
        ctx.shadowOffsetY = config.shadow.y || 6;
      }

      const iso = config.iso !== false;
      ctx.save();
      ctx.translate(width / 2, height * (config.anchorY || 0.65));
      if (iso) {
        ctx.transform(1, config.shearY ?? -0.42, 0, config.scaleY ?? 0.78, 0, 0);
      }
      const drawW = config.drawWidth || source.width;
      const drawH = config.drawHeight || source.height;
      ctx.drawImage(source, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      if (config.glow) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const grd = ctx.createRadialGradient(width / 2, height * 0.55, 6, width / 2, height * 0.55, width * 0.4);
        grd.addColorStop(0, config.glow.inner || 'rgba(255, 230, 180, 0.55)');
        grd.addColorStop(1, config.glow.outer || 'rgba(255, 190, 120, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      this.textures.addBase64(newKey, canvas.toDataURL());
    };

    // Floor + wall tiles get an isometric tilt and soft shadow.
    tiltAndShadow('floor', 'floor_iso', { width: 96, height: 48, shadow: { color: 'rgba(0,0,0,0.35)', blur: 12, y: 8 } });
    tiltAndShadow('wall', 'wall_iso', { width: 96, height: 64, iso: false, shadow: { color: 'rgba(0,0,0,0.25)', blur: 10, y: 6 } });

    // Tables get baked with a heavier shadow to lift them above the tiles.
    tiltAndShadow('table_empty', 'table_empty_iso', { width: 128, height: 96, shadow: { color: 'rgba(0,0,0,0.45)', blur: 18, y: 12 } });
    tiltAndShadow('table_occupied', 'table_occupied_iso', { width: 128, height: 96, shadow: { color: 'rgba(0,0,0,0.45)', blur: 18, y: 12 } });
    tiltAndShadow('table_dirty', 'table_dirty_iso', { width: 128, height: 96, shadow: { color: 'rgba(0,0,0,0.45)', blur: 18, y: 12 } });

    // Kitchen counter keeps its upright posture but gains glow and depth.
    tiltAndShadow('kitchen', 'kitchen_iso', {
      width: 200,
      height: 140,
      iso: false,
      shadow: { color: 'rgba(0,0,0,0.35)', blur: 16, y: 10 },
      glow: { inner: 'rgba(255, 255, 230, 0.4)', outer: 'rgba(255, 205, 120, 0.05)' },
      anchorY: 0.72,
    });

    // Characters get a softer outline and glow while keeping their proportions.
    tiltAndShadow('waiter', 'waiter_iso', { width: 96, height: 128, iso: false, shadow: { color: 'rgba(0,0,0,0.3)', blur: 14, y: 10 }, glow: { inner: 'rgba(255, 240, 220, 0.4)', outer: 'rgba(255, 240, 220, 0.05)' }, anchorY: 0.72 });
    tiltAndShadow('customer1', 'customer1_iso', { width: 96, height: 128, iso: false, shadow: { color: 'rgba(0,0,0,0.3)', blur: 14, y: 10 }, anchorY: 0.72 });
    tiltAndShadow('customer2', 'customer2_iso', { width: 96, height: 128, iso: false, shadow: { color: 'rgba(0,0,0,0.3)', blur: 14, y: 10 }, anchorY: 0.72 });

    // Panel and UI buttons gain a subtle glow for readability over detailed art.
    tiltAndShadow('panel_art', 'panel_art_glow', {
      width: 320,
      height: 180,
      iso: false,
      shadow: { color: 'rgba(0,0,0,0.35)', blur: 12, y: 8 },
      glow: { inner: 'rgba(255, 195, 120, 0.35)', outer: 'rgba(255, 195, 120, 0.05)' },
      anchorY: 0.5,
    });
    tiltAndShadow('button_start', 'button_start_glow', { width: 200, height: 90, iso: false, shadow: { color: 'rgba(0,0,0,0.35)', blur: 10, y: 6 }, glow: { inner: 'rgba(255, 220, 160, 0.35)', outer: 'rgba(255, 220, 160, 0.08)' }, anchorY: 0.5 });
    tiltAndShadow('button_pause', 'button_pause_glow', { width: 100, height: 100, iso: false, shadow: { color: 'rgba(0,0,0,0.35)', blur: 10, y: 6 }, anchorY: 0.5 });
  }

  drawCharacter(fill, stroke) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 82;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b0b0b33';
    ctx.beginPath();
    ctx.ellipse(32, 74, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const bodyGrd = ctx.createLinearGradient(0, 8, 0, 64);
    bodyGrd.addColorStop(0, Phaser.Display.Color.Lighten(Phaser.Display.Color.HexStringToColor(fill), 10).rgba);
    bodyGrd.addColorStop(1, fill);
    ctx.fillStyle = bodyGrd;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(14, 22, 36, 44, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff8e1';
    ctx.beginPath();
    ctx.arc(32, 22, 14, Math.PI * 0.1, Math.PI * 0.9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = stroke;
    ctx.fillRect(20, 32, 8, 6);
    ctx.fillRect(36, 32, 8, 6);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(24, 28, 3, 0, Math.PI * 2);
    ctx.arc(40, 28, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(32, 36, 8, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    return canvas.toDataURL();
  }

  drawTable(woodStops, stroke, hasPlate = false, messy = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 110;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b0b0b30';
    ctx.beginPath();
    ctx.ellipse(55, 56, 40, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const grd = ctx.createLinearGradient(0, 10, 0, 54);
    grd.addColorStop(0, woodStops[0]);
    grd.addColorStop(1, woodStops[1]);
    ctx.fillStyle = grd;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(14, 10, 82, 40, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#553016';
    ctx.fillRect(24, 48, 12, 10);
    ctx.fillRect(74, 48, 12, 10);

    if (hasPlate) {
      ctx.fillStyle = '#f7f3ea';
      ctx.beginPath();
      ctx.ellipse(55, 34, 20, 12, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d6c7b0';
      ctx.stroke();
      ctx.fillStyle = '#f05b3f';
      ctx.beginPath();
      ctx.arc(55, 34, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7c331';
      ctx.beginPath();
      ctx.arc(50, 32, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (messy) {
      ctx.fillStyle = '#3c1f0f80';
      ctx.beginPath();
      ctx.ellipse(46, 30, 10, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(68, 38, 12, 6, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas.toDataURL();
  }

  drawFloorTile() {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    const grd = ctx.createLinearGradient(0, 0, 96, 48);
    grd.addColorStop(0, '#2a241f');
    grd.addColorStop(1, '#3a3129');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(48, 0);
    ctx.lineTo(96, 24);
    ctx.lineTo(48, 48);
    ctx.lineTo(0, 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a1410';
    ctx.stroke();

    ctx.strokeStyle = '#4a4136';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.lineTo(48, 48);
    ctx.lineTo(96, 24);
    ctx.lineTo(48, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    return canvas.toDataURL();
  }

  drawWallTile() {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    const grd = ctx.createLinearGradient(0, 0, 0, 48);
    grd.addColorStop(0, '#4a3018');
    grd.addColorStop(1, '#2f1f12');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 96, 48);
    ctx.strokeStyle = '#6b4224';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, 93, 45);
    return canvas.toDataURL();
  }

  drawKitchen() {
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    const top = ctx.createLinearGradient(0, 0, 0, 30);
    top.addColorStop(0, '#eef2f7');
    top.addColorStop(1, '#cfd8e3');
    ctx.fillStyle = top;
    ctx.strokeStyle = '#5a708c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(6, 8, 128, 36, 10);
    ctx.fill();
    ctx.stroke();

    const body = ctx.createLinearGradient(0, 34, 0, 78);
    body.addColorStop(0, '#c7d0db');
    body.addColorStop(1, '#9aa7ba');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(10, 34, 120, 40, 8);
    ctx.fill();

    ctx.strokeStyle = '#4c6075';
    ctx.beginPath();
    ctx.moveTo(30, 40);
    ctx.lineTo(30, 74);
    ctx.moveTo(70, 40);
    ctx.lineTo(70, 74);
    ctx.moveTo(110, 40);
    ctx.lineTo(110, 74);
    ctx.stroke();
    return canvas.toDataURL();
  }

  drawOrderIcons() {
    const sheet = document.createElement('canvas');
    sheet.width = 160;
    sheet.height = 32;
    const ctx = sheet.getContext('2d');
    const palettes = [
      ['#f7c331', '#e89b2d', '#ffe8a3'],
      ['#f08c42', '#c55a1c', '#ffd4a3'],
      ['#f45d4c', '#b3201f', '#ffc7c0'],
      ['#f2a2e8', '#c66cd2', '#ffe7fb'],
      ['#79c99e', '#3c8f68', '#d4ffe8'],
    ];

    palettes.forEach((colors, i) => {
      const x = i * 32;
      const grd = ctx.createLinearGradient(x, 2, x + 28, 30);
      grd.addColorStop(0, colors[0]);
      grd.addColorStop(1, colors[1]);
      ctx.fillStyle = grd;
      ctx.strokeStyle = '#2e1a0a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(x + 2, 2, 28, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors[2];
      ctx.beginPath();
      ctx.arc(x + 16, 16, 6 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2e1a0a80';
      ctx.beginPath();
      ctx.arc(x + 16, 16, 10, 0, Math.PI * 2);
      ctx.stroke();
    });

    return sheet;
  }
}
