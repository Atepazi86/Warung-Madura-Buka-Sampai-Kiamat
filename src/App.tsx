import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, ShieldAlert, Store, Volume2, VolumeX } from 'lucide-react';
import { ItemIcon } from './components/ItemIcon';
import { WarungAudio } from './game/audio';
import { ITEMS } from './game/constants';
import { WarungGameEngine } from './game/engine';
import { HudSnapshot, ItemId } from './game/types';

const INITIAL_HUD: HudSnapshot = {
  status: 'START',
  omzet: 0,
  highScore: 0,
  combo: 0,
  maxCombo: 0,
  servedCount: 0,
  waveDay: 1,
  waveTitle: 'Hari ke-1 · Malam Biasa',
  strikes: 0,
  maxStrikes: 3,
  doorClosedRatio: 0,
  stormActive: false,
  stormWarningBanner: false,
  lampFlicker: 0,
  muted: false,
  gameOverReason: null,
  activeCustomerOrder: null,
  activeCustomerFulfilled: 0,
};

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<WarungGameEngine | null>(null);
  const dragLastYRef = useRef<number | null>(null);
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const audio = new WarungAudio();
    const engine = new WarungGameEngine(canvas, audio, (snapshot) => {
      setHud(snapshot);
    });
    engineRef.current = engine;

    const resizeObserver = new ResizeObserver(() => {
      engine.resize();
    });
    resizeObserver.observe(canvas);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key, 10) - 1;
        const item = ITEMS[idx];
        if (item) {
          setPressedKey(e.key);
          engine.serveItem(item.id);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) {
          setPressedKey('SPACE');
          engine.pushRollingDoor(0.14);
        }
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        engine.togglePause();
      } else if (e.key === 'm' || e.key === 'M') {
        engine.toggleMute();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.key >= '1' && e.key <= '5') || e.code === 'Space') {
        setPressedKey(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const handleServe = (id: ItemId) => {
    engineRef.current?.serveItem(id);
  };

  const handlePushDoor = () => {
    engineRef.current?.pushRollingDoor(0.15);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragLastYRef.current = e.clientY;
    engineRef.current?.handleCanvasClick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragLastYRef.current === null) return;
    const dy = e.clientY - dragLastYRef.current;
    dragLastYRef.current = e.clientY;
    if (dy < -2) {
      engineRef.current?.dragRollingDoor(dy);
    }
  };

  const handlePointerUp = () => {
    dragLastYRef.current = null;
  };

  const nextExpectedItem =
    hud.activeCustomerOrder && hud.activeCustomerFulfilled < hud.activeCustomerOrder.length
      ? hud.activeCustomerOrder[hud.activeCustomerFulfilled]
      : null;

  const remainingLives = Math.max(0, hud.maxStrikes - hud.strikes);
  const doorDangerPct = Math.round(hud.doorClosedRatio * 100);

  return (
    <div className="h-screen w-screen flex flex-col bg-stone-950 text-stone-100 overflow-hidden select-none">
      {/* Top Arcade HUD Bar */}
      <header className="shrink-0 bg-stone-900 border-b border-stone-800 px-3 sm:px-5 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-stone-400 hidden sm:inline">Omzet</span>
            <span className="font-mono-nums text-base sm:text-xl font-extrabold text-amber-400">
              {formatRupiah(hud.omzet)}
            </span>
          </div>

          <span className="text-stone-700" aria-hidden="true">·</span>

          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-xs font-medium text-stone-400">Combo</span>
            <span
              className={`font-mono-nums text-sm sm:text-base font-bold ${
                hud.combo >= 3
                  ? 'text-emerald-400'
                  : hud.combo >= 1
                  ? 'text-stone-100'
                  : 'text-stone-500'
              }`}
            >
              {hud.combo}x
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-stone-200 truncate">
          <span className="text-red-400 font-bold whitespace-nowrap">{hud.waveTitle}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap"
            title="Sisa kesempatan sebelum pelanggan kabur semua"
          >
            <Store
              className={`w-4 h-4 ${
                remainingLives === 1 ? 'text-red-400' : 'text-emerald-400'
              }`}
            />
            <span className="font-mono-nums text-stone-200">
              {remainingLives}/{hud.maxStrikes}
            </span>
          </div>

          {hud.status === 'PLAYING' || hud.status === 'PAUSED' ? (
            <button
              type="button"
              onClick={() => engineRef.current?.togglePause()}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
              aria-label={hud.status === 'PAUSED' ? 'Lanjutkan Game' : 'Jeda Game'}
              title={hud.status === 'PAUSED' ? 'Lanjutkan (P)' : 'Jeda (P)'}
            >
              {hud.status === 'PAUSED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => engineRef.current?.toggleMute()}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
            aria-label={hud.muted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            title={hud.muted ? 'Nyalakan Suara (M)' : 'Bisukan Suara (M)'}
          >
            {hud.muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Wave Sub-strip */}
      <div className="md:hidden shrink-0 bg-stone-900/90 border-b border-stone-800 px-3 py-1 flex items-center justify-between text-xs text-stone-300">
        <span className="font-semibold text-amber-300 truncate">{hud.waveTitle}</span>
        <span className="font-mono-nums text-stone-400 whitespace-nowrap">
          Dilayani: {hud.servedCount}
        </span>
      </div>

      {/* Main Canvas Stage */}
      <main className="relative flex-1 min-h-0 w-full bg-stone-950">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="block w-full h-full touch-none cursor-pointer"
        />

        {/* Storm Warning Banner during active gameplay */}
        {hud.status === 'PLAYING' && (hud.stormWarningBanner || hud.stormActive) && (
          <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[min(92vw,460px)]">
            <div className="bg-red-950/95 border-2 border-amber-400 rounded-xl px-4 py-2.5 shadow-xl">
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-extrabold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>AWAS BADAI METEOR / ANGIN KIAMAT!</span>
                </span>
                <span className="font-mono-nums text-white">{doorDangerPct}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full bg-stone-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-75"
                  style={{ width: `${Math.min(100, doorDangerPct)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* START SCREEN OVERLAY */}
        {hud.status === 'START' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-950/75 backdrop-blur-xs p-4">
            <div className="w-full max-w-xl bg-stone-900 border-2 border-amber-400 rounded-2xl overflow-hidden shadow-2xl">
              {/* Iconic Warung Madura Spanduk Header */}
              <div className="bg-emerald-700 border-b-4 border-amber-400 px-5 py-3 text-center relative">
                <div className="absolute inset-y-0 left-0 w-3 bg-red-600" />
                <div className="absolute inset-y-0 right-0 w-3 bg-red-600" />
                <p className="font-display text-xs sm:text-sm font-extrabold tracking-wide text-amber-200">
                  BUKA 24 JAM · KIAMAT TETAP BUKA
                </p>
              </div>

              <div className="p-6 sm:p-7 space-y-5 text-center">
                <div className="space-y-2">
                  <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
                    Warung Madura: Buka Sampai Kiamat
                  </h1>
                  <p className="text-sm sm:text-base text-stone-300 max-w-md mx-auto">
                    Layani warga, emak-emak daster, pocong, sampai alien nyasar. Jangan sampai
                    rolling door warung tertutup badai meteor!
                  </p>
                </div>

                {/* Concise How-to-Play Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs sm:text-sm bg-stone-950/70 border border-stone-800 rounded-xl p-4">
                  <div className="space-y-1">
                    <p className="font-bold text-amber-300">1. Layani Pesanan (Tombol 1–5)</p>
                    <p className="text-stone-400">
                      Tekan angka 1–5 atau klik barang di rak bawah sesuai balon pesanan pembeli.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-red-400">2. Tahan Rolling Door (Spasi)</p>
                    <p className="text-stone-400">
                      Saat badai kiamat datang, spam Spasi, klik Tahan Pintu, atau geser pintu ke atas!
                    </p>
                  </div>
                </div>

                {hud.highScore > 0 && (
                  <p className="text-xs sm:text-sm text-stone-400">
                    Rekor Omzet Tertinggi:{' '}
                    <span className="font-mono-nums font-bold text-amber-400">
                      {formatRupiah(hud.highScore)}
                    </span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => engineRef.current?.startGame()}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-stone-950 font-display text-lg font-extrabold tracking-wide shadow-lg transition-transform cursor-pointer whitespace-nowrap"
                >
                  JAGA WARUNG
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAUSED OVERLAY */}
        {hud.status === 'PAUSED' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-950/80 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm bg-stone-900 border border-stone-700 rounded-2xl p-6 text-center space-y-5 shadow-2xl">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-extrabold text-white">Warung Dijeda</h2>
                <p className="text-sm text-stone-400">Minum es teh dulu, kiamatnya nunggu sebentar.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => engineRef.current?.togglePause()}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Lanjut Jaga
                </button>
                <button
                  type="button"
                  onClick={() => engineRef.current?.startGame()}
                  className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Ulang Dari Awal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {hud.status === 'GAME_OVER' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-950/85 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-stone-900 border-2 border-red-500 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-red-900/90 border-b border-red-700 px-5 py-3 text-center">
                <p className="font-display text-xs font-bold text-red-200">
                  WARUNG TERPAKSA TUTUP SEMENTARA
                </p>
              </div>
              <div className="p-6 space-y-5 text-center">
                <div className="space-y-1.5">
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                    {hud.gameOverReason === 'ROLLING_DOOR'
                      ? 'Warung Ketutup Rolling Door!'
                      : 'Ditinggal Kabur Pelanggan!'}
                  </h2>
                  <p className="text-sm text-stone-400">
                    {hud.gameOverReason === 'ROLLING_DOOR'
                      ? 'Badai meteor terlalu kencang, pintu besi jatuh menutup etalase.'
                      : 'Terlalu banyak warga dan makhluk halus kabur ke minimarket sebelah.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-stone-950/80 border border-stone-800 rounded-xl p-4 text-left">
                  <div>
                    <p className="text-xs text-stone-400">Total Omzet</p>
                    <p className="font-mono-nums text-lg font-extrabold text-amber-400">
                      {formatRupiah(hud.omzet)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Pelanggan Dilayani</p>
                    <p className="font-mono-nums text-lg font-extrabold text-emerald-400">
                      {hud.servedCount} orang
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Combo Tertinggi</p>
                    <p className="font-mono-nums text-base font-bold text-stone-200">
                      {hud.maxCombo}x
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Rekor Omzet</p>
                    <p className="font-mono-nums text-base font-bold text-amber-200">
                      {formatRupiah(hud.highScore)}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-400">
                  Bertahan sampai <span className="font-semibold text-stone-200">{hud.waveTitle}</span>
                </p>

                <button
                  type="button"
                  onClick={() => engineRef.current?.startGame()}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-stone-950 font-display text-lg font-extrabold tracking-wide shadow-lg transition-transform cursor-pointer whitespace-nowrap"
                >
                  BUKA WARUNG LAGI
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Interactive Shelf (5 Iconic Warung Items + Rolling Door Hold Button) */}
      <footer className="shrink-0 bg-stone-900 border-t-2 border-amber-700/60 px-2 sm:px-4 py-2 sm:py-2.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch gap-2">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 flex-1">
            {ITEMS.map((item) => {
              const isExpected = hud.status === 'PLAYING' && nextExpectedItem === item.id;
              const isPressed = pressedKey === item.key;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleServe(item.id)}
                  disabled={hud.status !== 'PLAYING'}
                  className={`relative flex flex-col items-center justify-center rounded-xl px-1.5 py-2 sm:py-2.5 border-2 transition-transform cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPressed ? 'scale-95' : 'active:scale-95'
                  } ${
                    isExpected
                      ? 'bg-amber-950/70 border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.25)]'
                      : 'bg-stone-800/95 hover:bg-stone-800 border-stone-700 hover:border-stone-500'
                  }`}
                >
                  <span className="absolute top-1 left-1.5 font-mono-nums text-[10px] sm:text-xs font-extrabold text-amber-300">
                    [{item.key}]
                  </span>

                  <ItemIcon id={item.id} className="w-8 h-8 sm:w-10 sm:h-10 mt-1" />

                  <span className="mt-1 text-[11px] sm:text-xs font-bold text-stone-100 leading-tight text-center truncate w-full">
                    {item.shortName}
                  </span>
                  <span className="hidden sm:block font-mono-nums text-[10px] text-stone-400">
                    {formatRupiah(item.price)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Rolling Door Hold Button */}
          <button
            type="button"
            onClick={handlePushDoor}
            disabled={hud.status !== 'PLAYING'}
            className={`sm:w-44 shrink-0 rounded-xl px-3 py-2.5 border-2 font-display font-extrabold text-xs sm:text-sm flex sm:flex-col items-center justify-center gap-1.5 transition-transform cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
              pressedKey === 'SPACE' ? 'scale-95' : 'active:scale-95'
            } ${
              hud.stormActive || hud.doorClosedRatio > 0.1
                ? 'bg-red-600 hover:bg-red-500 border-amber-300 text-white animate-pulse shadow-lg'
                : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
            }`}
          >
            <span className="whitespace-nowrap">TAHAN PINTU</span>
            <span className="font-mono-nums text-[11px] opacity-90 whitespace-nowrap">
              [SPASI] ↑
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}
