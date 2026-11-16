import { ITEM_MAP } from './constants';
import {
  Customer,
  Dino,
  FloatingText,
  FlyingItem,
  ItemId,
  Meteor,
  Particle,
  Ufo,
} from './types';

export interface RenderState {
  width: number;
  height: number;
  time: number;
  waveDay: number;
  lampFlicker: number;
  shakeX: number;
  shakeY: number;
  doorClosedRatio: number;
  stormActive: boolean;
  stormWarningBanner: boolean;
  customers: Customer[];
  activeCustomerId: number | null;
  meteors: Meteor[];
  ufos: Ufo[];
  dino: Dino;
  flyingItems: FlyingItem[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  lightningAlpha: number;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawVectorItem(
  ctx: CanvasRenderingContext2D,
  itemId: ItemId,
  cx: number,
  cy: number,
  size: number
): void {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 40;
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (itemId === 'bensin') {
    // Botol kaca bensin eceran
    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, -10, -8, 20, 25, 5);
    ctx.fill();
    ctx.stroke();

    // Neck & cap
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(-4, -17, 8, 9);
    ctx.strokeRect(-4, -17, 8, 9);
    ctx.fillStyle = '#DC2626';
    roundRectPath(ctx, -5, -20, 10, 4, 1.5);
    ctx.fill();
    ctx.stroke();

    // Pertalite / golden fuel inside
    ctx.fillStyle = '#FACC15';
    roundRectPath(ctx, -8, -1, 16, 16, 3);
    ctx.fill();
    ctx.fillStyle = '#16A34A';
    ctx.fillRect(-8, -1, 16, 4);

    // Highlight
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.lineTo(-5, 11);
    ctx.stroke();
  } else if (itemId === 'mie') {
    // Bungkus Mie Instan Goreng
    ctx.fillStyle = '#FFFBEB';
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, -15, -12, 30, 24, 3);
    ctx.fill();
    ctx.stroke();

    // Red & yellow banner stripes
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-14, -11, 28, 7);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(-14, 5, 28, 6);

    // Noodle swirl illustration
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId === 'rokok') {
    // Rokok ketengan (2 sticks + matches)
    ctx.save();
    ctx.rotate(-0.18);
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2;
    roundRectPath(ctx, -11, -13, 6, 26, 1.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#D97706';
    ctx.fillRect(-11, 5, 6, 8);
    ctx.strokeRect(-11, 5, 6, 8);
    ctx.restore();

    ctx.save();
    ctx.rotate(0.14);
    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2;
    roundRectPath(ctx, -2, -14, 6, 26, 1.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#D97706';
    ctx.fillRect(-2, 4, 6, 8);
    ctx.strokeRect(-2, 4, 6, 8);
    // Tiny lit ember tip
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-2, -14, 6, 3);
    ctx.restore();

    // Mini red lighter
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 1.8;
    roundRectPath(ctx, 5, -2, 8, 15, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(6, -6, 6, 4);
    ctx.strokeRect(6, -6, 6, 4);
  } else if (itemId === 'galon') {
    // Galon Air Mineral 19L
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#0C4A6E';
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, -13, -7, 26, 24, 5);
    ctx.fill();
    ctx.stroke();

    // Ribbed ridges
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, 1);
    ctx.lineTo(12, 1);
    ctx.moveTo(-12, 8);
    ctx.lineTo(12, 8);
    ctx.stroke();

    // Shoulder & cap
    ctx.fillStyle = '#7DD3FC';
    ctx.strokeStyle = '#0C4A6E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, -7);
    ctx.lineTo(-5, -15);
    ctx.lineTo(5, -15);
    ctx.lineTo(11, -7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1D4ED8';
    roundRectPath(ctx, -5, -19, 10, 5, 1.5);
    ctx.fill();
    ctx.stroke();

    // Highlight
    ctx.strokeStyle = '#E0F2FE';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-8, -3);
    ctx.lineTo(-8, 12);
    ctx.stroke();
  } else if (itemId === 'token') {
    // Token Listrik / HP Pulsa with lightning bolt
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    roundRectPath(ctx, -12, -16, 24, 32, 4);
    ctx.fill();
    ctx.stroke();

    // Glowing screen
    ctx.fillStyle = '#FEF08A';
    roundRectPath(ctx, -9, -12, 18, 17, 2);
    ctx.fill();

    // Lightning bolt
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(2, -10);
    ctx.lineTo(-4, -2);
    ctx.lineTo(0, -2);
    ctx.lineTo(-2, 4);
    ctx.lineTo(5, -4);
    ctx.lineTo(1, -4);
    ctx.closePath();
    ctx.fill();

    // Keypad dots
    ctx.fillStyle = '#94A3B8';
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.fillRect(-7 + c * 5.5, 8 + r * 3.5, 3.5, 2);
      }
    }
  }

  ctx.restore();
}

export function renderGameFrame(ctx: CanvasRenderingContext2D, state: RenderState): void {
  const { width: W, height: H, time, waveDay } = state;

  ctx.save();
  ctx.translate(state.shakeX, state.shakeY);

  // Opening window bounds (the storefront opening looking out to the apocalyptic street)
  const sideWallW = Math.max(48, Math.min(120, W * 0.085));
  const topBeamH = Math.max(46, Math.min(72, H * 0.11));
  const counterY = H * 0.72;
  const openLeft = sideWallW;
  const openRight = W - sideWallW;
  const openW = openRight - openLeft;
  const openH = counterY - topBeamH;

  // 1. OUTSIDE APOCALYPSE SKY & STREET (visible through the warung opening)
  drawApocalypseOutside(ctx, state, openLeft, topBeamH, openW, openH, counterY);

  // 2. CUSTOMERS STANDING IN FRONT OF THE ETALASE (behind glass counter, outside)
  ctx.save();
  ctx.beginPath();
  ctx.rect(openLeft, topBeamH, openW, counterY - topBeamH + 24);
  ctx.clip();

  // Sort customers slightly so active / frontmost renders crisply
  const sortedCustomers = [...state.customers].sort((a, b) => a.id - b.id);
  for (const cust of sortedCustomers) {
    const cx = openLeft + cust.x * openW;
    const cy = counterY + 12 + cust.yOffset;
    drawCustomer(ctx, cust, cx, cy, time, Math.min(W, H));
  }
  ctx.restore();

  // 3. WARUNG INTERIOR FRAME, HANGING SACHETS, LAMP, ETALASE KACA
  drawWarungInterior(ctx, state, sideWallW, topBeamH, counterY);

  // 4. CUSTOMER SPEECH BUBBLES (above rolling door lip unless door covers them, drawn clearly)
  for (const cust of sortedCustomers) {
    if (cust.state === 'leaving_happy' || cust.state === 'leaving_angry') continue;
    const cx = openLeft + cust.x * openW;
    const cy = counterY + 12 + cust.yOffset;
    const isActive = cust.id === state.activeCustomerId;
    drawOrderBubble(ctx, cust, cx, cy, time, isActive, openLeft + 10, openRight - 10, topBeamH + 8);
  }

  // 5. CORRUGATED ROLLING DOOR BESI (slides down from topBeamH to counterY)
  if (state.doorClosedRatio > 0.005 || state.stormActive) {
    drawRollingDoor(ctx, state, openLeft, topBeamH, openW, counterY - topBeamH);
  }

  // 6. FLYING ITEMS (from bottom shelf to customer)
  for (const fly of state.flyingItems) {
    const t = fly.progress;
    const arcLift = Math.sin(t * Math.PI) * -90;
    const x = fly.startX + (fly.targetX - fly.startX) * t;
    const y = fly.startY + (fly.targetY - fly.startY) * t + arcLift;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(fly.rotation * t * Math.PI * 2);
    const scale = 1.15 - t * 0.25;
    drawVectorItem(ctx, fly.itemId, 0, 0, 44 * scale);
    ctx.restore();
  }

  // 7. PARTICLES (coins, sparks, smoke)
  for (const p of state.particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.kind === 'coin') {
      ctx.fillStyle = '#FACC15';
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#B45309';
      ctx.font = `bold ${Math.round(p.size * 1.1)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Rp', p.x, p.y + 0.5);
    } else if (p.kind === 'spark') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 8. FLOATING COMIC TEXTS ("MANTAP BOS!", "LANCAR JAYA!", "PINTU MAU NUTUP!")
  for (const ft of state.floatingTexts) {
    const alpha = Math.min(1, (ft.life / ft.maxLife) * 1.4);
    const jx = ft.jitter ? (Math.random() - 0.5) * 5 : 0;
    const jy = ft.jitter ? (Math.random() - 0.5) * 5 : 0;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(ft.x + jx, ft.y + jy);
    ctx.scale(ft.scale, ft.scale);
    ctx.font = `800 22px "Bricolage Grotesque", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1C1917';
    ctx.strokeText(ft.text, 0, 0);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, 0, 0);

    if (ft.subText) {
      ctx.font = `700 14px "JetBrains Mono", monospace`;
      ctx.lineWidth = 3.5;
      ctx.strokeText(ft.subText, 0, 22);
      ctx.fillStyle = '#FEF08A';
      ctx.fillText(ft.subText, 0, 22);
    }
    ctx.restore();
  }

  // 9. STORM WARNING SIREN BORDER & LIGHTNING FLASH
  if (state.stormActive || state.stormWarningBanner) {
    const pulse = 0.25 + 0.25 * Math.sin(time * 12);
    ctx.save();
    ctx.strokeStyle = `rgba(239, 68, 68, ${pulse + 0.25})`;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.restore();
  }

  if (state.lightningAlpha > 0.01) {
    ctx.fillStyle = `rgba(255, 250, 230, ${state.lightningAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  // Lamp flicker dark overlay inside warung when spooky visitor arrives
  if (state.lampFlicker > 0.02) {
    ctx.fillStyle = `rgba(10, 10, 20, ${state.lampFlicker * 0.45})`;
    ctx.fillRect(0, 0, W, H);
  }

  // Subtle apocalyptic vignette at higher days
  if (waveDay >= 3) {
    const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.28, W / 2, H / 2, W * 0.72);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(127, 29, 29, 0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
}

function drawApocalypseOutside(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  x: number,
  y: number,
  w: number,
  h: number,
  counterY: number
): void {
  const { waveDay, time } = state;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h + 40);
  ctx.clip();

  // Dynamic sky palette from Night -> Red Storm -> Supernova Apocalypse
  const skyGrad = ctx.createLinearGradient(0, y, 0, counterY);
  if (waveDay === 1) {
    skyGrad.addColorStop(0, '#0F172A');
    skyGrad.addColorStop(0.55, '#1E1B4B');
    skyGrad.addColorStop(1, '#3B0764');
  } else if (waveDay === 2) {
    skyGrad.addColorStop(0, '#2A0810');
    skyGrad.addColorStop(0.5, '#7F1D1D');
    skyGrad.addColorStop(1, '#C2410C');
  } else if (waveDay === 3) {
    skyGrad.addColorStop(0, '#450A0A');
    skyGrad.addColorStop(0.45, '#B91C1C');
    skyGrad.addColorStop(1, '#EA580C');
  } else {
    skyGrad.addColorStop(0, '#1C0505');
    skyGrad.addColorStop(0.35, '#991B1B');
    skyGrad.addColorStop(0.75, '#EA580C');
    skyGrad.addColorStop(1, '#FACC15');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(x, y, w, h + 40);

  // Stars on Day 1 or eerie glowing planet/red moon on Day 2+
  if (waveDay === 1) {
    ctx.fillStyle = '#E2E8F0';
    for (let i = 0; i < 24; i++) {
      const sx = x + ((i * 97) % w);
      const sy = y + 18 + ((i * 53) % (h * 0.45));
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * 2 + i));
      ctx.globalAlpha = twinkle;
      ctx.fillRect(sx, sy, 2.2, 2.2);
    }
    ctx.globalAlpha = 1;
    // Crescent moon
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(x + w * 0.82, y + h * 0.22, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.arc(x + w * 0.82 + 8, y + h * 0.22 - 4, 19, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Giant ominous Blood Moon / Asteroid Looming
    const moonR = Math.min(54, 24 + waveDay * 6);
    const moonX = x + w * 0.78;
    const moonY = y + h * 0.25;
    const moonGrad = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, moonR * 1.4);
    moonGrad.addColorStop(0, '#FEF08A');
    moonGrad.addColorStop(0.6, '#EF4444');
    moonGrad.addColorStop(1, 'rgba(239,68,68,0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Horizon & Distant City Silhouette (Jakarta + Monas!)
  const horizonY = y + h * 0.72;
  ctx.fillStyle = waveDay === 1 ? '#090D16' : '#230909';

  const buildings = [0.06, 0.14, 0.22, 0.34, 0.46, 0.58, 0.7, 0.84, 0.93];
  buildings.forEach((bx, idx) => {
    const bw = w * 0.085;
    const bh = 38 + ((idx * 29) % 58);
    ctx.fillRect(x + bx * w - bw / 2, horizonY - bh, bw, bh + 40);

    // Tiny lit building windows
    ctx.fillStyle = waveDay >= 3 ? '#FDBA74' : '#FDE047';
    for (let wy = horizonY - bh + 8; wy < horizonY - 8; wy += 12) {
      for (let wx = x + bx * w - bw / 2 + 6; wx < x + bx * w + bw / 2 - 6; wx += 10) {
        if ((Math.floor(wx + wy) + idx) % 3 !== 0) {
          ctx.fillRect(wx, wy, 4, 5);
        }
      }
    }
    ctx.fillStyle = waveDay === 1 ? '#090D16' : '#230909';
  });

  // Iconic Monas Silhouette in the background
  const monasX = x + w * 0.28;
  ctx.fillStyle = waveDay === 1 ? '#0F172A' : '#2A0A0A';
  ctx.fillRect(monasX - 18, horizonY - 20, 36, 20);
  ctx.beginPath();
  ctx.moveTo(monasX - 6, horizonY - 20);
  ctx.lineTo(monasX - 3, horizonY - 98);
  ctx.lineTo(monasX + 3, horizonY - 98);
  ctx.lineTo(monasX + 6, horizonY - 20);
  ctx.closePath();
  ctx.fill();
  // Monas gold flame on top!
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.moveTo(monasX, horizonY - 112);
  ctx.lineTo(monasX - 5, horizonY - 98);
  ctx.lineTo(monasX + 5, horizonY - 98);
  ctx.closePath();
  ctx.fill();

  // Distant Volcano / Fire Glow on Day 3+
  if (waveDay >= 3) {
    const fireGlow = ctx.createLinearGradient(0, horizonY - 35, 0, horizonY + 15);
    fireGlow.addColorStop(0, 'rgba(251, 146, 60, 0)');
    fireGlow.addColorStop(1, 'rgba(239, 68, 68, 0.55)');
    ctx.fillStyle = fireGlow;
    ctx.fillRect(x, horizonY - 35, w, 50);
  }

  // UFOs in the background sky (Day 2+)
  for (const ufo of state.ufos) {
    const ux = x + ufo.x * w;
    const uy = y + ufo.y * h + Math.sin(time * 3 + ufo.phase) * 8;
    ctx.save();
    ctx.translate(ux, uy);
    ctx.scale(ufo.scale, ufo.scale);

    // Tractor beam
    if (ufo.beamActive) {
      const beamGrad = ctx.createLinearGradient(0, 6, 0, 110);
      beamGrad.addColorStop(0, 'rgba(74, 222, 128, 0.45)');
      beamGrad.addColorStop(1, 'rgba(74, 222, 128, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-12, 6);
      ctx.lineTo(12, 6);
      ctx.lineTo(36, 110);
      ctx.lineTo(-36, 110);
      ctx.closePath();
      ctx.fill();
    }

    // Saucer dome & body
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(0, -4, 14, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#94A3B8';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Blinking UFO lights
    for (let i = -2; i <= 2; i++) {
      ctx.fillStyle = (Math.floor(time * 8 + i) % 2 === 0) ? '#4ADE80' : '#FACC15';
      ctx.beginPath();
      ctx.arc(i * 10, 0, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Falling Meteors
  for (const m of state.meteors) {
    if (m.trail.length > 1) {
      for (let i = 0; i < m.trail.length - 1; i++) {
        const pt = m.trail[i];
        const ratio = i / m.trail.length;
        ctx.strokeStyle = `rgba(251, 146, 60, ${ratio * 0.85})`;
        ctx.lineWidth = Math.max(1, m.size * ratio * 1.4);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(m.trail[i + 1].x, m.trail[i + 1].y);
        ctx.stroke();
      }
    }
    // Blazing meteor rock
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7C2D12';
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size * 0.72, 0, Math.PI * 2);
    ctx.fill();
  }

  // Street asphalt & sidewalk outside the Warung
  ctx.fillStyle = waveDay === 1 ? '#1E293B' : '#291D1D';
  ctx.fillRect(x, horizonY, w, counterY - horizonY + 30);

  // Dashed street line
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 16]);
  ctx.beginPath();
  ctx.moveTo(x, horizonY + (counterY - horizonY) * 0.36);
  ctx.lineTo(x + w, horizonY + (counterY - horizonY) * 0.36);
  ctx.stroke();
  ctx.setLineDash([]);

  // Street Lamp outside
  const lampX = x + w * 0.12;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(lampX, horizonY + 12);
  ctx.lineTo(lampX, horizonY - 82);
  ctx.lineTo(lampX + 24, horizonY - 82);
  ctx.stroke();
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(lampX + 24, horizonY - 78, 5, 0, Math.PI * 2);
  ctx.fill();

  // Dinosaur running across the background road in Day 4+!
  if (state.dino.active) {
    drawBackgroundDino(ctx, x + state.dino.x * w, horizonY + 18, state.dino.dir, state.dino.stepPhase);
  }

  ctx.restore();
}

function drawBackgroundDino(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 1 | -1,
  stepPhase: number
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  const bounce = Math.abs(Math.sin(stepPhase)) * 5;
  ctx.translate(0, -bounce);

  // Tail + Body (comical silhouette T-Rex)
  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = '#052E16';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-42, -8);
  ctx.quadraticCurveTo(-18, -22, 6, -24);
  ctx.lineTo(18, -42);
  ctx.lineTo(36, -42);
  ctx.lineTo(36, -30);
  ctx.lineTo(24, -28);
  ctx.lineTo(18, -6);
  ctx.quadraticCurveTo(-10, 4, -42, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tiny T-Rex arm!
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(16, -20);
  ctx.lineTo(24, -17);
  ctx.stroke();

  // Legs
  const legA = Math.sin(stepPhase) * 7;
  const legB = -Math.sin(stepPhase) * 7;
  ctx.strokeStyle = '#14532D';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-2, -6);
  ctx.lineTo(-2 + legA, 10);
  ctx.moveTo(8, -6);
  ctx.lineTo(8 + legB, 10);
  ctx.stroke();

  // Googly panicking eye
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(28, -36, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(29.5, -36, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWarungInterior(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  sideWallW: number,
  topBeamH: number,
  counterY: number
): void {
  const { width: W, height: H, time } = state;

  // Warm interior glow (Warung stays brightly lit!)
  const warmGlow = ctx.createRadialGradient(
    W / 2,
    topBeamH + 30,
    20,
    W / 2,
    counterY,
    W * 0.65
  );
  warmGlow.addColorStop(0, 'rgba(254, 249, 195, 0.14)');
  warmGlow.addColorStop(1, 'rgba(254, 243, 199, 0.02)');
  ctx.fillStyle = warmGlow;
  ctx.fillRect(sideWallW, topBeamH, W - sideWallW * 2, counterY - topBeamH);

  // Left & Right Warung Walls (iconic warm teal/cream concrete + wooden trim)
  const wallGradLeft = ctx.createLinearGradient(0, 0, sideWallW, 0);
  wallGradLeft.addColorStop(0, '#0F766E');
  wallGradLeft.addColorStop(1, '#115E59');
  ctx.fillStyle = wallGradLeft;
  ctx.fillRect(0, 0, sideWallW, counterY);

  const wallGradRight = ctx.createLinearGradient(W - sideWallW, 0, W, 0);
  wallGradRight.addColorStop(0, '#115E59');
  wallGradRight.addColorStop(1, '#0F766E');
  ctx.fillStyle = wallGradRight;
  ctx.fillRect(W - sideWallW, 0, sideWallW, counterY);

  // Wooden pillar trim framing the window
  ctx.fillStyle = '#78350F';
  ctx.fillRect(sideWallW - 10, topBeamH, 10, counterY - topBeamH);
  ctx.fillRect(W - sideWallW, topBeamH, 10, counterY - topBeamH);

  // Left wall: Iconic Pertamini / Bensin Eceran wooden bottle rack + snack jar!
  if (sideWallW >= 62) {
    const rackX = 10;
    const rackW = sideWallW - 24;
    ctx.fillStyle = '#92400E';
    ctx.fillRect(rackX, topBeamH + 54, rackW, 8);
    ctx.fillRect(rackX, topBeamH + 128, rackW, 8);

    // Mini glass bottles of Bensin Eceran on the shelf
    const bottleCount = Math.max(2, Math.floor(rackW / 18));
    for (let i = 0; i < bottleCount; i++) {
      const bx = rackX + 9 + i * 18;
      const by = topBeamH + 54;
      ctx.fillStyle = i % 2 === 0 ? '#FACC15' : '#38BDF8';
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, bx - 5, by - 26, 10, 26, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(bx - 3, by - 31, 6, 5);
    }

    // Kerupuk Jar ("Toples Kerupuk") on lower shelf
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, rackX + 6, topBeamH + 86, rackW - 12, 42, 6);
    ctx.fill();
    ctx.stroke();
    // Kerupuk inside
    ctx.fillStyle = '#FDE68A';
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.arc(rackX + 18 + (k % 2) * 14, topBeamH + 100 + Math.floor(k / 2) * 14, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#DC2626';
    roundRectPath(ctx, rackX + 4, topBeamH + 80, rackW - 8, 8, 3);
    ctx.fill();
  }

  // Right wall: Hanging colorful Rencengan Sachet (kopi & snack packets!)
  if (sideWallW >= 62) {
    const sachetColors = ['#DC2626', '#FACC15', '#2563EB', '#16A34A', '#F97316'];
    const sx = W - sideWallW + 18;
    const sway = Math.sin(time * 2.1) * 3;
    for (let i = 0; i < 5; i++) {
      const sy = topBeamH + 28 + i * 32;
      ctx.save();
      ctx.translate(sx + sway * (i * 0.25), sy);
      ctx.fillStyle = sachetColors[i % sachetColors.length];
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, 0, 0, Math.min(38, sideWallW - 32), 26, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(4, 6, Math.min(20, sideWallW - 44), 5);
      ctx.restore();
    }
  }

  // Top Header Beam & Spanduk Warung Madura
  ctx.fillStyle = '#78350F';
  ctx.fillRect(0, 0, W, topBeamH);

  // Iconic green/yellow/red Spanduk strip across the top beam
  const bannerW = Math.min(540, W - sideWallW * 2 - 20);
  const bannerX = (W - bannerW) / 2;
  const bannerY = 6;
  const bannerH = topBeamH - 12;

  ctx.fillStyle = '#15803D';
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 3;
  roundRectPath(ctx, bannerX, bannerY, bannerW, bannerH, 6);
  ctx.fill();
  ctx.stroke();

  // Red & Yellow corner accents on spanduk
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(bannerX + 8, bannerY + 6, 12, bannerH - 12);
  ctx.fillRect(bannerX + bannerW - 20, bannerY + 6, 12, bannerH - 12);

  ctx.fillStyle = '#FEF08A';
  ctx.font = `800 ${Math.max(13, Math.min(18, bannerW * 0.042))}px "Bricolage Grotesque", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WARUNG MADURA 24 JAM · KIAMAT TETAP BUKA', W / 2, bannerY + bannerH / 2 + 1);

  // Hanging Rencengan Sachet along the top edges inside the window!
  const topRencenganCount = 4;
  for (let i = 0; i < topRencenganCount; i++) {
    const rx = sideWallW + 22 + i * 26;
    const rxRight = W - sideWallW - 22 - i * 26;
    const swing = Math.sin(time * 2.5 + i) * 3;
    [rx, rxRight].forEach((px, sideIdx) => {
      if (px > W / 2 - 120 && px < W / 2 + 120) return;
      ctx.save();
      ctx.translate(px, topBeamH);
      ctx.rotate((swing * Math.PI) / 180);
      ctx.fillStyle = (i + sideIdx) % 2 === 0 ? '#EF4444' : '#FACC15';
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 1.5;
      roundRectPath(ctx, -9, 2, 18, 22, 2);
      ctx.fill();
      ctx.stroke();
      roundRectPath(ctx, -9, 26, 18, 22, 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  // Hanging Fluorescent Tube Light (Lampu TL) right below topBeamH
  const tubeW = Math.min(240, (W - sideWallW * 2) * 0.45);
  const tubeX = W / 2 - tubeW / 2;
  const tubeY = topBeamH + 6;
  const bulbBright = state.lampFlicker > 0.15 ? 0.3 : 1;
  ctx.save();
  ctx.globalAlpha = bulbBright;
  ctx.shadowColor = '#FEF9C3';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#FFFFFF';
  roundRectPath(ctx, tubeX, tubeY, tubeW, 7, 3);
  ctx.fill();
  ctx.restore();

  // FOREGROUND: ETALASE KACA (Glass Display Counter)
  const counterH = H - counterY;

  // Countertop Wooden/Aluminum Sill
  ctx.fillStyle = '#92400E';
  ctx.fillRect(0, counterY, W, 14);
  ctx.fillStyle = '#B45309';
  ctx.fillRect(0, counterY, W, 5);

  // Glass Showcase Box (Etalase Kaca)
  const glassTop = counterY + 14;
  const glassH = Math.max(80, counterH - 14);
  const etaGrad = ctx.createLinearGradient(0, glassTop, 0, H);
  etaGrad.addColorStop(0, '#334155');
  etaGrad.addColorStop(0.5, '#1E293B');
  etaGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = etaGrad;
  ctx.fillRect(0, glassTop, W, glassH);

  // Glass window pane inside aluminum frame showing colorful snacks inside etalase!
  const paneX = Math.max(24, sideWallW * 0.5);
  const paneW = W - paneX * 2;
  const paneY = glassTop + 8;
  const paneH = Math.max(46, glassH - 16);

  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 4;
  roundRectPath(ctx, paneX, paneY, paneW, paneH, 6);
  ctx.fill();
  ctx.stroke();

  // Middle glass shelf inside Etalase
  ctx.fillStyle = 'rgba(226, 232, 240, 0.22)';
  ctx.fillRect(paneX + 6, paneY + paneH * 0.48, paneW - 12, 4);

  // Colorful snacks/cigarette packs/noodles arranged inside the etalase!
  const cols = Math.floor((paneW - 40) / 48);
  const snackPalette = ['#EF4444', '#FACC15', '#38BDF8', '#22C55E', '#F97316', '#A855F7'];
  for (let i = 0; i < cols; i++) {
    const ix = paneX + 20 + i * 48;
    ctx.fillStyle = snackPalette[i % snackPalette.length];
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, ix, paneY + 8, 28, Math.max(18, paneH * 0.36), 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = snackPalette[(i + 2) % snackPalette.length];
    roundRectPath(ctx, ix + 4, paneY + paneH * 0.56, 26, Math.max(18, paneH * 0.34), 3);
    ctx.fill();
    ctx.stroke();
  }

  // Diagonal Glass Reflections across the Etalase
  ctx.save();
  ctx.beginPath();
  roundRectPath(ctx, paneX, paneY, paneW, paneH, 6);
  ctx.clip();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let r = 0; r < 4; r++) {
    const rx = paneX + r * (paneW * 0.28) + 30;
    ctx.beginPath();
    ctx.moveTo(rx, paneY);
    ctx.lineTo(rx + 42, paneY);
    ctx.lineTo(rx - 18, paneY + paneH);
    ctx.lineTo(rx - 60, paneY + paneH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Cash Kaleng / Kotak Duit & Calculator sitting on top of the counter!
  const boxX = sideWallW + 14;
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2;
  roundRectPath(ctx, boxX, counterY - 22, 46, 24, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(boxX + 6, counterY - 14, 34, 6);
}

function drawCustomer(
  ctx: CanvasRenderingContext2D,
  cust: Customer,
  cx: number,
  cy: number,
  time: number,
  minDim: number
): void {
  ctx.save();
  ctx.globalAlpha = cust.alpha;

  // Responsive scale based on viewport height/width
  const s = Math.max(0.75, Math.min(1.22, minDim / 640)) * cust.scale;
  const bob =
    cust.type === 'pocong'
      ? Math.abs(Math.sin(time * 5.2 + cust.bobPhase)) * -18
      : cust.type === 'kuntilanak'
      ? Math.sin(time * 3.1 + cust.bobPhase) * 9 - 10
      : Math.sin(time * 4.5 + cust.bobPhase) * 3;

  const shakeX = cust.reactTimer > 0 && cust.reactType === 'wrong' ? Math.sin(time * 45) * 6 : 0;

  ctx.translate(cx + shakeX, cy + bob);
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 3;

  const patienceRatio = Math.max(0, cust.patience / cust.maxPatience);
  const isImpatient = patienceRatio < 0.35;

  if (cust.type === 'pocong') {
    // Bound white shroud body
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.moveTo(0, -148);
    ctx.quadraticCurveTo(-18, -135, -14, -118);
    ctx.quadraticCurveTo(-34, -95, -28, -40);
    ctx.lineTo(-22, 0);
    ctx.lineTo(22, 0);
    ctx.lineTo(28, -40);
    ctx.quadraticCurveTo(34, -95, 14, -118);
    ctx.quadraticCurveTo(18, -135, 0, -148);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shroud tie cords (top knot & mid tie)
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-13, -118);
    ctx.lineTo(13, -118);
    ctx.moveTo(-26, -42);
    ctx.lineTo(26, -42);
    ctx.stroke();

    // Face opening (shadowy + glowing goofy eyes)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(0, -90, 17, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isImpatient ? '#EF4444' : '#FEF08A';
    ctx.beginPath();
    ctx.arc(-6, -93, 4.2, 0, Math.PI * 2);
    ctx.arc(6, -93, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-6, -93, 1.8, 0, Math.PI * 2);
    ctx.arc(6, -93, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Little mouth
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -80, 5, 0, Math.PI);
    ctx.stroke();
  } else if (cust.type === 'kuntilanak') {
    // Eerie aura
    ctx.fillStyle = 'rgba(167, 243, 208, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, -68, 42, 72, 0, 0, Math.PI * 2);
    ctx.fill();

    // Long flowing black hair behind
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.moveTo(-28, -96);
    ctx.quadraticCurveTo(-36, -40, -32, 0);
    ctx.lineTo(32, 0);
    ctx.quadraticCurveTo(36, -40, 28, -96);
    ctx.closePath();
    ctx.fill();

    // White dress
    ctx.fillStyle = '#F1F5F9';
    ctx.strokeStyle = '#1C1917';
    ctx.beginPath();
    ctx.moveTo(-20, -68);
    ctx.lineTo(-28, 0);
    ctx.lineTo(28, 0);
    ctx.lineTo(20, -68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pale face
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.arc(0, -94, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair bangs framing face
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(0, -98, 22, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // Eyes & eerie grin
    ctx.fillStyle = isImpatient ? '#DC2626' : '#1E293B';
    ctx.beginPath();
    ctx.arc(-7, -92, 3.2, 0, Math.PI * 2);
    ctx.arc(7, -92, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, -83, 6, 0.1, Math.PI - 0.1);
    ctx.stroke();
  } else if (cust.type === 'alien') {
    // Sci-fi spacesuit torso
    ctx.fillStyle = '#6366F1';
    roundRectPath(ctx, -28, -68, 56, 70, 14);
    ctx.fill();
    ctx.stroke();

    // Glowing UFO belt buckle
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.arc(0, -36, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Antennae
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -118);
    ctx.lineTo(-18, -138);
    ctx.moveTo(10, -118);
    ctx.lineTo(18, -138);
    ctx.stroke();
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.arc(-18, -138, 5, 0, Math.PI * 2);
    ctx.arc(18, -138, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lime green alien head
    ctx.fillStyle = '#84CC16';
    ctx.beginPath();
    ctx.ellipse(0, -94, 26, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Giant glossy black alien eyes
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(-10, -95, 7, 10, -0.25, 0, Math.PI * 2);
    ctx.ellipse(10, -95, 7, 10, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-12, -98, 2.5, 0, Math.PI * 2);
    ctx.arc(8, -98, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (isImpatient) {
      ctx.arc(0, -76, 6, Math.PI, 0);
    } else {
      ctx.arc(0, -80, 6, 0, Math.PI);
    }
    ctx.stroke();
  } else if (cust.type === 'astronot') {
    // Bulky white spacesuit
    ctx.fillStyle = '#F8FAFC';
    roundRectPath(ctx, -32, -70, 64, 72, 16);
    ctx.fill();
    ctx.stroke();

    // Indonesian flag chest patch!
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(8, -54, 14, 5);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(8, -49, 14, 5);
    ctx.strokeRect(8, -54, 14, 10);

    // Helmet
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(0, -96, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gold reflective visor
    const visorGrad = ctx.createLinearGradient(-18, -110, 18, -80);
    visorGrad.addColorStop(0, '#FDE047');
    visorGrad.addColorStop(1, '#D97706');
    ctx.fillStyle = visorGrad;
    roundRectPath(ctx, -21, -110, 42, 28, 12);
    ctx.fill();
    ctx.stroke();

    // Visor shine & crack
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-14, -104);
    ctx.lineTo(-6, -104);
    ctx.stroke();
  } else {
    // Warga Biasa, Ojol, or Emak-Emak Daster!
    // Torso / shirt / daster
    ctx.fillStyle = cust.shirtColor;
    roundRectPath(ctx, -30, -68, 60, 70, 14);
    ctx.fill();
    ctx.stroke();

    if (cust.type === 'ojol') {
      // Iconic black shoulder stripes on green Ojol jacket
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(-30, -54, 60, 10);
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(-10, -40, 20, 6);
    } else if (cust.type === 'emak') {
      // Floral dots on Daster
      ctx.fillStyle = '#FEF08A';
      for (const [fx, fy] of [
        [-14, -50],
        [10, -44],
        [-6, -24],
        [16, -20],
      ]) {
        ctx.beginPath();
        ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Head
    ctx.fillStyle = cust.skinColor;
    ctx.beginPath();
    ctx.arc(0, -94, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Headgear / Hair
    if (cust.type === 'ojol') {
      // Green Ojol Helmet + Visor
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.arc(0, -98, 27, Math.PI * 0.92, Math.PI * 2.08);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0F172A';
      roundRectPath(ctx, -20, -112, 40, 10, 4);
      ctx.fill();
    } else if (cust.type === 'emak') {
      // Bun & Pink Hair Curlers (Rol Rambut!)
      ctx.fillStyle = '#1C1917';
      ctx.beginPath();
      ctx.arc(0, -102, 24, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F472B6';
      roundRectPath(ctx, -18, -124, 14, 10, 4);
      ctx.fill();
      ctx.stroke();
      roundRectPath(ctx, 4, -124, 14, 10, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      // Warga casual hair or Kopiah
      ctx.fillStyle = '#1C1917';
      roundRectPath(ctx, -20, -122, 40, 16, 4);
      ctx.fill();
      ctx.stroke();
    }

    // Expressive Eyes & Eyebrows
    ctx.fillStyle = '#1C1917';
    ctx.beginPath();
    ctx.arc(-8, -92, 3.2, 0, Math.PI * 2);
    ctx.arc(8, -92, 3.2, 0, Math.PI * 2);
    ctx.fill();

    if (isImpatient) {
      // Furrowed angry eyebrows + sweat drop!
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-13, -101);
      ctx.lineTo(-4, -97);
      ctx.moveTo(13, -101);
      ctx.lineTo(4, -97);
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(20, -100, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (isImpatient) {
      ctx.arc(0, -76, 6, Math.PI, 0);
    } else {
      ctx.arc(0, -82, 6, 0.15, Math.PI - 0.15);
    }
    ctx.stroke();
  }

  ctx.restore();
}

function drawOrderBubble(
  ctx: CanvasRenderingContext2D,
  cust: Customer,
  cx: number,
  cy: number,
  time: number,
  isActive: boolean,
  minX: number,
  maxX: number,
  minY: number
): void {
  const itemCount = cust.order.length;
  const slotW = 48;
  const bubbleW = Math.max(150, itemCount * slotW + 28);
  const bubbleH = 92;

  const rawX = cx - bubbleW / 2;
  const bx = Math.max(minX, Math.min(maxX - bubbleW, rawX));
  const rawY = cy - 228;
  const by = Math.max(minY, rawY);

  const jx = cust.isSpooky ? Math.sin(time * 38 + cust.id) * 2.2 : 0;
  const jy = cust.isSpooky ? Math.cos(time * 43 + cust.id) * 2.2 : 0;

  ctx.save();
  ctx.translate(jx, jy);

  // Bubble shadow & body
  ctx.fillStyle = isActive ? '#FFFFFF' : 'rgba(248, 250, 252, 0.9)';
  ctx.strokeStyle = isActive ? '#F59E0B' : '#334155';
  ctx.lineWidth = isActive ? 3.5 : 2;
  roundRectPath(ctx, bx, by, bubbleW, bubbleH, 14);
  ctx.fill();
  ctx.stroke();

  // Bubble pointer tail
  const tailX = Math.max(bx + 18, Math.min(bx + bubbleW - 18, cx));
  ctx.fillStyle = isActive ? '#FFFFFF' : 'rgba(248, 250, 252, 0.9)';
  ctx.beginPath();
  ctx.moveTo(tailX - 8, by + bubbleH - 1);
  ctx.lineTo(tailX, by + bubbleH + 11);
  ctx.lineTo(tailX + 8, by + bubbleH - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Customer quote / name tag inside top of bubble
  ctx.fillStyle = cust.isSpooky ? '#6B21A8' : '#1E293B';
  ctx.font = `700 11px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const headerLabel = cust.label;
  ctx.fillText(headerLabel, bx + bubbleW / 2, by + 7);

  // Item slots
  const startX = bx + (bubbleW - itemCount * slotW) / 2 + slotW / 2;
  const itemY = by + 41;

  cust.order.forEach((itemId, idx) => {
    const ix = startX + idx * slotW;
    const isDone = idx < cust.fulfilledCount;
    const isNext = idx === cust.fulfilledCount && isActive;

    ctx.save();
    if (isNext) {
      const pulse = 1 + Math.sin(time * 8) * 0.06;
      ctx.translate(ix, itemY);
      ctx.scale(pulse, pulse);
      ctx.translate(-ix, -itemY);
      ctx.fillStyle = '#FEF3C7';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.2;
      roundRectPath(ctx, ix - 20, itemY - 20, 40, 40, 9);
      ctx.fill();
      ctx.stroke();
    } else if (isDone) {
      ctx.fillStyle = '#DCFCE7';
      roundRectPath(ctx, ix - 20, itemY - 20, 40, 40, 9);
      ctx.fill();
      ctx.globalAlpha = 0.4;
    } else {
      ctx.fillStyle = '#F1F5F9';
      roundRectPath(ctx, ix - 20, itemY - 20, 40, 40, 9);
      ctx.fill();
    }

    drawVectorItem(ctx, itemId, ix, itemY, 34);
    ctx.restore();

    if (isDone) {
      // Crisp green checkmark badge
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.arc(ix + 13, itemY - 13, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ix + 9, itemY - 13);
      ctx.lineTo(ix + 12, itemY - 10);
      ctx.lineTo(ix + 17, itemY - 16);
      ctx.stroke();
    } else {
      // Show key hint number [1]-[5] subtly beneath each item
      const itemConf = ITEM_MAP[itemId];
      ctx.fillStyle = isNext ? '#B45309' : '#64748B';
      ctx.font = `800 10px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`[${itemConf.key}]`, ix, itemY + 25);
    }
  });

  // Patience Bar with non-hue-only text status
  const barW = bubbleW - 24;
  const barH = 8;
  const barX = bx + 12;
  const barY = by + bubbleH - 15;
  const ratio = Math.max(0, Math.min(1, cust.patience / cust.maxPatience));

  ctx.fillStyle = '#E2E8F0';
  roundRectPath(ctx, barX, barY, barW, barH, 4);
  ctx.fill();

  const barColor = ratio > 0.55 ? '#16A34A' : ratio > 0.28 ? '#F59E0B' : '#DC2626';
  ctx.fillStyle = barColor;
  if (ratio > 0.01) {
    roundRectPath(ctx, barX, barY, Math.max(6, barW * ratio), barH, 4);
    ctx.fill();
  }

  // Urgent label when < 28%
  if (ratio <= 0.28 && Math.floor(time * 6) % 2 === 0) {
    ctx.fillStyle = '#DC2626';
    ctx.font = `800 10px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('MAU KABUR!', bx + bubbleW / 2, by - 9);
  }

  ctx.restore();
}

function drawRollingDoor(
  ctx: CanvasRenderingContext2D,
  state: RenderState,
  x: number,
  y: number,
  w: number,
  maxDropH: number
): void {
  const dropH = Math.max(18, state.doorClosedRatio * maxDropH);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, dropH + 14);
  ctx.clip();

  // Corrugated steel background
  const doorGrad = ctx.createLinearGradient(x, 0, x + w, 0);
  doorGrad.addColorStop(0, '#475569');
  doorGrad.addColorStop(0.5, '#64748B');
  doorGrad.addColorStop(1, '#334155');
  ctx.fillStyle = doorGrad;
  ctx.fillRect(x, y, w, dropH);

  // Horizontal metal slats
  const slatH = 16;
  for (let sy = y; sy < y + dropH; sy += slatH) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x, sy, w, 4);
    ctx.fillStyle = 'rgba(15,23,42,0.45)';
    ctx.fillRect(x, sy + slatH - 3, w, 3);
  }

  // Classic faded Warung Madura stencil on shutter
  if (dropH > 90) {
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.font = `800 ${Math.min(34, w * 0.055)}px "Bricolage Grotesque", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BUKA 24 JAM', x + w / 2, y + dropH * 0.45);
  }

  // Bottom caution bar & steel handle
  const lipY = y + dropH - 16;
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(x, lipY, w, 16);

  // Black diagonal hazard stripes
  ctx.fillStyle = '#1C1917';
  for (let hx = x - 20; hx < x + w + 20; hx += 32) {
    ctx.beginPath();
    ctx.moveTo(hx, lipY);
    ctx.lineTo(hx + 16, lipY);
    ctx.lineTo(hx + 6, lipY + 16);
    ctx.lineTo(hx - 10, lipY + 16);
    ctx.closePath();
    ctx.fill();
  }

  // Pull handle in the middle
  const handleW = 100;
  const handleX = x + w / 2 - handleW / 2;
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  roundRectPath(ctx, handleX, lipY - 6, handleW, 14, 6);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // Clear prompt right below the rolling door lip during storm
  if (state.stormActive || state.doorClosedRatio > 0.08) {
    const promptY = Math.min(y + maxDropH - 22, y + dropH + 20);
    ctx.save();
    ctx.fillStyle = 'rgba(127, 29, 29, 0.92)';
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.5;
    roundRectPath(ctx, x + w / 2 - 145, promptY - 15, 290, 30, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FEF08A';
    ctx.font = `800 13px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TAHAN PINTU! [SPASI] / GESER ATAS ↑', x + w / 2, promptY);
    ctx.restore();
  }
}
