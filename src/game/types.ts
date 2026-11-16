export type GameStatus = 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type ItemId = 'bensin' | 'mie' | 'rokok' | 'galon' | 'token';

export type CustomerType =
  | 'warga'
  | 'ojol'
  | 'emak'
  | 'pocong'
  | 'kuntilanak'
  | 'alien'
  | 'astronot';

export type GameOverReason = 'ROLLING_DOOR' | 'CUSTOMERS_LEFT' | null;

export interface ItemConfig {
  id: ItemId;
  key: string;
  name: string;
  shortName: string;
  price: number;
  accentColor: string;
  bgTint: string;
}

export interface Customer {
  id: number;
  type: CustomerType;
  label: string;
  quote: string;
  order: ItemId[];
  fulfilledCount: number;
  patience: number;
  maxPatience: number;
  x: number; // normalized 0..1 across counter
  yOffset: number;
  targetX: number;
  state: 'entering' | 'waiting' | 'leaving_happy' | 'leaving_angry';
  bobPhase: number;
  scale: number;
  alpha: number;
  shirtColor: string;
  skinColor: string;
  isSpooky: boolean;
  reactTimer: number;
  reactType: 'none' | 'wrong' | 'served_part';
}

export interface FlyingItem {
  id: number;
  itemId: ItemId;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  rotation: number;
  isWrong: boolean;
}

export interface FloatingText {
  id: number;
  text: string;
  subText?: string;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  scale: number;
  jitter?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity: number;
  kind: 'coin' | 'spark' | 'smoke' | 'star';
}

export interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  trail: { x: number; y: number }[];
  exploded: boolean;
}

export interface Ufo {
  x: number;
  y: number;
  vx: number;
  phase: number;
  beamActive: boolean;
  scale: number;
}

export interface Dino {
  active: boolean;
  x: number;
  dir: 1 | -1;
  stepPhase: number;
}

export interface HudSnapshot {
  status: GameStatus;
  omzet: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  servedCount: number;
  waveDay: number;
  waveTitle: string;
  strikes: number;
  maxStrikes: number;
  doorClosedRatio: number; // 0 = fully open, 1 = fully closed (Game Over)
  stormActive: boolean;
  stormWarningBanner: boolean;
  lampFlicker: number;
  muted: boolean;
  gameOverReason: GameOverReason;
  activeCustomerOrder: ItemId[] | null;
  activeCustomerFulfilled: number;
}
