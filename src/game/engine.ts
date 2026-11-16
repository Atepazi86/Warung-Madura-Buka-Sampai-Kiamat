import { WarungAudio } from './audio';
import {
  CUSTOMER_QUOTES,
  EMAK_DASTERS,
  getWaveForOmzet,
  HAPPY_CALLOUTS,
  ITEM_MAP,
  ITEMS,
  WARGA_SHIRTS,
} from './constants';
import { renderGameFrame, RenderState } from './renderer';
import {
  Customer,
  CustomerType,
  Dino,
  FloatingText,
  FlyingItem,
  GameOverReason,
  GameStatus,
  HudSnapshot,
  ItemId,
  Meteor,
  Particle,
  Ufo,
} from './types';

const HIGH_SCORE_KEY = 'warung_madura_high_score_v1';

export class WarungGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audio: WarungAudio;
  private onHudUpdate: (hud: HudSnapshot) => void;

  private rafId: number | null = null;
  private lastTime = 0;
  private elapsed = 0;
  private hudSyncTimer = 0;

  private width = 960;
  private height = 600;

  private status: GameStatus = 'START';
  private omzet = 0;
  private highScore = 0;
  private combo = 0;
  private maxCombo = 0;
  private servedCount = 0;
  private waveDay = 1;
  private waveTitle = 'Hari ke-1 · Malam Biasa';
  private strikes = 0;
  private readonly maxStrikes = 3;
  private gameOverReason: GameOverReason = null;

  // Rolling door twist state
  private doorClosedRatio = 0;
  private stormActive = false;
  private stormWarningBanner = false;
  private stormTimer = 11; // seconds until first storm warning
  private stormWarningCountdown = 0;
  private stormDurationLeft = 0;

  // Visual juiciness
  private lampFlicker = 0;
  private shakeTimer = 0;
  private shakeIntensity = 0;
  private lightningAlpha = 0;

  // Entities
  private nextId = 1;
  private customers: Customer[] = [];
  private activeCustomerId: number | null = null;
  private spawnTimer = 1.2;

  private meteors: Meteor[] = [];
  private meteorTimer = 1.4;
  private ufos: Ufo[] = [];
  private dino: Dino = { active: false, x: -0.2, dir: 1, stepPhase: 0 };
  private dinoCooldown = 12;

  private flyingItems: FlyingItem[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  constructor(
    canvas: HTMLCanvasElement,
    audio: WarungAudio,
    onHudUpdate: (hud: HudSnapshot) => void
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not initialize 2D canvas context');
    }
    this.ctx = context;
    this.audio = audio;
    this.onHudUpdate = onHudUpdate;

    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      if (saved) this.highScore = parseInt(saved, 10) || 0;
    } catch {
      this.highScore = 0;
    }

    this.resize();
    this.startLoop();
    this.emitHud();
  }

  public resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  public destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public startGame(): void {
    this.audio.unlock();
    this.status = 'PLAYING';
    this.omzet = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.servedCount = 0;
    this.waveDay = 1;
    this.waveTitle = 'Hari ke-1 · Malam Biasa';
    this.strikes = 0;
    this.gameOverReason = null;

    this.doorClosedRatio = 0;
    this.stormActive = false;
    this.stormWarningBanner = false;
    this.stormTimer = 13;
    this.stormWarningCountdown = 0;
    this.stormDurationLeft = 0;

    this.lampFlicker = 0;
    this.shakeTimer = 0;
    this.lightningAlpha = 0;

    this.customers = [];
    this.activeCustomerId = null;
    this.spawnTimer = 0.6;
    this.meteors = [];
    this.ufos = [];
    this.dino = { active: false, x: -0.2, dir: 1, stepPhase: 0 };
    this.dinoCooldown = 8;
    this.flyingItems = [];
    this.particles = [];
    this.floatingTexts = [];

    this.spawnFloatingText(
      'BUKA 24 JAM!',
      'Kiamat tetap melayani!',
      this.width / 2,
      this.height * 0.38,
      '#FEF08A',
      1.15
    );
    this.emitHud();
  }

  public togglePause(): void {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
      this.emitHud();
    } else if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
      this.lastTime = performance.now();
      this.emitHud();
    }
  }

  public toggleMute(): void {
    this.audio.toggleMute();
    this.emitHud();
  }

  public handleCanvasClick(clientX: number, clientY: number): void {
    if (this.status !== 'PLAYING') return;
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Check if player clicked on a waiting customer to focus them
    const sideWallW = Math.max(48, Math.min(120, this.width * 0.085));
    const openLeft = sideWallW;
    const openW = this.width - sideWallW * 2;
    const counterY = this.height * 0.72;

    if (y < counterY + 20 && y > this.height * 0.25) {
      let bestCust: Customer | null = null;
      let bestDist = 75;
      for (const c of this.customers) {
        if (c.state !== 'waiting' && c.state !== 'entering') continue;
        const cx = openLeft + c.x * openW;
        const dist = Math.abs(x - cx);
        if (dist < bestDist) {
          bestDist = dist;
          bestCust = c;
        }
      }
      if (bestCust) {
        this.activeCustomerId = bestCust.id;
        this.emitHud();
      }
    }
  }

  public pushRollingDoor(amount = 0.14): void {
    if (this.status !== 'PLAYING') return;
    if (!this.stormActive && this.doorClosedRatio <= 0.01) return;

    this.audio.unlock();
    this.doorClosedRatio = Math.max(0, this.doorClosedRatio - amount);
    this.audio.playDoorPush();

    // Sparks at door handle
    const cx = this.width / 2;
    const topBeamH = Math.max(46, Math.min(72, this.height * 0.11));
    const counterY = this.height * 0.72;
    const lipY = topBeamH + this.doorClosedRatio * (counterY - topBeamH);

    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 90,
        y: lipY,
        vx: (Math.random() - 0.5) * 140,
        vy: -40 - Math.random() * 80,
        size: 2.5 + Math.random() * 2,
        color: '#FEF08A',
        life: 0.35,
        maxLife: 0.35,
        gravity: 340,
        kind: 'spark',
      });
    }

    if (this.stormActive && this.doorClosedRatio <= 0.02 && this.stormDurationLeft < 2.2) {
      // Early heroic hold!
      this.finishStorm();
    }
    this.emitHud();
  }

  public dragRollingDoor(deltaY: number): void {
    if (this.status !== 'PLAYING') return;
    if (!this.stormActive && this.doorClosedRatio <= 0.01) return;
    if (deltaY >= 0) return; // only pushing UP keeps door open

    const topBeamH = Math.max(46, Math.min(72, this.height * 0.11));
    const counterY = this.height * 0.72;
    const maxDrop = counterY - topBeamH;
    const liftRatio = Math.abs(deltaY) / Math.max(120, maxDrop);
    this.doorClosedRatio = Math.max(0, this.doorClosedRatio - liftRatio * 1.15);
    if (Math.random() < 0.28) {
      this.audio.playDoorPush();
    }
    this.emitHud();
  }

  public serveItem(itemId: ItemId): void {
    if (this.status !== 'PLAYING') return;
    this.audio.unlock();

    const target = this.getActiveCustomer();
    if (!target) {
      this.spawnFloatingText(
        'SABAR BOS!',
        'Belum ada pembeli di depan!',
        this.width / 2,
        this.height * 0.55,
        '#E2E8F0',
        0.9
      );
      return;
    }

    const sideWallW = Math.max(48, Math.min(120, this.width * 0.085));
    const openLeft = sideWallW;
    const openW = this.width - sideWallW * 2;
    const custX = openLeft + target.x * openW;
    const custY = this.height * 0.58;

    const itemIndex = ITEMS.findIndex((it) => it.id === itemId);
    const startX = ((itemIndex + 0.5) / ITEMS.length) * this.width;
    const startY = this.height * 0.85;

    const expectedItem = target.order[target.fulfilledCount];
    const isCorrect = itemId === expectedItem;

    this.flyingItems.push({
      id: this.nextId++,
      itemId,
      startX,
      startY,
      targetX: custX,
      targetY: custY,
      progress: 0,
      rotation: isCorrect ? 0.5 : -1.2,
      isWrong: !isCorrect,
    });

    if (isCorrect) {
      this.audio.playServePop();
      target.fulfilledCount += 1;
      target.patience = Math.min(target.maxPatience, target.patience + target.maxPatience * 0.18);
      target.reactTimer = 0.25;
      target.reactType = 'served_part';

      if (target.fulfilledCount >= target.order.length) {
        // Order complete!
        this.completeCustomerOrder(target, custX, custY);
      } else {
        this.spawnFloatingText('PAS!', undefined, custX, custY - 95, '#4ADE80', 0.9);
      }
    } else {
      // Wrong item!
      this.audio.playWrongItem();
      this.combo = 0;
      target.patience = Math.max(0.5, target.patience - target.maxPatience * 0.16);
      target.reactTimer = 0.4;
      target.reactType = 'wrong';
      this.triggerShake(0.18, 5);
      this.spawnFloatingText(
        'SALAH BARANG!',
        `Butuh ${ITEM_MAP[expectedItem].shortName}!`,
        custX,
        custY - 105,
        '#F87171',
        0.95
      );
    }

    this.emitHud();
  }

  private completeCustomerOrder(cust: Customer, custX: number, custY: number): void {
    this.combo += 1;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.servedCount += 1;

    const basePrice = cust.order.reduce((sum, id) => sum + ITEM_MAP[id].price, 0);
    const comboMultiplier = 1 + Math.min(this.combo - 1, 10) * 0.15;
    const earned = Math.round((basePrice * comboMultiplier) / 500) * 500;
    this.omzet += earned;

    if (this.omzet > this.highScore) {
      this.highScore = this.omzet;
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
      } catch {
        // ignore storage restrictions
      }
    }

    const waveInfo = getWaveForOmzet(this.omzet, this.servedCount);
    if (waveInfo.day > this.waveDay) {
      this.waveDay = waveInfo.day;
      this.waveTitle = waveInfo.title;
      this.spawnFloatingText(
        `HARI KE-${this.waveDay}!`,
        'Kiamat makin gila, warung tetap buka!',
        this.width / 2,
        this.height * 0.34,
        '#FACC15',
        1.25
      );
      this.triggerShake(0.35, 7);
    } else {
      this.waveTitle = waveInfo.title;
    }

    this.audio.playCoinChaChing(this.combo);

    // Coin particle burst
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: custX,
        y: custY - 30,
        vx: (Math.random() - 0.5) * 200,
        vy: -130 - Math.random() * 140,
        size: 9 + Math.random() * 3,
        color: '#FACC15',
        life: 0.75 + Math.random() * 0.25,
        maxLife: 1,
        gravity: 420,
        kind: 'coin',
      });
    }

    const callout = HAPPY_CALLOUTS[Math.floor(Math.random() * HAPPY_CALLOUTS.length)];
    const comboText = this.combo >= 2 ? ` (${this.combo}x COMBO!)` : '';
    this.spawnFloatingText(
      callout,
      `+Rp ${earned.toLocaleString('id-ID')}${comboText}`,
      custX,
      custY - 125,
      '#4ADE80',
      1.05
    );

    cust.state = 'leaving_happy';
    this.selectNextActiveCustomer();
  }

  private getActiveCustomer(): Customer | null {
    const waiting = this.customers.filter(
      (c) => c.state === 'waiting' || c.state === 'entering'
    );
    if (waiting.length === 0) return null;

    if (this.activeCustomerId !== null) {
      const found = waiting.find((c) => c.id === this.activeCustomerId);
      if (found) return found;
    }
    this.activeCustomerId = waiting[0].id;
    return waiting[0];
  }

  private selectNextActiveCustomer(): void {
    const waiting = this.customers.filter(
      (c) => c.state === 'waiting' || c.state === 'entering'
    );
    this.activeCustomerId = waiting.length > 0 ? waiting[0].id : null;
  }

  private startLoop(): void {
    this.lastTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
      this.lastTime = now;

      this.update(dt);
      this.render();

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private update(dt: number): void {
    this.elapsed += dt;

    // Background apocalypse ambient animation runs on START screen too for lively preview!
    this.updateApocalypseBackdrop(dt);

    if (this.status !== 'PLAYING') {
      return;
    }

    // Decay lamp flicker & camera shake
    if (this.lampFlicker > 0) {
      this.lampFlicker = Math.max(0, this.lampFlicker - dt * 0.9);
    }
    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    }
    if (this.lightningAlpha > 0) {
      this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 2.4);
    }

    // Rolling Door Twist Logic
    this.updateRollingDoorStorm(dt);

    // Customer Spawning
    this.spawnTimer -= dt;
    const activeCustomers = this.customers.filter(
      (c) => c.state === 'waiting' || c.state === 'entering'
    );
    const maxSlots = this.waveDay >= 3 ? 3 : 2;
    if (this.spawnTimer <= 0 && activeCustomers.length < maxSlots) {
      this.spawnCustomer();
      const baseInterval = Math.max(1.45, 3.3 - this.waveDay * 0.38);
      this.spawnTimer = baseInterval + Math.random() * 0.9;
    }

    // Update Customers
    for (const c of this.customers) {
      if (c.reactTimer > 0) c.reactTimer = Math.max(0, c.reactTimer - dt);

      if (c.state === 'entering') {
        const diff = c.targetX - c.x;
        c.x += diff * Math.min(1, dt * 6);
        if (Math.abs(diff) < 0.01) {
          c.x = c.targetX;
          c.state = 'waiting';
        }
      } else if (c.state === 'waiting') {
        c.patience -= dt;
        if (c.patience <= 0) {
          c.patience = 0;
          c.state = 'leaving_angry';
          this.combo = 0;
          this.strikes += 1;
          this.audio.playCustomerAngry();
          this.triggerShake(0.25, 7);

          const sideWallW = Math.max(48, Math.min(120, this.width * 0.085));
          const cx = sideWallW + c.x * (this.width - sideWallW * 2);
          this.spawnFloatingText(
            'KABUR!',
            'Kelamaan dilayani!',
            cx,
            this.height * 0.45,
            '#EF4444',
            1.1
          );
          this.selectNextActiveCustomer();

          if (this.strikes >= this.maxStrikes) {
            this.triggerGameOver('CUSTOMERS_LEFT');
            return;
          }
        }
      } else if (c.state === 'leaving_happy') {
        c.yOffset -= dt * 35;
        c.alpha -= dt * 2.5;
      } else if (c.state === 'leaving_angry') {
        c.x += (c.x < 0.5 ? -1 : 1) * dt * 0.8;
        c.alpha -= dt * 2.0;
      }
    }

    this.customers = this.customers.filter((c) => c.alpha > 0.02);
    if (this.activeCustomerId === null) {
      this.selectNextActiveCustomer();
    }

    // Update Flying Items
    for (const fly of this.flyingItems) {
      fly.progress += dt * 4.2;
    }
    this.flyingItems = this.flyingItems.filter((f) => f.progress < 1);

    // Update Particles
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    // Update Floating Texts
    for (const ft of this.floatingTexts) {
      ft.life -= dt;
      ft.y += ft.vy * dt;
    }
    this.floatingTexts = this.floatingTexts.filter((ft) => ft.life > 0);

    this.hudSyncTimer += dt;
    if (this.hudSyncTimer >= 0.08) {
      this.hudSyncTimer = 0;
      this.emitHud();
    }
  }

  private updateRollingDoorStorm(dt: number): void {
    if (!this.stormActive && !this.stormWarningBanner) {
      // Smoothly retract door if slightly down
      if (this.doorClosedRatio > 0) {
        this.doorClosedRatio = Math.max(0, this.doorClosedRatio - dt * 0.65);
      }

      this.stormTimer -= dt;
      if (this.stormTimer <= 0) {
        this.stormWarningBanner = true;
        this.stormWarningCountdown = 1.9;
        this.audio.playStormSiren();
        this.spawnFloatingText(
          'AWAS BADAI METEOR!',
          'SIAP TAHAN ROLLING DOOR!',
          this.width / 2,
          this.height * 0.3,
          '#EF4444',
          1.2,
          true
        );
        this.emitHud();
      }
    } else if (this.stormWarningBanner) {
      this.stormWarningCountdown -= dt;
      if (this.stormWarningCountdown <= 0) {
        this.stormWarningBanner = false;
        this.stormActive = true;
        this.stormDurationLeft = 6.2 + Math.min(2.5, this.waveDay * 0.4);
        this.doorClosedRatio = Math.max(this.doorClosedRatio, 0.14);
        this.emitHud();
      }
    } else if (this.stormActive) {
      this.stormDurationLeft -= dt;

      // Rolling door relentlessly slips downward!
      const dropSpeed = 0.175 + Math.min(0.11, (this.waveDay - 1) * 0.025);
      this.doorClosedRatio += dropSpeed * dt;
      this.audio.playDoorScreech();

      // Occasional warning floating text
      if (this.doorClosedRatio > 0.62 && Math.random() < dt * 1.4) {
        this.spawnFloatingText(
          'PINTU MAU NUTUP!',
          'SPAM SPASI / GESER ATAS!',
          this.width / 2,
          this.height * 0.44,
          '#FACC15',
          1.05,
          true
        );
      }

      // Sparks on side rails
      if (Math.random() < dt * 18) {
        const sideWallW = Math.max(48, Math.min(120, this.width * 0.085));
        const topBeamH = Math.max(46, Math.min(72, this.height * 0.11));
        const counterY = this.height * 0.72;
        const lipY = topBeamH + this.doorClosedRatio * (counterY - topBeamH);
        const railX = Math.random() < 0.5 ? sideWallW + 6 : this.width - sideWallW - 6;
        this.particles.push({
          x: railX,
          y: lipY,
          vx: (Math.random() - 0.5) * 90,
          vy: -20 - Math.random() * 60,
          size: 2.2,
          color: '#FB923C',
          life: 0.3,
          maxLife: 0.3,
          gravity: 300,
          kind: 'spark',
        });
      }

      if (this.doorClosedRatio >= 1) {
        this.doorClosedRatio = 1;
        this.triggerGameOver('ROLLING_DOOR');
        return;
      }

      if (this.stormDurationLeft <= 0) {
        this.finishStorm();
      }
    }
  }

  private finishStorm(): void {
    this.stormActive = false;
    this.stormWarningBanner = false;
    this.stormTimer = Math.max(10.5, 19 - this.waveDay * 1.4) + Math.random() * 4;
    this.audio.playDoorSurvived();

    const bonus = 15000 + this.waveDay * 5000;
    this.omzet += bonus;
    if (this.omzet > this.highScore) {
      this.highScore = this.omzet;
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
      } catch {
        // ignore
      }
    }

    this.spawnFloatingText(
      'WARUNG TETAP BUKA!',
      `Bonus Tahan Pintu +Rp ${bonus.toLocaleString('id-ID')}`,
      this.width / 2,
      this.height * 0.32,
      '#4ADE80',
      1.15
    );
    this.emitHud();
  }

  private updateApocalypseBackdrop(dt: number): void {
    // Meteors
    this.meteorTimer -= dt;
    if (this.meteorTimer <= 0) {
      const rate = this.waveDay === 1 ? 2.4 : Math.max(0.42, 1.5 - this.waveDay * 0.22);
      this.meteorTimer = rate + Math.random() * 0.8;

      const startX = this.width * (0.15 + Math.random() * 0.75);
      this.meteors.push({
        x: startX,
        y: -20,
        vx: -110 - Math.random() * 140,
        vy: 230 + Math.random() * 180,
        size: 5 + Math.random() * (this.waveDay >= 3 ? 6 : 3),
        trail: [],
        exploded: false,
      });
    }

    const horizonY = this.height * 0.52;
    for (const m of this.meteors) {
      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 10) m.trail.shift();
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      if (m.y >= horizonY && !m.exploded) {
        m.exploded = true;
        if (this.status === 'PLAYING' && this.waveDay >= 2) {
          this.triggerShake(0.14, 3.5);
          if (Math.random() < 0.35) {
            this.audio.playMeteorBoom();
          }
        }
        // Meteor explosion sparks
        for (let i = 0; i < 6; i++) {
          this.particles.push({
            x: m.x,
            y: horizonY,
            vx: (Math.random() - 0.5) * 140,
            vy: -60 - Math.random() * 110,
            size: 2.5,
            color: i % 2 === 0 ? '#FB923C' : '#FACC15',
            life: 0.4,
            maxLife: 0.4,
            gravity: 220,
            kind: 'spark',
          });
        }
      }
    }
    this.meteors = this.meteors.filter((m) => !m.exploded && m.y < this.height);

    // UFOs in Wave 2+
    const targetUfoCount = this.waveDay >= 3 ? 2 : this.waveDay === 2 ? 1 : 0;
    while (this.ufos.length < targetUfoCount) {
      this.ufos.push({
        x: Math.random() < 0.5 ? -0.1 : 1.1,
        y: 0.16 + Math.random() * 0.22,
        vx: (Math.random() < 0.5 ? 1 : -1) * (0.06 + Math.random() * 0.05),
        phase: Math.random() * Math.PI * 2,
        beamActive: Math.random() < 0.5,
        scale: 0.8 + Math.random() * 0.35,
      });
    }
    for (const u of this.ufos) {
      u.x += u.vx * dt;
      if (u.x > 1.12 || u.x < -0.12) {
        u.vx *= -1;
        u.beamActive = !u.beamActive;
      }
    }

    // Dinosaur stomping in Wave 4+
    if (this.waveDay >= 4) {
      if (!this.dino.active) {
        this.dinoCooldown -= dt;
        if (this.dinoCooldown <= 0) {
          const fromLeft = Math.random() < 0.5;
          this.dino = {
            active: true,
            x: fromLeft ? -0.15 : 1.15,
            dir: fromLeft ? 1 : -1,
            stepPhase: 0,
          };
          this.dinoCooldown = 10 + Math.random() * 6;
        }
      } else {
        this.dino.x += this.dino.dir * dt * 0.24;
        this.dino.stepPhase += dt * 14;
        if (this.dino.x > 1.2 || this.dino.x < -0.2) {
          this.dino.active = false;
        }
      }
    }
  }

  private spawnCustomer(): void {
    // Pick unoccupied horizontal slot
    const slots = [0.22, 0.5, 0.78];
    const occupied = new Set(
      this.customers
        .filter((c) => c.state === 'entering' || c.state === 'waiting')
        .map((c) => Math.round(c.targetX * 100))
    );
    const freeSlots = slots.filter((s) => !occupied.has(Math.round(s * 100)));
    const targetX =
      freeSlots.length > 0
        ? freeSlots[Math.floor(Math.random() * freeSlots.length)]
        : slots[Math.floor(Math.random() * slots.length)];

    // Choose customer archetype based on Wave Day
    const roll = Math.random();
    let type: CustomerType = 'warga';
    if (this.waveDay === 1) {
      type = roll < 0.45 ? 'warga' : roll < 0.82 ? 'ojol' : 'emak';
    } else if (this.waveDay === 2) {
      if (roll < 0.25) type = 'warga';
      else if (roll < 0.48) type = 'ojol';
      else if (roll < 0.74) type = 'emak';
      else if (roll < 0.9) type = Math.random() < 0.55 ? 'pocong' : 'kuntilanak';
      else type = 'alien';
    } else {
      if (roll < 0.16) type = 'warga';
      else if (roll < 0.34) type = 'ojol';
      else if (roll < 0.56) type = 'emak';
      else if (roll < 0.77) type = Math.random() < 0.5 ? 'pocong' : 'kuntilanak';
      else type = Math.random() < 0.65 ? 'alien' : 'astronot';
    }

    let order: ItemId[] = [];
    let maxPatience = 13;
    let label = 'Warga Biasa';
    let isSpooky = false;
    let shirtColor = WARGA_SHIRTS[Math.floor(Math.random() * WARGA_SHIRTS.length)];
    const skinColor = ['#FDBA74', '#E5B887', '#D49B6A'][Math.floor(Math.random() * 3)];

    if (type === 'warga') {
      label = 'Warga Biasa';
      const pool: ItemId[] = ['bensin', 'mie', 'rokok', 'galon', 'token'];
      order = [pool[Math.floor(Math.random() * pool.length)]];
      maxPatience = Math.max(9, 14.5 - this.waveDay * 0.8);
      this.audio.playWargaArrival();
    } else if (type === 'ojol') {
      label = 'Bang Ojol';
      shirtColor = '#16A34A';
      const pool: ItemId[] = ['bensin', 'rokok', 'bensin', 'token'];
      order = [pool[Math.floor(Math.random() * pool.length)]];
      maxPatience = Math.max(8.5, 13.5 - this.waveDay * 0.7);
      this.audio.playHorn();
    } else if (type === 'emak') {
      label = 'Emak-Emak Daster';
      shirtColor = EMAK_DASTERS[Math.floor(Math.random() * EMAK_DASTERS.length)];
      const count = Math.random() < 0.55 ? 2 : 3;
      const emakPool: ItemId[] = ['galon', 'mie', 'token', 'bensin'];
      for (let i = 0; i < count; i++) {
        order.push(emakPool[Math.floor(Math.random() * emakPool.length)]);
      }
      // Emak-emak patience drains faster relative to order size!
      maxPatience = Math.max(10.5, 15.5 - this.waveDay * 0.6);
      this.audio.playEmakVoice();
    } else if (type === 'pocong' || type === 'kuntilanak') {
      label = type === 'pocong' ? 'Mas Pocong' : 'Mbak Kunti';
      isSpooky = true;
      const spookyPool: ItemId[] = ['mie', 'rokok'];
      order =
        Math.random() < 0.65
          ? [spookyPool[Math.floor(Math.random() * spookyPool.length)]]
          : ['mie', 'rokok'];
      maxPatience = Math.max(9.5, 14 - this.waveDay * 0.65);
      this.lampFlicker = 0.95;
      if (type === 'pocong') {
        this.audio.playPocongHop();
      } else {
        this.audio.playKuntiLaugh();
      }
    } else if (type === 'alien' || type === 'astronot') {
      label = type === 'alien' ? 'Alien UFO' : 'Astronot Nyasar';
      const spacePool: ItemId[] = ['bensin', 'bensin', 'token', 'galon'];
      order =
        Math.random() < 0.6
          ? ['bensin']
          : ['bensin', spacePool[Math.floor(Math.random() * spacePool.length)]];
      maxPatience = Math.max(9, 13.5 - this.waveDay * 0.65);
      if (type === 'alien') {
        this.audio.playAlienSound();
      } else {
        this.audio.playAstronotRadio();
      }
    }

    const quotes = CUSTOMER_QUOTES[type];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    const newCust: Customer = {
      id: this.nextId++,
      type,
      label,
      quote,
      order,
      fulfilledCount: 0,
      patience: maxPatience,
      maxPatience,
      x: targetX < 0.5 ? -0.15 : 1.15,
      yOffset: 0,
      targetX,
      state: 'entering',
      bobPhase: Math.random() * Math.PI * 2,
      scale: type === 'emak' ? 1.04 : 1,
      alpha: 1,
      shirtColor,
      skinColor,
      isSpooky,
      reactTimer: 0,
      reactType: 'none',
    };

    this.customers.push(newCust);
    if (this.activeCustomerId === null) {
      this.activeCustomerId = newCust.id;
    }

    // Brief comical speech quote floating when arriving
    const sideWallW = Math.max(48, Math.min(120, this.width * 0.085));
    const arriveX = sideWallW + targetX * (this.width - sideWallW * 2);
    this.spawnFloatingText(
      quote,
      undefined,
      arriveX,
      this.height * 0.25,
      isSpooky ? '#E9D5FF' : '#FEF08A',
      0.78,
      isSpooky
    );
  }

  private triggerGameOver(reason: GameOverReason): void {
    this.status = 'GAME_OVER';
    this.gameOverReason = reason;
    this.stormActive = false;
    this.stormWarningBanner = false;
    this.audio.playGameOver();
    this.emitHud();
  }

  private triggerShake(duration: number, intensity: number): void {
    this.shakeTimer = Math.max(this.shakeTimer, duration);
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  private spawnFloatingText(
    text: string,
    subText: string | undefined,
    x: number,
    y: number,
    color: string,
    scale = 1,
    jitter = false
  ): void {
    const clampedX = Math.max(120, Math.min(this.width - 120, x));
    this.floatingTexts.push({
      id: this.nextId++,
      text,
      subText,
      x: clampedX,
      y,
      vy: -38,
      life: 1.35,
      maxLife: 1.35,
      color,
      scale,
      jitter,
    });
  }

  private render(): void {
    const shakeX =
      this.shakeTimer > 0 ? (Math.random() - 0.5) * 2 * this.shakeIntensity : 0;
    const shakeY =
      this.shakeTimer > 0 ? (Math.random() - 0.5) * 2 * this.shakeIntensity : 0;

    const state: RenderState = {
      width: this.width,
      height: this.height,
      time: this.elapsed,
      waveDay: this.waveDay,
      lampFlicker: this.lampFlicker,
      shakeX,
      shakeY,
      doorClosedRatio: this.doorClosedRatio,
      stormActive: this.stormActive,
      stormWarningBanner: this.stormWarningBanner,
      customers: this.customers,
      activeCustomerId: this.activeCustomerId,
      meteors: this.meteors,
      ufos: this.ufos,
      dino: this.dino,
      flyingItems: this.flyingItems,
      particles: this.particles,
      floatingTexts: this.floatingTexts,
      lightningAlpha: this.lightningAlpha,
    };

    renderGameFrame(this.ctx, state);
  }

  private emitHud(): void {
    const active = this.getActiveCustomer();
    this.onHudUpdate({
      status: this.status,
      omzet: this.omzet,
      highScore: this.highScore,
      combo: this.combo,
      maxCombo: this.maxCombo,
      servedCount: this.servedCount,
      waveDay: this.waveDay,
      waveTitle: this.waveTitle,
      strikes: this.strikes,
      maxStrikes: this.maxStrikes,
      doorClosedRatio: this.doorClosedRatio,
      stormActive: this.stormActive,
      stormWarningBanner: this.stormWarningBanner,
      lampFlicker: this.lampFlicker,
      muted: this.audio.isMuted(),
      gameOverReason: this.gameOverReason,
      activeCustomerOrder: active ? active.order : null,
      activeCustomerFulfilled: active ? active.fulfilledCount : 0,
    });
  }
}
