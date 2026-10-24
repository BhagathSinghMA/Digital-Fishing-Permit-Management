export interface HarbourDistrictMap {
  district: string;
  harbours: string[];
}

export const TN_HARBOUR_MAPPING: HarbourDistrictMap[] = [
  {
    district: 'Chennai',
    harbours: ['Kasimedu (Chennai Fishing Harbour)'],
  },
  {
    district: 'Cuddalore',
    harbours: ['Cuddalore Fishing Harbour'],
  },
  {
    district: 'Mayiladuthurai',
    harbours: ['Pazhayar Fishing Harbour'],
  },
  {
    district: 'Nagapattinam',
    harbours: ['Nagapattinam Fishing Harbour'],
  },
  {
    district: 'Thanjavur',
    harbours: ['Mallipattinam Fishing Harbour'],
  },
  {
    district: 'Thoothukudi',
    harbours: ['Thoothukudi Fishing Harbour'],
  },
  {
    district: 'Kanyakumari',
    harbours: ['Chinnamuttom', 'Colachel', 'Muttom'],
  },
  {
    district: 'Ramanathapuram',
    harbours: ['Mandapam', 'Rameswaram', 'Pamban', 'Valinokkam'],
  },
];

// Flat list of all official Tamil Nadu harbours
export const ALL_HARBOURS: string[] = TN_HARBOUR_MAPPING.flatMap(item => item.harbours);

// Lookup district by harbour
export function getDistrictByHarbour(harbourName: string): string {
  if (!harbourName) return 'Tamil Nadu';
  for (const item of TN_HARBOUR_MAPPING) {
    if (item.harbours.some(h => h.toLowerCase() === harbourName.toLowerCase() || harbourName.toLowerCase().includes(h.toLowerCase()))) {
      return item.district;
    }
  }
  return 'Tamil Nadu';
}

// Get harbours for a given district
export function getHarboursByDistrict(districtName: string): string[] {
  const match = TN_HARBOUR_MAPPING.find(
    d => d.district.toLowerCase() === (districtName || '').toLowerCase()
  );
  return match ? match.harbours : [];
}

export const PERMIT_STATUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  APPROVED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  ACTIVE: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  EXPIRED: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  BLOCKED: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  ON_SEA: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
  },
};
