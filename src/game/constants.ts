import { CustomerType, ItemConfig, ItemId } from './types';

export const ITEMS: ItemConfig[] = [
  {
    id: 'bensin',
    key: '1',
    name: 'Bensin Eceran',
    shortName: 'Bensin',
    price: 12000,
    accentColor: '#F59E0B',
    bgTint: '#FEF3C7',
  },
  {
    id: 'mie',
    key: '2',
    name: 'Mie Instan Goreng',
    shortName: 'Mie Goreng',
    price: 4000,
    accentColor: '#EF4444',
    bgTint: '#FEE2E2',
  },
  {
    id: 'rokok',
    key: '3',
    name: 'Rokok Ketengan',
    shortName: 'Ketengan',
    price: 3000,
    accentColor: '#64748B',
    bgTint: '#F1F5F9',
  },
  {
    id: 'galon',
    key: '4',
    name: 'Galon Air Mineral',
    shortName: 'Galon Air',
    price: 20000,
    accentColor: '#0EA5E9',
    bgTint: '#E0F2FE',
  },
  {
    id: 'token',
    key: '5',
    name: 'Token Listrik / Pulsa',
    shortName: 'Token/Pulsa',
    price: 50000,
    accentColor: '#EAB308',
    bgTint: '#FEF9C3',
  },
];

export const ITEM_MAP: Record<ItemId, ItemConfig> = ITEMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ItemId, ItemConfig>
);

export const WAVE_TITLES: string[] = [
  'Hari ke-1 · Malam Biasa',
  'Hari ke-2 · Gerimis Meteor',
  'Hari ke-3 · Badai Api & UFO',
  'Hari ke-4 · Dino Nyasar & Gempa',
  'Hari ke-5 · Kiamat Puncak 24 Jam!',
];

export function getWaveForOmzet(omzet: number, servedCount: number): { day: number; title: string } {
  const scoreMetric = omzet + servedCount * 8000;
  if (scoreMetric < 90000) return { day: 1, title: WAVE_TITLES[0] };
  if (scoreMetric < 240000) return { day: 2, title: WAVE_TITLES[1] };
  if (scoreMetric < 460000) return { day: 3, title: WAVE_TITLES[2] };
  if (scoreMetric < 750000) return { day: 4, title: WAVE_TITLES[3] };
  const extraDays = Math.floor((scoreMetric - 750000) / 300000);
  const day = 5 + extraDays;
  return {
    day,
    title: `Hari ke-${day} · Kiamat Puncak!`,
  };
}

export const HAPPY_CALLOUTS = [
  'MANTAP BOS!',
  'LANCAR JAYA!',
  'GAS TERUS!',
  'KIAMAT TETAP CUAN!',
  'BUKA 24 JAM!',
  'ANTI TUTUP CLUB!',
  'PAS BANGET MAS!',
];

export const CUSTOMER_QUOTES: Record<CustomerType, string[]> = {
  warga: [
    'Misi Mas, lagi rame di luar?',
    'Titip beli bentar Bos, langit merah amat!',
    'Untung warung Madura masih buka!',
    'Mas, buruan sebelum meteor nyamber!',
  ],
  ojol: [
    'Orderan tetap jalan walau kiamat, Bang!',
    'Isi bensin dulu Bos, kejar tupo!',
    'Macet ada kawah meteor di depan!',
    'Gas Bang, pelanggan nunggu di bunker!',
  ],
  emak: [
    'Cepat Mas! Anak saya laper pas kiamat!',
    'Meteran bunyi terus, sekalian belanja!',
    'Jangan lama-lama Mas, jemuran kebakar!',
    'Bungkus semua ya Mas, gak pake lama!',
  ],
  pocong: [
    'Miiie... gooreeeng... anget...',
    'Maaas... ketengaaan... dua batang...',
    'Kuboooran... kepanasan... meteor...',
    'Sssst... warungnya... teraang...',
  ],
  kuntilanak: [
    'Hihihi... beli mie dong Maaas...',
    'Pohonku kena meteor... beli rokok...',
    'Malam ini dingin... eh panas kiamat...',
    'Hihihi... bayar pakai duit asli kok...',
  ],
  alien: [
    'Zorp! Bensin Pertalite buat UFO mogok!',
    'Bleep-bloop! Sinyal Mars ilang, beli pulsa!',
    'Warung Bumi terbaik di Galaksi Bima Sakti!',
    'Zing! Isi bahan bakar sebelum invasi!',
  ],
  astronot: [
    'Houston, warung Madura masih buka!',
    'Stasiun luar angkasa kehabisan galon!',
    'Nyasar dari orbit, butuh mie goreng!',
    'Bensin eceran cocok buat roket darurat!',
  ],
};

export const WARGA_SHIRTS = ['#DC2626', '#2563EB', '#D97706', '#0D9488', '#7C3AED'];
export const EMAK_DASTERS = ['#EC4899', '#F97316', '#8B5CF6', '#10B981'];
