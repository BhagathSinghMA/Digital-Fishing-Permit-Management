import { BoatOwner, Fisherman, Permit, BlockedFishermanRecord } from '../types';

const INITIAL_BOAT_OWNERS: BoatOwner[] = [
  // Rameswaram
  {
    id: 1,
    registrationNumber: 'IND-TN-07-MM-1024',
    boatName: 'Kadalarasi (கடலரசி)',
    ownerName: 'M. Senthil Kumar',
    phoneNumber: '9842145678',
    fishermanId: 'FSH-TN-RMS-001',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:30:00Z',
  },
  {
    id: 2,
    registrationNumber: 'IND-TN-07-MM-1088',
    boatName: 'Veera Pandian (வீரபாண்டியன்)',
    ownerName: 'K. Arumugam',
    phoneNumber: '9842189012',
    fishermanId: 'FSH-TN-RMS-002',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2026-01-15T09:15:00Z',
  },
  {
    id: 3,
    registrationNumber: 'IND-TN-07-MM-1142',
    boatName: 'Alai Osai (அலை ஓசை)',
    ownerName: 'R. Veluchamy',
    phoneNumber: '9443211223',
    fishermanId: 'FSH-TN-RMS-003',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 4,
    registrationNumber: 'IND-TN-07-MM-1205',
    boatName: 'Meenatchi Amman (மீனாட்சி அம்மன்)',
    ownerName: 'P. Karuppiah',
    phoneNumber: '9789123456',
    fishermanId: 'FSH-TN-RMS-004',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2026-02-10T11:20:00Z',
  },

  // Mandapam
  {
    id: 5,
    registrationNumber: 'IND-TN-07-MM-2041',
    boatName: 'Sethu Pathi (சேதுபதி)',
    ownerName: 'G. Selvaraj',
    phoneNumber: '9843234567',
    fishermanId: 'FSH-TN-MDP-001',
    district: 'Ramanathapuram',
    port: 'Mandapam',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2026-01-18T07:45:00Z',
  },

  // Kasimedu (Chennai)
  {
    id: 6,
    registrationNumber: 'IND-TN-01-MM-3011',
    boatName: 'Marina Star (மரீனா ஸ்டார்)',
    ownerName: 'D. Elumalai',
    phoneNumber: '9840112233',
    fishermanId: 'FSH-TN-CHN-001',
    district: 'Chennai',
    port: 'Kasimedu (Chennai Fishing Harbour)',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2026-01-05T06:00:00Z',
  },
  {
    id: 7,
    registrationNumber: 'IND-TN-01-MM-3082',
    boatName: 'Singara Chennai (சிங்கார சென்னை)',
    ownerName: 'S. Loganathan',
    phoneNumber: '9840223344',
    fishermanId: 'FSH-TN-CHN-002',
    district: 'Chennai',
    port: 'Kasimedu (Chennai Fishing Harbour)',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2026-01-12T09:30:00Z',
  },

  // Thoothukudi
  {
    id: 8,
    registrationNumber: 'IND-TN-08-MM-4015',
    boatName: 'Muthu Nagar (முத்து நகர்)',
    ownerName: 'V. Antony Doss',
    phoneNumber: '9443144556',
    fishermanId: 'FSH-TN-TUT-001',
    district: 'Thoothukudi',
    port: 'Thoothukudi Fishing Harbour',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2026-01-20T08:15:00Z',
  },

  // Nagapattinam
  {
    id: 9,
    registrationNumber: 'IND-TN-06-MM-5021',
    boatName: 'Nagoor Andavar (நாகூர் ஆண்டவர்)',
    ownerName: 'A. Mohammed Farook',
    phoneNumber: '9443366778',
    fishermanId: 'FSH-TN-NGP-001',
    district: 'Nagapattinam',
    port: 'Nagapattinam Fishing Harbour',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2026-01-22T10:45:00Z',
  },
  
  // Pazhayar (Mayiladuthurai)
  {
    id: 10,
    registrationNumber: 'IND-TN-05-MM-6012',
    boatName: 'Cauvery Thendral (காவிரி தென்றல்)',
    ownerName: 'T. Murugesan',
    phoneNumber: '9842455667',
    fishermanId: 'FSH-TN-PZY-001',
    district: 'Mayiladuthurai',
    port: 'Pazhayar Fishing Harbour',
    state: 'Tamil Nadu',
    status: 'ACTIVE',
    createdAt: '2026-01-25T11:00:00Z',
  },
];

const INITIAL_FISHERMEN: Fisherman[] = [
  // Rameswaram
  {
    fishermanId: 'FSH-TN-RMS-001',
    name: 'M. Senthil Kumar',
    phoneNumber: '9842145678',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    village: 'Olaikuda Fishermen Colony',
    address: '12/4, Coastal Road, Rameswaram',
    status: 'ACTIVE',
    boatAssigned: 'IND-TN-07-MM-1024',
    permitStatus: 'APPROVED',
    isBlocked: false,
    createdAt: '2025-11-10T09:00:00Z',
  },
  {
    fishermanId: 'FSH-TN-RMS-002',
    name: 'K. Arumugam',
    phoneNumber: '9842189012',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    village: 'Therkkuvadi',
    address: '45, Harbour View Street, Rameswaram',
    status: 'ACTIVE',
    boatAssigned: 'IND-TN-07-MM-1088',
    permitStatus: 'PENDING',
    isBlocked: false,
    createdAt: '2025-11-12T10:00:00Z',
  },
  {
    fishermanId: 'FSH-TN-RMS-003',
    name: 'R. Veluchamy',
    phoneNumber: '9443211223',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    village: 'Pamban Road',
    address: '88, East Coast Lane, Rameswaram',
    status: 'ACTIVE',
    boatAssigned: 'IND-TN-07-MM-1142',
    permitStatus: 'PENDING',
    isBlocked: false,
    createdAt: '2025-11-15T11:30:00Z',
  },
  {
    fishermanId: 'FSH-TN-RMS-004',
    name: 'P. Karuppiah',
    phoneNumber: '9789123456',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    village: 'Dhanushkodi Border',
    address: '7/2, Sangumal Nagar, Rameswaram',
    status: 'ACTIVE',
    boatAssigned: 'IND-TN-07-MM-1205',
    permitStatus: 'NO_PERMIT',
    isBlocked: false,
    createdAt: '2025-11-20T08:15:00Z',
  },
  {
    fishermanId: 'FSH-TN-RMS-005',
    name: 'G. Murugan',
    phoneNumber: '9842911234',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    village: 'Karaiyur',
    address: '15, South Sea Street, Rameswaram',
    status: 'ACTIVE',
    boatAssigned: 'IND-TN-07-MM-1024',
    permitStatus: 'APPROVED',
    isBlocked: false,
    createdAt: '2025-12-01T09:40:00Z',
  },
  {
    fishermanId: 'FSH-TN-RMS-006',
    name: 'T. Kannan',
    phoneNumber: '9443556677',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    village: 'Olaikuda',
    address: '23, Seashore Colony, Rameswaram',
    status: 'BLOCKED',
    boatAssigned: 'None',
    permitStatus: 'NO_PERMIT',
    isBlocked: true,
    blockReason: 'Repeated border crossing violations and invalid biometric identity submission.',
    blockDate: '2026-02-14T14:30:00Z',
    createdAt: '2025-10-15T07:20:00Z',
  },
  {
    fishermanId: 'FSH-TN-RMS-007',
    name: 'M. Pandi',
    phoneNumber: '9842667788',
    district: 'Ramanathapuram',
    port: 'Rameswaram',
    village: 'Therkkuvadi',
    address: '3/11, Fish Market Road, Rameswaram',
    status: 'BLOCKED',
    boatAssigned: 'None',
    permitStatus: 'NO_PERMIT',
    isBlocked: true,
    blockReason: 'Operating unauthorized GPS fishing equipment in restricted maritime zone.',
    blockDate: '2026-02-18T10:00:00Z',
    createdAt: '2025-09-10T12:00:00Z',
  },

  // Chennai Kasimedu
  {
    fishermanId: 'FSH-TN-CHN-001',
    name: 'D. Elumalai',
    phoneNumber: '9840112233',
    district: 'Chennai',
    port: 'Kasimedu (Chennai Fishing Harbour)',
    village: 'Royapuram Coast',
    address: '102, Suryanarayana Street, Royapuram, Chennai',
    status: 'ACTIVE',
    boatAssigned: 'IND-TN-01-MM-3011',
    permitStatus: 'APPROVED',
    isBlocked: false,
    createdAt: '2025-08-10T08:00:00Z',
  },
  {
    fishermanId: 'FSH-TN-CHN-002',
    name: 'S. Loganathan',
    phoneNumber: '9840223344',
    district: 'Chennai',
    port: 'Kasimedu (Chennai Fishing Harbour)',
    village: 'Kasimedu Kuppam',
    address: '41, N4 Beach Road, Kasimedu, Chennai',
    status: 'ACTIVE',
    boatAssigned: 'IND-TN-01-MM-3082',
    permitStatus: 'PENDING',
    isBlocked: false,
    createdAt: '2025-08-14T09:30:00Z',
  },
  {
    fishermanId: 'FSH-TN-CHN-003',
    name: 'P. Munusamy',
    phoneNumber: '9840334455',
    district: 'Chennai',
    port: 'Kasimedu (Chennai Fishing Harbour)',
    village: 'Ennore Express Way',
    address: '18, Fishermen Avenue, Chennai',
    status: 'BLOCKED',
    boatAssigned: 'None',
    permitStatus: 'NO_PERMIT',
    isBlocked: true,
    blockReason: 'Failure to comply with harbor safety drills and expired life jacket certificates.',
    blockDate: '2026-02-10T16:00:00Z',
    createdAt: '2025-07-20T11:00:00Z',
  },

  // Thoothukudi
  {
    fishermanId: 'FSH-TN-TUT-001',
    name: 'V. Antony Doss',
    phoneNumber: '9443144556',
    district: 'Thoothukudi',
    port: 'Thoothukudi Fishing Harbour',
    village: 'Therespuram',
    address: '56, Beach Road, Therespuram, Thoothukudi',
    status: 'ACTIVE',
    boatAssigned: 'IND-TN-08-MM-4015',
    permitStatus: 'APPROVED',
    isBlocked: false,
    createdAt: '2025-09-01T10:00:00Z',
  },
];

const INITIAL_PERMITS: Permit[] = [
  // Rameswaram Pending
  {
    id: 101,
    permitNumber: 'TN-FP-2026-000101',
    registrationNumber: 'IND-TN-07-MM-1088',
    boatName: 'Veera Pandian (வீரபாண்டியன்)',
    ownerName: 'K. Arumugam',
    ownerPhone: '9842189012',
    port: 'Rameswaram',
    district: 'Ramanathapuram',
    state: 'Tamil Nadu',
    fishermanId: 'FSH-TN-RMS-002',
    permitDate: '2026-08-23',
    status: 'PENDING',
    submittedTime: '23 Aug 2026, 05:45 AM',
    crewCount: 4,
    crewMembers: [
      { fishermanId: 'FSH-TN-RMS-002', name: 'K. Arumugam', phoneNumber: '9842189012', role: 'Captain / Master', biometricVerified: true },
      { fishermanId: 'FSH-TN-RMS-005', name: 'G. Murugan', phoneNumber: '9842911234', role: 'Engine Driver', biometricVerified: true },
      { fishermanId: 'FSH-TN-RMS-008', name: 'S. Dharmaraj', phoneNumber: '9842998877', role: 'Deck Hand', biometricVerified: true },
      { fishermanId: 'FSH-TN-RMS-009', name: 'V. Kumar', phoneNumber: '9842887766', role: 'Net Handler', biometricVerified: true },
    ],
    qrToken: 'QR-TN-RMS-2026-000101-SECURE-TOKEN-HASH-8812',
    createdAt: '2026-08-23T05:45:00Z',
  },
  {
    id: 102,
    permitNumber: 'TN-FP-2026-000102',
    registrationNumber: 'IND-TN-07-MM-1142',
    boatName: 'Alai Osai (அலை ஓசை)',
    ownerName: 'R. Veluchamy',
    ownerPhone: '9443211223',
    port: 'Rameswaram',
    district: 'Ramanathapuram',
    state: 'Tamil Nadu',
    fishermanId: 'FSH-TN-RMS-003',
    permitDate: '2026-08-23',
    status: 'PENDING',
    submittedTime: '23 Aug 2026, 06:10 AM',
    crewCount: 3,
    crewMembers: [
      { fishermanId: 'FSH-TN-RMS-003', name: 'R. Veluchamy', phoneNumber: '9443211223', role: 'Captain', biometricVerified: true },
      { fishermanId: 'FSH-TN-RMS-010', name: 'M. Ramesh', phoneNumber: '9443334455', role: 'Engine Tech', biometricVerified: true },
      { fishermanId: 'FSH-TN-RMS-011', name: 'K. Balan', phoneNumber: '9443667788', role: 'Crew Member', biometricVerified: true },
    ],
    qrToken: 'QR-TN-RMS-2026-000102-SECURE-TOKEN-HASH-9921',
    createdAt: '2026-08-23T06:10:00Z',
  },

  // Rameswaram Approved
  {
    id: 103,
    permitNumber: 'TN-FP-2026-000103',
    registrationNumber: 'IND-TN-07-MM-1024',
    boatName: 'Kadalarasi (கடலரசி)',
    ownerName: 'M. Senthil Kumar',
    ownerPhone: '9842145678',
    port: 'Rameswaram',
    district: 'Ramanathapuram',
    state: 'Tamil Nadu',
    fishermanId: 'FSH-TN-RMS-001',
    permitDate: '2026-08-23',
    expiryDate: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    status: 'APPROVED',
    submittedTime: '23 Aug 2026, 04:30 AM',
    approvedTime: '23 Aug 2026, 05:15 AM',
    crewCount: 4,
    crewMembers: [
      { fishermanId: 'FSH-TN-RMS-001', name: 'M. Senthil Kumar', phoneNumber: '9842145678', role: 'Captain', biometricVerified: true },
      { fishermanId: 'FSH-TN-RMS-005', name: 'G. Murugan', phoneNumber: '9842911234', role: 'Engine Driver', biometricVerified: true },
      { fishermanId: 'FSH-TN-RMS-012', name: 'N. Palani', phoneNumber: '9842778899', role: 'Crew Member', biometricVerified: true },
      { fishermanId: 'FSH-TN-RMS-013', name: 'P. Manikandan', phoneNumber: '9842665544', role: 'Crew Member', biometricVerified: true },
    ],
    qrToken: 'QR-TN-RMS-2026-000103-VALID-DEPARTURE-PASS',
    createdAt: '2026-08-23T04:30:00Z',
  },

  // Rameswaram Rejected
  {
    id: 104,
    permitNumber: 'TN-FP-2026-000104',
    registrationNumber: 'IND-TN-07-MM-1205',
    boatName: 'Meenatchi Amman (மீனாட்சி அம்மன்)',
    ownerName: 'P. Karuppiah',
    ownerPhone: '9789123456',
    port: 'Rameswaram',
    district: 'Ramanathapuram',
    state: 'Tamil Nadu',
    fishermanId: 'FSH-TN-RMS-004',
    permitDate: '2026-08-22',
    status: 'REJECTED',
    rejectionReason: 'VHF marine radio communication device was non-functional during pre-departure dock safety verification.',
    submittedTime: '22 Aug 2026, 06:00 AM',
    crewCount: 3,
    crewMembers: [
      { fishermanId: 'FSH-TN-RMS-004', name: 'P. Karuppiah', phoneNumber: '9789123456', role: 'Captain', biometricVerified: true },
    ],
    createdAt: '2026-08-22T06:00:00Z',
  },

  // Chennai Kasimedu Permits
  {
    id: 201,
    permitNumber: 'TN-FP-2026-000201',
    registrationNumber: 'IND-TN-01-MM-3082',
    boatName: 'Singara Chennai (சிங்கார சென்னை)',
    ownerName: 'S. Loganathan',
    ownerPhone: '9840223344',
    port: 'Kasimedu (Chennai Fishing Harbour)',
    district: 'Chennai',
    state: 'Tamil Nadu',
    fishermanId: 'FSH-TN-CHN-002',
    permitDate: '2026-08-23',
    status: 'PENDING',
    submittedTime: '23 Aug 2026, 05:00 AM',
    crewCount: 5,
    crewMembers: [
      { fishermanId: 'FSH-TN-CHN-002', name: 'S. Loganathan', phoneNumber: '9840223344', role: 'Master', biometricVerified: true },
      { fishermanId: 'FSH-TN-CHN-004', name: 'K. Rajendran', phoneNumber: '9840556677', role: 'Crew', biometricVerified: true },
    ],
    qrToken: 'QR-TN-CHN-2026-000201-PENDING',
    createdAt: '2026-08-23T05:00:00Z',
  },
  {
    id: 202,
    permitNumber: 'TN-FP-2026-000202',
    registrationNumber: 'IND-TN-01-MM-3011',
    boatName: 'Marina Star (மரீனா ஸ்டார்)',
    ownerName: 'D. Elumalai',
    ownerPhone: '9840112233',
    port: 'Kasimedu (Chennai Fishing Harbour)',
    district: 'Chennai',
    state: 'Tamil Nadu',
    fishermanId: 'FSH-TN-CHN-001',
    permitDate: '2026-08-23',
    expiryDate: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    status: 'APPROVED',
    submittedTime: '23 Aug 2026, 04:00 AM',
    approvedTime: '23 Aug 2026, 04:45 AM',
    crewCount: 6,
    qrToken: 'QR-TN-CHN-2026-000202-ACTIVE',
    createdAt: '2026-08-23T04:00:00Z',
  },

  // Thoothukudi Permit
  {
    id: 301,
    permitNumber: 'TN-FP-2026-000301',
    registrationNumber: 'IND-TN-08-MM-4015',
    boatName: 'Muthu Nagar (முத்து நகர்)',
    ownerName: 'V. Antony Doss',
    ownerPhone: '9443144556',
    port: 'Thoothukudi Fishing Harbour',
    district: 'Thoothukudi',
    state: 'Tamil Nadu',
    fishermanId: 'FSH-TN-TUT-001',
    permitDate: '2026-08-23',
    expiryDate: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    status: 'APPROVED',
    submittedTime: '23 Aug 2026, 03:30 AM',
    approvedTime: '23 Aug 2026, 04:10 AM',
    crewCount: 4,
    qrToken: 'QR-TN-TUT-2026-000301-ACTIVE',
    createdAt: '2026-08-23T03:30:00Z',
  },
];

class MockStore {
  private boatOwners: BoatOwner[] = [];
  private fishermen: Fisherman[] = [];
  private permits: Permit[] = [];
  private isPermitWindowOpen = true;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedBoats = localStorage.getItem('tn_fisher_boat_owners');
      const storedFishermen = localStorage.getItem('tn_fisher_fishermen');
      const storedPermits = localStorage.getItem('tn_fisher_permits');
      const storedWindow = localStorage.getItem('tn_fisher_permit_window');

      this.boatOwners = storedBoats ? JSON.parse(storedBoats) : INITIAL_BOAT_OWNERS;
      this.fishermen = storedFishermen ? JSON.parse(storedFishermen) : INITIAL_FISHERMEN;
      this.permits = storedPermits ? JSON.parse(storedPermits) : INITIAL_PERMITS;
      this.isPermitWindowOpen = storedWindow ? JSON.parse(storedWindow) : true;
    } catch {
      this.boatOwners = INITIAL_BOAT_OWNERS;
      this.fishermen = INITIAL_FISHERMEN;
      this.permits = INITIAL_PERMITS;
      this.isPermitWindowOpen = true;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('tn_fisher_boat_owners', JSON.stringify(this.boatOwners));
      localStorage.setItem('tn_fisher_fishermen', JSON.stringify(this.fishermen));
      localStorage.setItem('tn_fisher_permits', JSON.stringify(this.permits));
      localStorage.setItem('tn_fisher_permit_window', JSON.stringify(this.isPermitWindowOpen));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  // --- PERMITS ---
  getPermits(harbour?: string, status?: string, search?: string): Permit[] {
    return this.permits.filter(p => {
      // Harbour filter (strict)
      if (harbour && harbour.trim() !== '') {
        const matchesHarbour = p.port.toLowerCase() === harbour.toLowerCase() || 
          p.port.toLowerCase().includes(harbour.toLowerCase()) || 
          harbour.toLowerCase().includes(p.port.toLowerCase());
        if (!matchesHarbour) return false;
      }

      // Status filter
      if (status && status !== 'ALL') {
        if (p.status.toUpperCase() !== status.toUpperCase()) return false;
      }

      // Search filter
      if (search && search.trim() !== '') {
        const s = search.toLowerCase();
        const matchesSearch =
          p.registrationNumber.toLowerCase().includes(s) ||
          p.boatName.toLowerCase().includes(s) ||
          p.ownerName.toLowerCase().includes(s) ||
          (p.permitNumber && p.permitNumber.toLowerCase().includes(s));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }

  getPermitById(id: number): Permit | undefined {
    return this.permits.find(p => p.id === id);
  }

  approvePermit(id: number): Permit {
    const index = this.permits.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Permit with ID ${id} not found.`);

    const updated: Permit = {
      ...this.permits[index],
      status: 'APPROVED',
      approvedTime: new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date()),
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      qrToken: `QR-TN-${this.permits[index].port.slice(0, 3).toUpperCase()}-2026-${String(id).padStart(6, '0')}-OFFICIAL-TOKEN`,
      rejectionReason: undefined,
    };

    this.permits[index] = updated;
    this.saveToStorage();
    return updated;
  }

  rejectPermit(id: number, reason: string): Permit {
    const index = this.permits.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Permit with ID ${id} not found.`);

    const updated: Permit = {
      ...this.permits[index],
      status: 'REJECTED',
      rejectionReason: reason || 'Application did not meet maritime guidelines or biometric clearance.',
      expiryDate: undefined,
    };

    this.permits[index] = updated;
    this.saveToStorage();
    return updated;
  }

  // --- BOAT OWNERS ---
  getBoatOwners(harbour?: string, search?: string): BoatOwner[] {
    return this.boatOwners.filter(b => {
      if (harbour && harbour.trim() !== '') {
        const matchesHarbour = b.port.toLowerCase() === harbour.toLowerCase() || 
          b.port.toLowerCase().includes(harbour.toLowerCase()) || 
          harbour.toLowerCase().includes(b.port.toLowerCase());
        if (!matchesHarbour) return false;
      }

      if (search && search.trim() !== '') {
        const s = search.toLowerCase();
        const matchesSearch =
          b.registrationNumber.toLowerCase().includes(s) ||
          b.boatName.toLowerCase().includes(s) ||
          b.ownerName.toLowerCase().includes(s) ||
          b.phoneNumber.includes(s) ||
          b.fishermanId.toLowerCase().includes(s);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }

  getBoatOwnerByReg(regNo: string): BoatOwner | undefined {
    return this.boatOwners.find(
      b => b.registrationNumber.toLowerCase() === regNo.trim().toLowerCase()
    );
  }

  createBoatOwner(data: Omit<BoatOwner, 'id' | 'createdAt'>): BoatOwner {
    const regNo = data.registrationNumber.trim().toUpperCase();
    if (this.boatOwners.some(b => b.registrationNumber.toUpperCase() === regNo)) {
      throw new Error(`Boat with Registration Number '${regNo}' already exists.`);
    }

    const fId = data.fishermanId ? data.fishermanId.trim().toUpperCase() : '';
    if (!fId) {
      throw new Error('Fisherman ID is required to register a boat owner.');
    }

    const existingFisherman = this.fishermen.find(f => f.fishermanId.toUpperCase() === fId);
    if (!existingFisherman) {
      throw new Error(`Ineligible: Fisherman ID '${fId}' does not exist in the master registry. The owner must be a registered fisherman first.`);
    }

    const newOwner: BoatOwner = {
      ...data,
      id: Date.now(),
      registrationNumber: regNo,
      fishermanId: fId,
      ownerName: data.ownerName || existingFisherman.name,
      phoneNumber: data.phoneNumber || existingFisherman.phoneNumber,
      status: data.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.boatOwners.unshift(newOwner);
    this.saveToStorage();
    return newOwner;
  }

  updateBoatOwner(regNo: string, data: Partial<BoatOwner>): BoatOwner {
    const index = this.boatOwners.findIndex(
      b => b.registrationNumber.toUpperCase() === regNo.trim().toUpperCase()
    );
    if (index === -1) throw new Error(`Boat owner with registration '${regNo}' not found.`);

    const updated = {
      ...this.boatOwners[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.boatOwners[index] = updated;
    this.saveToStorage();
    return updated;
  }

  deleteBoatOwner(regNo: string): boolean {
    const initialLen = this.boatOwners.length;
    this.boatOwners = this.boatOwners.filter(
      b => b.registrationNumber.toUpperCase() !== regNo.trim().toUpperCase()
    );
    this.saveToStorage();
    return this.boatOwners.length < initialLen;
  }

  // --- FISHERMEN ---
  getFishermen(harbour?: string, search?: string): Fisherman[] {
    return this.fishermen.filter(f => {
      if (harbour && harbour.trim() !== '') {
        const matchesHarbour = f.port.toLowerCase() === harbour.toLowerCase() || 
          f.port.toLowerCase().includes(harbour.toLowerCase()) || 
          harbour.toLowerCase().includes(f.port.toLowerCase());
        if (!matchesHarbour) return false;
      }

      if (search && search.trim() !== '') {
        const s = search.toLowerCase();
        const matchesSearch =
          f.fishermanId.toLowerCase().includes(s) ||
          f.name.toLowerCase().includes(s) ||
          f.phoneNumber.includes(s) ||
          (f.village && f.village.toLowerCase().includes(s));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }

  searchFisherman(query: string, harbour?: string): Fisherman[] {
    if (!query || query.trim().length < 2) return [];
    const q = query.trim().toLowerCase();

    return this.fishermen.filter(f => {
      // If harbour is specified, enforce harbour restriction
      if (harbour && harbour.trim() !== '') {
        const matchesHarbour = f.port.toLowerCase() === harbour.toLowerCase() || 
          f.port.toLowerCase().includes(harbour.toLowerCase()) || 
          harbour.toLowerCase().includes(f.port.toLowerCase());
        if (!matchesHarbour) return false;
      }

      return (
        f.fishermanId.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.phoneNumber.includes(q)
      );
    });
  }

  getFishermanById(id: string): Fisherman | undefined {
    return this.fishermen.find(f => f.fishermanId.toUpperCase() === id.trim().toUpperCase());
  }

  createFisherman(data: Fisherman): Fisherman {
    const fId = data.fishermanId.trim().toUpperCase();
    if (this.fishermen.some(f => f.fishermanId.toUpperCase() === fId)) {
      throw new Error(`Fisherman with ID '${fId}' already exists.`);
    }

    const newFisherman: Fisherman = {
      ...data,
      fishermanId: fId,
      status: data.status || 'ACTIVE',
      isBlocked: false,
      permitStatus: 'NO_PERMIT',
      createdAt: new Date().toISOString(),
    };

    this.fishermen.unshift(newFisherman);
    this.saveToStorage();
    return newFisherman;
  }

  updateFisherman(id: string, data: Partial<Fisherman>): Fisherman {
    const index = this.fishermen.findIndex(
      f => f.fishermanId.toUpperCase() === id.trim().toUpperCase()
    );
    if (index === -1) throw new Error(`Fisherman with ID '${id}' not found.`);

    const updated = {
      ...this.fishermen[index],
      ...data,
    };

    this.fishermen[index] = updated;
    this.saveToStorage();
    return updated;
  }

  blockFisherman(id: string, reason: string): Fisherman {
    const index = this.fishermen.findIndex(
      f => f.fishermanId.toUpperCase() === id.trim().toUpperCase()
    );
    if (index === -1) throw new Error(`Fisherman with ID '${id}' not found.`);

    const updated: Fisherman = {
      ...this.fishermen[index],
      isBlocked: true,
      status: 'BLOCKED',
      blockReason: reason,
      blockDate: new Date().toISOString(),
      permitStatus: 'NO_PERMIT',
    };

    this.fishermen[index] = updated;
    this.saveToStorage();
    return updated;
  }

  unblockFisherman(id: string): Fisherman {
    const index = this.fishermen.findIndex(
      f => f.fishermanId.toUpperCase() === id.trim().toUpperCase()
    );
    if (index === -1) throw new Error(`Fisherman with ID '${id}' not found.`);

    const updated: Fisherman = {
      ...this.fishermen[index],
      isBlocked: false,
      status: 'ACTIVE',
      blockReason: undefined,
      blockDate: undefined,
    };

    this.fishermen[index] = updated;
    this.saveToStorage();
    return updated;
  }

  deleteFisherman(id: string): boolean {
    const initialLen = this.fishermen.length;
    this.fishermen = this.fishermen.filter(
      f => f.fishermanId.toUpperCase() !== id.trim().toUpperCase()
    );
    this.saveToStorage();
    return this.fishermen.length < initialLen;
  }

  getBlockedFishermen(harbour?: string, search?: string): BlockedFishermanRecord[] {
    const blockedList = this.fishermen.filter(f => f.isBlocked);

    return blockedList
      .filter(f => {
        if (harbour && harbour.trim() !== '') {
          const matchesHarbour = f.port.toLowerCase() === harbour.toLowerCase() || 
            f.port.toLowerCase().includes(harbour.toLowerCase()) || 
            harbour.toLowerCase().includes(f.port.toLowerCase());
          if (!matchesHarbour) return false;
        }

        if (search && search.trim() !== '') {
          const s = search.toLowerCase();
          return (
            f.fishermanId.toLowerCase().includes(s) ||
            f.name.toLowerCase().includes(s) ||
            (f.blockReason && f.blockReason.toLowerCase().includes(s))
          );
        }

        return true;
      })
      .map(f => ({
        fishermanId: f.fishermanId,
        name: f.name,
        harbour: f.port,
        district: f.district,
        blockDate: f.blockDate || new Date().toISOString(),
        reason: f.blockReason || 'Security or safety non-compliance violation',
        phone: f.phoneNumber,
      }));
  }

  // --- SETTINGS & TOGGLES ---
  isApplicationOpen(): boolean {
    return this.isPermitWindowOpen;
  }

  toggleApplicationStatus(open: boolean): boolean {
    this.isPermitWindowOpen = open;
    this.saveToStorage();
    return this.isPermitWindowOpen;
  }

  getMainOfficerKPIs() {
    const harbourMap: Record<string, { total: number; active: number }> = {};
    this.boatOwners.forEach((b) => {
      const port = b.port || 'Other';
      if (!harbourMap[port]) harbourMap[port] = { total: 0, active: 0 };
      harbourMap[port].total += 1;
      if (b.status === 'ACTIVE' || !b.status) harbourMap[port].active += 1;
    });

    const harbourBoatDistribution = Object.entries(harbourMap).map(([harbour, data]) => ({
      harbour,
      count: data.total,
      active: data.active,
    }));

    const fHarbourMap: Record<string, number> = {};
    this.fishermen.forEach((f) => {
      const port = f.port || 'Other';
      fHarbourMap[port] = (fHarbourMap[port] || 0) + 1;
    });

    const harbourFishermanDistribution = Object.entries(fHarbourMap).map(([harbour, count]) => ({
      harbour,
      count,
    }));

    return {
      harbourBoatDistribution,
      harbourFishermanDistribution,
    };
  }
}

export const mockStore = new MockStore();
