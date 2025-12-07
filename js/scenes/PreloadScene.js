class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;
    const barWidth = Math.min(320, width * 0.6);
    const barHeight = 20;
    const bg = this.add.image(width / 2, height / 2, 'panel').setDisplaySize(barWidth + 24, barHeight + 24).setAlpha(0.8);
    const bar = this.add.rectangle(width / 2 - barWidth / 2, height / 2, barWidth, barHeight, 0xffb347).setOrigin(0, 0.5);
    this.load.on('progress', (value) => bar.setScale(value, 1));

    this.createGeneratedTextures();
    this.queuePlaceholderAudio();
  }

  create() {
    this.scene.start('MenuScene');
  }

  createGeneratedTextures() {
    const rect = (key, w, h, fill, stroke) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, w, h);
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 3;
        ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
      }
      this.load.image(key, canvas.toDataURL());
    };

    rect('waiter', 42, 60, '#f7d488', '#8e5c2c');
    rect('customer1', 42, 60, '#8dd3ff', '#375fa3');
    rect('customer2', 42, 60, '#ffb4d9', '#b73c6d');
    rect('table_empty', 70, 40, '#c28c52', '#7a4b1f');
    rect('table_occupied', 70, 40, '#b36b37', '#7a4b1f');
    rect('table_dirty', 70, 40, '#8c6239', '#7a4b1f');
    rect('floor', 72, 36, '#2f2a24', '#40362c');
    rect('wall', 72, 36, '#3b2c1e', '#6c4f32');
    rect('kitchen', 96, 52, '#dbe3ec', '#5a708c');

    // simple 5-frame sheet for order icons
    const icons = document.createElement('canvas');
    icons.width = 160;
    icons.height = 32;
    const colors = ['#f7c331', '#f08c42', '#f45d4c', '#f2a2e8', '#79c99e'];
    const ctx = icons.getContext('2d');
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * 32 + 2, 2, 28, 28);
      ctx.strokeStyle = '#2e1a0a';
      ctx.lineWidth = 2;
      ctx.strokeRect(i * 32 + 3, 3, 26, 26);
    });
    this.load.spritesheet('order_icons', icons.toDataURL(), { frameWidth: 32, frameHeight: 32 });

    rect('button_start', 160, 64, '#ffb347', '#784315');
    rect('button_pause', 64, 64, '#7fb3ff', '#1e4d91');
    rect('star_empty', 36, 36, '#2d2d2d', '#555');
    rect('star_filled', 36, 36, '#ffc34d', '#b77b22');
  }

  queuePlaceholderAudio() {
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

    this.load.audio('click', tone(880, 0.08));
    this.load.audio('serve', tone(660, 0.12));
    this.load.audio('success', tone(520, 0.18));
    this.load.audio('fail', tone(180, 0.25));
    this.load.audio('bgm', tone(0, 1));
  }
}
