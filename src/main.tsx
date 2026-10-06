import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BadgeCheck,
  Blocks,
  Building2,
  Check,
  ChevronRight,
  Clipboard,
  Clock3,
  Copy,
  FileCheck2,
  FileKey2,
  FileSearch2,
  Gavel,
  Hash,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  MapPinned,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Stamp,
  UserCheck,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';
import './styles.css';

type View = 'dashboard' | 'owner' | 'government' | 'registry' | 'transfers' | 'verification' | 'bank' | 'disputes' | 'audit';
type Role = 'REGISTRAR' | 'OWNER' | 'BANK' | 'COURT';
type PropertyStatus = 'APPLICATION_PENDING' | 'VERIFIED' | 'TRANSFER_PENDING' | 'DISPUTED' | 'FROZEN';
type ToastTone = 'success' | 'danger' | 'warning';

type OwnershipEvent = {
  date: string;
  title: string;
  detail: string;
  tag: string;
};

type Transfer = {
  buyerReference: string;
  stage: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
};

type Property = {
  id: string;
  surveyNumber: string;
  location: string;
  area: string;
  ownerReference: string;
  ownerName: string;
  status: PropertyStatus;
  documentLabel: string;
  documentContent: string;
  blockchainHash: string;
  currentHash: string;
  documentTampered: boolean;
  blockchainRecord: string;
  registeredAt: string;
  encumbrance: string;
  disputeReason?: string;
  ownerProfile?: boolean;
  transfer?: Transfer;
  history: OwnershipEvent[];
};

type AuditEvent = {
  id: number;
  time: string;
  event: string;
  property: string;
  actor: string;
  status: 'SUCCESS' | 'BLOCKED' | 'WARNING';
  detail: string;
};

type Toast = { message: string; tone: ToastTone };
type RegistrationInput = { surveyNumber: string; area: string; location: string; documentName: string };

const roleLabels: Record<Role, string> = {
  REGISTRAR: 'GOVERNMENT REGISTRAR',
  OWNER: 'PROPERTY OWNER',
  BANK: 'BANK VERIFIER',
  COURT: 'COURT OFFICER',
};

const statusLabels: Record<PropertyStatus, string> = {
  APPLICATION_PENDING: 'APPLICATION PENDING',
  VERIFIED: 'VERIFIED',
  TRANSFER_PENDING: 'TRANSFER PENDING',
  DISPUTED: 'DISPUTED',
  FROZEN: 'FROZEN',
};

const statusShort: Record<PropertyStatus, string> = {
  APPLICATION_PENDING: 'APPLICATION',
  VERIFIED: 'ACTIVE',
  TRANSFER_PENDING: 'PENDING',
  DISPUTED: 'DISPUTED',
  FROZEN: 'FROZEN',
};

const transferSteps = ['SALE REQUEST', 'BUYER IDENTITY', 'DOCUMENTS', 'TAX / FEES', 'REGISTRAR APPROVAL', 'CHAIN UPDATE'];

const seedProperties: Property[] = [
  {
    id: 'TS-HYD-001245',
    surveyNumber: '123/4',
    location: 'JUBILEE HILLS / HYDERABAD',
    area: '240 SQ YARDS',
    ownerReference: 'GOV-ID REF /•••• 2841',
    ownerName: 'ANJALI RAO',
    status: 'VERIFIED',
    documentLabel: 'REGISTERED SALE DEED',
    documentContent: 'LANDCHAIN|TS-HYD-001245|SURVEY 123/4|AREA 240 SQ YARDS|OWNER REF GOV-ID 2841|REGISTERED 05 OCT 2026',
    blockchainHash: '',
    currentHash: '',
    documentTampered: false,
    blockchainRecord: '0x82F7...A91A',
    registeredAt: '05 OCT 2026 / 14:32:09',
    encumbrance: 'NONE DECLARED',
    history: [
      { date: '05 OCT 2026', title: 'DIGITAL TITLE ISSUED', detail: 'Government registrar verified all submitted documents.', tag: 'REGISTRAR' },
      { date: '11 JUN 2024', title: 'OWNER IDENTITY UPDATED', detail: 'Government identity reference revalidated.', tag: 'KYC' },
      { date: '28 MAR 2018', title: 'PROPERTY REGISTERED', detail: 'Original land registration accepted.', tag: 'REGISTRY' },
    ],
  },
  {
    id: 'TS-HYD-004801',
    surveyNumber: '88/2B',
    location: 'GACHIBOWLI / HYDERABAD',
    area: '410 SQ YARDS',
    ownerReference: 'GOV-ID REF /•••• 1902',
    ownerName: 'RAVI MENON',
    status: 'TRANSFER_PENDING',
    documentLabel: 'SALE DEED + TAX RECEIPT',
    documentContent: 'LANDCHAIN|TS-HYD-004801|SURVEY 88/2B|AREA 410 SQ YARDS|OWNER REF GOV-ID 1902|REGISTERED 18 SEP 2023',
    blockchainHash: '',
    currentHash: '',
    documentTampered: false,
    blockchainRecord: '0x1C40...88D2',
    registeredAt: '18 SEP 2023 / 09:11:42',
    encumbrance: 'BANK CHARGE / VERIFIED',
    transfer: { buyerReference: 'GOV-ID REF /•••• 6918', stage: 4, status: 'PENDING', requestedAt: '06 OCT 2026 / 10:04:11' },
    history: [
      { date: '06 OCT 2026', title: 'TRANSFER REQUESTED', detail: 'Buyer identity and tax documents awaiting registrar approval.', tag: 'TRANSFER' },
      { date: '18 SEP 2023', title: 'DIGITAL TITLE ISSUED', detail: 'Title issued after document and tax verification.', tag: 'REGISTRAR' },
    ],
  },
  {
    id: 'TS-HYD-009973',
    surveyNumber: '41/7A',
    location: 'KONDAPUR / HYDERABAD',
    area: '180 SQ YARDS',
    ownerReference: 'GOV-ID REF /•••• 7780',
    ownerName: 'SAMEER KHAN',
    status: 'DISPUTED',
    documentLabel: 'REGISTRATION DOCUMENT',
    documentContent: 'LANDCHAIN|TS-HYD-009973|SURVEY 41/7A|AREA 180 SQ YARDS|OWNER REF GOV-ID 7780|REGISTERED 02 FEB 2022',
    blockchainHash: '',
    currentHash: '',
    documentTampered: false,
    blockchainRecord: '0x9B13...7E42',
    registeredAt: '02 FEB 2022 / 16:08:27',
    encumbrance: 'COURT NOTICE ACTIVE',
    disputeReason: 'BOUNDARY OWNERSHIP DISPUTE',
    history: [
      { date: '04 OCT 2026', title: 'PROPERTY DISPUTED', detail: 'Court notice received. Transfer actions blocked.', tag: 'COURT' },
      { date: '02 FEB 2022', title: 'DIGITAL TITLE ISSUED', detail: 'Title issued after registrar verification.', tag: 'REGISTRAR' },
    ],
  },
  {
    id: 'TS-HYD-000617',
    surveyNumber: '9/1C',
    location: 'BEGUMPET / HYDERABAD',
    area: '120 SQ YARDS',
    ownerReference: 'GOV-ID REF /•••• 4490',
    ownerName: 'PRIYA SHAH',
    status: 'FROZEN',
    documentLabel: 'TAX + REGISTRATION FILE',
    documentContent: 'LANDCHAIN|TS-HYD-000617|SURVEY 9/1C|AREA 120 SQ YARDS|OWNER REF GOV-ID 4490|REGISTERED 16 AUG 2020',
    blockchainHash: '',
    currentHash: '',
    documentTampered: false,
    blockchainRecord: '0xD701...5BC0',
    registeredAt: '16 AUG 2020 / 12:44:03',
    encumbrance: 'LEGAL HOLD',
    disputeReason: 'SUCCESSION CASE / COURT HOLD',
    history: [
      { date: '01 OCT 2026', title: 'PROPERTY FROZEN', detail: 'Court officer placed a legal hold on ownership changes.', tag: 'COURT' },
      { date: '16 AUG 2020', title: 'DIGITAL TITLE ISSUED', detail: 'Title issued after registrar verification.', tag: 'REGISTRAR' },
    ],
  },
];

const initialAudit: AuditEvent[] = [
  { id: 1, time: '06 OCT 2026 / 10:04:11', event: 'TRANSFER_REQUESTED', property: 'TS-HYD-004801', actor: 'OWNER / GOV-ID ••••1902', status: 'SUCCESS', detail: 'Buyer identity and tax documents submitted.' },
  { id: 2, time: '05 OCT 2026 / 14:32:09', event: 'DOCUMENT_HASH_VERIFIED', property: 'TS-HYD-001245', actor: 'REGISTRAR / GOV-REG-042', status: 'SUCCESS', detail: 'SHA-256 document proof matches blockchain record.' },
  { id: 3, time: '04 OCT 2026 / 17:51:26', event: 'PROPERTY_DISPUTED', property: 'TS-HYD-009973', actor: 'COURT / COURT-018', status: 'WARNING', detail: 'Boundary ownership dispute recorded. Transfers blocked.' },
  { id: 4, time: '01 OCT 2026 / 09:12:44', event: 'PROPERTY_FROZEN', property: 'TS-HYD-000617', actor: 'COURT / COURT-018', status: 'WARNING', detail: 'Succession case hold applied to the title.' },
  { id: 5, time: '30 SEP 2026 / 11:07:10', event: 'REGISTRY_BACKUP', property: 'ALL TITLES', actor: 'SYSTEM / BLOCK 018492', status: 'SUCCESS', detail: 'Ledger checkpoint committed to the government chain.' },
];

const navItems: Array<{ id: View; label: string; code: string; icon: LucideIcon }> = [
  { id: 'owner', label: 'My properties', code: '01', icon: UserCheck },
  { id: 'government', label: 'Verification queue', code: '01', icon: Stamp },
  { id: 'registry', label: 'Property registry', code: '02', icon: Landmark },
  { id: 'transfers', label: 'Transfers', code: '03', icon: ArrowRight },
  { id: 'verification', label: 'Document verification', code: '04', icon: FileSearch2 },
  { id: 'bank', label: 'Bank verification', code: '01', icon: Banknote },
  { id: 'disputes', label: 'Disputes', code: '01', icon: Gavel },
  { id: 'audit', label: 'Audit trail', code: '05', icon: ListChecks },
];

const roleViews: Record<Role, View[]> = {
  OWNER: ['owner', 'transfers'],
  REGISTRAR: ['government', 'registry', 'transfers', 'verification', 'audit'],
  BANK: ['bank'],
  COURT: ['disputes'],
};

const defaultViewForRole = (role: Role): View => roleViews[role][0];

const hashDocument = async (content: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
};

const shortHash = (hash: string) => hash ? `${hash.slice(0, 10).toUpperCase()}...${hash.slice(-8).toUpperCase()}` : 'CALCULATING...';
const nowLabel = () => new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).toUpperCase();
const tamperedDocument = (content: string) => content.includes('AREA ') ? content.replace(/AREA [^|]+/, 'AREA 540 SQ YARDS') + '|EDITED BY UNAUTHORIZED ACTOR' : `${content}|EDITED BY UNAUTHORIZED ACTOR`;

function App() {
  const [view, setView] = useState<View>('owner');
  const [role, setRole] = useState<Role | null>(null);
  const [properties, setProperties] = useState(seedProperties);
  const [selectedId, setSelectedId] = useState(seedProperties[0].id);
  const [auditEvents, setAuditEvents] = useState(initialAudit);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PropertyStatus>('ALL');
  const [buyerReference, setBuyerReference] = useState('');
  const [bankPropertyId, setBankPropertyId] = useState(seedProperties[0].id);
  const [toast, setToast] = useState<Toast | null>(null);
  const [hashBusy, setHashBusy] = useState(false);

  const selectedProperty = properties.find(property => property.id === selectedId) || properties[0];
  const bankProperty = properties.find(property => property.id === bankPropertyId && property.status !== 'APPLICATION_PENDING') || properties.find(property => property.status !== 'APPLICATION_PENDING') || properties[0];
  const ownerProperties = properties.filter(property => property.ownerProfile);
  const bankProperties = properties.filter(property => property.status !== 'APPLICATION_PENDING');

  useEffect(() => {
    let active = true;
    void Promise.all(seedProperties.map(property => hashDocument(property.documentContent))).then(hashes => {
      if (!active) return;
      setProperties(current => current.map((property, index) => ({ ...property, blockchainHash: hashes[index], currentHash: hashes[index] })));
    });
    return () => { active = false; };
  }, []);

  const notify = (message: string, tone: ToastTone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(current => current?.message === message ? null : current), 3800);
  };

  const addAudit = (event: Omit<AuditEvent, 'id' | 'time'>) => {
    setAuditEvents(current => [{ ...event, id: Date.now(), time: nowLabel() }, ...current]);
  };

  const updateProperty = (id: string, updater: (property: Property) => Property) => {
    setProperties(current => current.map(property => property.id === id ? updater(property) : property));
  };

  const selectProperty = (id: string, nextView?: View) => {
    setSelectedId(id);
    if (nextView) navigate(nextView);
  };

  function switchProfile(nextRole: Role) {
    setRole(nextRole);
    setView(defaultViewForRole(nextRole));
    setSearch('');
    setStatusFilter('ALL');
    const firstOwned = properties.find(property => property.ownerProfile);
    if (nextRole === 'OWNER' && firstOwned) setSelectedId(firstOwned.id);
    if (nextRole !== 'OWNER') setSelectedId(properties[0].id);
  }

  async function registerProperty(input: RegistrationInput) {
    const propertyId = `TS-HYD-${String(Date.now()).slice(-6)}`;
    const submittedAt = nowLabel();
    const documentContent = `LANDCHAIN|${propertyId}|SURVEY ${input.surveyNumber}|AREA ${input.area} SQ YARDS|LOCATION ${input.location}|DOCUMENT ${input.documentName}`;
    const documentHash = await hashDocument(documentContent);
    const created: Property = {
      id: propertyId,
      surveyNumber: input.surveyNumber.toUpperCase(),
      location: input.location.toUpperCase(),
      area: `${input.area} SQ YARDS`,
      ownerReference: 'OWNER PROFILE / CURRENT USER',
      ownerName: 'CURRENT USER',
      status: 'APPLICATION_PENDING',
      documentLabel: input.documentName.toUpperCase(),
      documentContent,
      blockchainHash: documentHash,
      currentHash: documentHash,
      documentTampered: false,
      ownerProfile: true,
      blockchainRecord: 'PENDING REGISTRAR APPROVAL',
      registeredAt: submittedAt,
      encumbrance: 'AWAITING VERIFICATION',
      history: [{ date: submittedAt.split(' / ')[0], title: 'REGISTRATION SUBMITTED', detail: 'Owner submitted property details and legal document for government review.', tag: 'OWNER' }],
    };
    setProperties(current => [created, ...current]);
    setSelectedId(created.id);
    addAudit({ event: 'PROPERTY_APPLICATION_SUBMITTED', property: created.id, actor: 'OWNER / CURRENT USER', status: 'SUCCESS', detail: 'Property registration is waiting for government document verification.' });
    notify('PROPERTY SUBMITTED FOR GOVERNMENT VERIFICATION');
  }

  function approveRegistration(propertyId: string) {
    if (role !== 'REGISTRAR') {
      notify('GOVERNMENT REGISTRAR ACCESS REQUIRED', 'danger');
      return;
    }
    const property = properties.find(item => item.id === propertyId);
    if (!property || property.status !== 'APPLICATION_PENDING') return;
    const chainRecord = `0x${propertyId.replace(/-/g, '').slice(-8)}...LC01`;
    updateProperty(propertyId, item => ({ ...item, status: 'VERIFIED', blockchainRecord: chainRecord, registeredAt: nowLabel(), encumbrance: 'NONE DECLARED', history: [{ date: nowLabel().split(' / ')[0], title: 'DIGITAL TITLE ISSUED', detail: 'Government registrar approved the owner submission and committed the proof record.', tag: 'REGISTRAR' }, ...item.history] }));
    addAudit({ event: 'DIGITAL_TITLE_ISSUED', property: propertyId, actor: 'REGISTRAR / GOV-REG-042', status: 'SUCCESS', detail: 'Owner application approved. Digital Land Title committed to the registry.' });
    notify('REGISTRATION APPROVED / DIGITAL TITLE ISSUED');
  }

  async function verifyDocument(property = selectedProperty) {
    setHashBusy(true);
    const content = property.documentTampered ? tamperedDocument(property.documentContent) : property.documentContent;
    const currentHash = await hashDocument(content);
    updateProperty(property.id, item => ({ ...item, currentHash }));
    const verified = currentHash === property.blockchainHash;
    addAudit({ event: verified ? 'DOCUMENT_HASH_VERIFIED' : 'DOCUMENT_TAMPER_DETECTED', property: property.id, actor: `${role || 'DEMO'} / DEMO SESSION`, status: verified ? 'SUCCESS' : 'BLOCKED', detail: verified ? 'SHA-256 document proof matches blockchain record.' : 'Current document hash does not match the blockchain record.' });
    notify(verified ? 'DOCUMENT INTEGRITY VERIFIED' : 'DOCUMENT TAMPER DETECTED', verified ? 'success' : 'danger');
    setHashBusy(false);
  }

  async function toggleTamper() {
    const property = selectedProperty;
    setHashBusy(true);
    const nextTampered = !property.documentTampered;
    const content = nextTampered ? tamperedDocument(property.documentContent) : property.documentContent;
    const currentHash = await hashDocument(content);
    updateProperty(property.id, item => ({ ...item, documentTampered: nextTampered, currentHash }));
    addAudit({ event: nextTampered ? 'DOCUMENT_TAMPER_DETECTED' : 'DOCUMENT_RESTORED', property: property.id, actor: `${role || 'DEMO'} / DEMO SESSION`, status: nextTampered ? 'BLOCKED' : 'SUCCESS', detail: nextTampered ? 'Area field changed from 240 to 540 sq yards. Hash mismatch detected.' : 'Original registered document restored. Hash matches blockchain proof.' });
    notify(nextTampered ? 'DOCUMENT TAMPER DETECTED' : 'ORIGINAL DOCUMENT RESTORED', nextTampered ? 'danger' : 'success');
    setHashBusy(false);
  }

  function requestTransfer() {
    const property = selectedProperty;
    if (role !== 'OWNER' || !property.ownerProfile) {
      addAudit({ event: 'TRANSFER_REJECTED', property: property.id, actor: `${role || 'GUEST'} / DEMO SESSION`, status: 'BLOCKED', detail: 'Only the verified property owner can submit a sale request.' });
      notify('OWNER AUTHORIZATION REQUIRED', 'danger');
      return;
    }
    if (!buyerReference.trim()) {
      notify('ENTER A BUYER IDENTITY REFERENCE', 'warning');
      return;
    }
    if (property.status === 'DISPUTED' || property.status === 'FROZEN') {
      addAudit({ event: 'TRANSFER_REJECTED', property: property.id, actor: `${role} / DEMO SESSION`, status: 'BLOCKED', detail: `Property is ${statusLabels[property.status].toLowerCase()}. Ownership changes are locked.` });
      notify('PROPERTY TRANSFER BLOCKED BY LEGAL HOLD', 'danger');
      return;
    }
    updateProperty(property.id, item => ({ ...item, status: 'TRANSFER_PENDING', transfer: { buyerReference: buyerReference.trim().toUpperCase(), stage: 1, status: 'PENDING', requestedAt: nowLabel() } }));
    addAudit({ event: 'TRANSFER_REQUESTED', property: property.id, actor: `${role} / ${property.ownerReference}`, status: 'SUCCESS', detail: 'Buyer identity reference submitted for registrar review.' });
    notify('TRANSFER REQUEST SUBMITTED');
  }

  function approveTransfer() {
    const property = selectedProperty;
    if (role !== 'REGISTRAR') {
      addAudit({ event: 'TRANSFER_REJECTED', property: property.id, actor: `${role || 'GUEST'} / DEMO SESSION`, status: 'BLOCKED', detail: 'Registrar approval is required before the title can move.' });
      notify('UNAUTHORIZED ACTION / REGISTRAR APPROVAL REQUIRED', 'danger');
      return;
    }
    if (property.status === 'DISPUTED' || property.status === 'FROZEN') {
      notify('LEGAL HOLD BLOCKS FINAL TRANSFER', 'danger');
      return;
    }
    if (!property.transfer || property.transfer.status !== 'PENDING') {
      notify('NO PENDING TRANSFER ON THIS TITLE', 'warning');
      return;
    }
    updateProperty(property.id, item => ({
      ...item,
      ownerReference: item.transfer?.buyerReference || item.ownerReference,
      ownerName: 'VERIFIED BUYER',
      status: 'VERIFIED',
      transfer: item.transfer ? { ...item.transfer, stage: 6, status: 'APPROVED' } : item.transfer,
      history: [{ date: '06 OCT 2026', title: 'OWNERSHIP TRANSFERRED', detail: 'Registrar approved the verified buyer. Smart contract updated the title.', tag: 'TRANSFER' }, ...item.history],
    }));
    addAudit({ event: 'TITLE_TRANSFERRED', property: property.id, actor: `${role} / GOV-REG-042`, status: 'SUCCESS', detail: 'Registrar approval committed. Ownership history preserved on chain.' });
    notify('DIGITAL TITLE UPDATED / TRANSFER COMMITTED');
  }

  function freezeProperty() {
    const property = selectedProperty;
    if (role !== 'COURT') {
      addAudit({ event: 'FREEZE_REJECTED', property: property.id, actor: `${role || 'GUEST'} / DEMO SESSION`, status: 'BLOCKED', detail: 'Only an authorized court officer can place a legal hold.' });
      notify('COURT AUTHORIZATION REQUIRED', 'danger');
      return;
    }
    updateProperty(property.id, item => ({ ...item, status: 'DISPUTED', disputeReason: 'LEGAL OWNERSHIP DISPUTE', history: [{ date: '06 OCT 2026', title: 'PROPERTY DISPUTED', detail: 'Court officer placed a legal hold on ownership changes.', tag: 'COURT' }, ...item.history] }));
    addAudit({ event: 'PROPERTY_FROZEN', property: property.id, actor: `${role} / COURT-018`, status: 'WARNING', detail: 'Legal dispute recorded. Sale and ownership transfer actions blocked.' });
    notify('PROPERTY FROZEN / TRANSFER BLOCKED', 'warning');
  }

  function unfreezeProperty() {
    const property = selectedProperty;
    if (role !== 'COURT') {
      addAudit({ event: 'UNFREEZE_REJECTED', property: property.id, actor: `${role || 'GUEST'} / DEMO SESSION`, status: 'BLOCKED', detail: 'Only an authorized court officer can release a legal hold.' });
      notify('COURT AUTHORIZATION REQUIRED', 'danger');
      return;
    }
    updateProperty(property.id, item => ({ ...item, status: item.transfer?.status === 'PENDING' ? 'TRANSFER_PENDING' : 'VERIFIED', disputeReason: undefined, history: [{ date: '06 OCT 2026', title: 'LEGAL HOLD RELEASED', detail: 'Court resolution received. Property is eligible for authorized actions.', tag: 'COURT' }, ...item.history] }));
    addAudit({ event: 'PROPERTY_UNFROZEN', property: property.id, actor: `${role} / COURT-018`, status: 'SUCCESS', detail: 'Court resolution released the title for authorized activity.' });
    notify('PROPERTY UNFROZEN / TITLE RELEASED');
  }

  async function copyHash(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      notify('HASH COPIED TO CLIPBOARD');
    } catch {
      notify('CLIPBOARD UNAVAILABLE', 'warning');
    }
  }

  const filteredProperties = useMemo(() => properties.filter(property => {
    const query = search.toLowerCase();
    const matchesSearch = !query || [property.id, property.surveyNumber, property.location, property.ownerReference].some(value => value.toLowerCase().includes(query));
    return matchesSearch && (statusFilter === 'ALL' || property.status === statusFilter);
  }), [properties, search, statusFilter]);

  const navigate = (nextView: View) => {
    if (!role || !roleViews[role].includes(nextView)) {
      notify('THIS PROFILE DOES NOT HAVE ACCESS TO THAT SECTION', 'danger');
      return;
    }
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!role) return <ProfileGate onSelect={switchProfile} />;

  const visibleNavItems = navItems.filter(item => roleViews[role].includes(item.id));
  const activeProperty = role === 'OWNER' ? (ownerProperties[0] || selectedProperty) : selectedProperty;

  return (
    <div className="app-root">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="topbar">
        <button className="brand" onClick={() => navigate(defaultViewForRole(role))} aria-label="LandChain dashboard">
          <span className="brand-mark"><span>LC</span><i /></span>
          <span className="brand-name">LANDCHAIN <small>/ REGISTRY</small></span>
        </button>
        <div className="topbar-meta">
          <span className="network-pill"><span className="live-dot" /> TESTNET / BLOCK 018492</span>
          <span className="topbar-rule" />
          <label className="role-control"><span>ACTIVE PROFILE</span><select value={role} onChange={event => switchProfile(event.target.value as Role)} aria-label="Active profile">{Object.keys(roleLabels).map(value => <option value={value} key={value}>{roleLabels[value as Role]}</option>)}</select></label>
        </div>
        {role === 'OWNER' && <button className="button button-lime topbar-action" onClick={() => navigate('owner')}>REGISTER PROPERTY <ArrowUpRight size={16} /></button>}
        {role === 'REGISTRAR' && <button className="button button-lime topbar-action" onClick={() => navigate('government')}>OPEN REVIEW QUEUE <ArrowUpRight size={16} /></button>}
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-intro"><span className="section-kicker">LANDCHAIN / CONTROL ROOM</span><p>PUBLIC PROOF FOR<br />PRIVATE RECORDS.</p></div>
          <nav className="side-nav" aria-label="LandChain sections">
            {visibleNavItems.map(item => <button key={item.id} className={view === item.id ? 'side-nav-item active' : 'side-nav-item'} onClick={() => navigate(item.id)}><span className="nav-code">{item.code}</span><item.icon size={16} strokeWidth={1.8} /><span>{item.label}</span>{view === item.id && <ChevronRight size={14} className="nav-arrow" />}</button>)}
          </nav>
          <div className="sidebar-bottom">
            <div className="ledger-status"><span className="status-dot status-dot-lime" /><div><span className="mono-label">LEDGER STATUS</span><strong>SYNCED / 4.2 SEC AGO</strong></div></div>
            <div className="sidebar-note"><Blocks size={16} /><span>Blockchain stores proof.<br />Documents stay private.</span></div>
          </div>
        </aside>

        <main id="main-content" className="main-content">
          <div className="mobile-context"><span className="section-kicker">ACTIVE ROLE</span><strong>{roleLabels[role]}</strong></div>
          {toast && <div className={`toast toast-${toast.tone}`} role="status"><span className="toast-icon">{toast.tone === 'danger' ? <AlertTriangle size={17} /> : <Check size={17} />}</span><strong>{toast.message}</strong><button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={16} /></button></div>}

           {view === 'dashboard' && <Dashboard properties={properties} selectedProperty={selectedProperty} auditEvents={auditEvents} onSelect={selectProperty} onNavigate={navigate} />}
           {view === 'owner' && <OwnerPage properties={ownerProperties} onRegister={registerProperty} onSelect={selectProperty} onNavigate={navigate} />}
           {view === 'government' && <GovernmentPage properties={properties} auditEvents={auditEvents} onApprove={approveRegistration} onSelect={selectProperty} onNavigate={navigate} />}
           {view === 'registry' && <RegistryPage properties={filteredProperties} allProperties={properties} selectedProperty={selectedProperty} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onSelect={selectProperty} onNavigate={navigate} />}
           {view === 'transfers' && <TransfersPage property={role === 'OWNER' ? activeProperty : selectedProperty} role={role} buyerReference={buyerReference} setBuyerReference={setBuyerReference} onRequest={requestTransfer} onApprove={approveTransfer} onSelect={selectProperty} properties={role === 'OWNER' ? ownerProperties : properties} onNavigate={navigate} />}
           {view === 'verification' && <VerificationPage property={selectedProperty} role={role} hashBusy={hashBusy} onSelect={selectProperty} properties={properties} onVerify={verifyDocument} onToggleTamper={toggleTamper} onCopyHash={copyHash} />}
           {view === 'bank' && <BankPage property={bankProperty} properties={bankProperties} setProperty={setBankPropertyId} onGenerate={() => { addAudit({ event: 'BANK_VERIFICATION', property: bankProperty.id, actor: 'BANK / DEMO SESSION', status: 'SUCCESS', detail: 'Verification report generated from the current digital title.' }); notify('VERIFICATION REPORT GENERATED'); }} />}
           {view === 'disputes' && <DisputesPage properties={properties.filter(property => property.status !== 'APPLICATION_PENDING')} selectedProperty={selectedProperty} role={role} onSelect={selectProperty} onFreeze={freezeProperty} onUnfreeze={unfreezeProperty} />}
          {view === 'audit' && <AuditPage events={auditEvents} />}
        </main>
      </div>
      <footer className="site-footer"><span>LANDCHAIN / DIGITAL LAND REGISTRY</span><span className="footer-center">GOVERNMENT-AUTHORIZED DEMO LEDGER</span><span>PRIVATE DATA. PUBLIC PROOF.</span></footer>
    </div>
  );
}

function ProfileGate({ onSelect }: { onSelect: (role: Role) => void }) {
  const profiles: Array<{ role: Role; label: string; title: string; description: string; icon: LucideIcon; accent: string }> = [
    { role: 'OWNER', label: 'PROPERTY OWNER', title: 'Register and manage your title.', description: 'Submit property details, upload legal records, and request an authorized transfer.', icon: UserCheck, accent: 'profile-accent-lime' },
    { role: 'REGISTRAR', label: 'GOVERNMENT', title: 'Verify and issue digital titles.', description: 'Review owner applications, verify documents, and approve registry changes.', icon: Stamp, accent: 'profile-accent-dark' },
    { role: 'BANK', label: 'BANK', title: 'Verify before you lend.', description: 'Check ownership, document proof, encumbrances, and legal status.', icon: Banknote, accent: 'profile-accent-paper' },
    { role: 'COURT', label: 'COURT', title: 'Control disputed property.', description: 'Open legal holds, freeze transfers, and release titles after resolution.', icon: Gavel, accent: 'profile-accent-danger' },
  ];
  return <main className="profile-gate"><div className="gate-topline"><span className="brand-mark"><span>LC</span><i /></span><span className="mono-label">LANDCHAIN / DIGITAL LAND REGISTRY</span><span className="gate-network"><span className="live-dot" /> DEMO LEDGER / BLOCK 018492</span></div><div className="gate-heading"><span className="section-kicker">SELECT YOUR AUTHORITY</span><h1>ONE REGISTRY.<br /><em>FOUR DOORS.</em></h1><p>Choose the profile that matches your role. LandChain only shows the tools and records that role is authorized to use.</p></div><div className="profile-grid">{profiles.map(profile => <button className={`profile-card ${profile.accent}`} key={profile.role} onClick={() => onSelect(profile.role)}><div className="profile-card-top"><span className="profile-icon"><profile.icon size={22} /></span><span className="mono-label">{profile.label}</span><ArrowUpRight size={17} /></div><div className="profile-card-copy"><h2>{profile.title}</h2><p>{profile.description}</p></div><div className="profile-card-foot"><span>ENTER WORKSPACE</span><ArrowRight size={15} /></div></button>)}</div><div className="gate-footer"><span>PRIVATE DOCUMENTS / PUBLIC PROOF</span><span>AUTHORITY-BASED ACCESS CONTROL</span><span>LANDCHAIN MVP / TESTNET</span></div></main>;
}

function OwnerPage({ properties, onRegister, onSelect, onNavigate }: { properties: Property[]; onRegister: (input: RegistrationInput) => Promise<void>; onSelect: (id: string) => void; onNavigate: (view: View) => void }) {
  const [showForm, setShowForm] = useState(properties.length === 0);
  return <><PageHeader eyebrow="PROPERTY OWNER / PRIVATE WORKSPACE" title={<>YOUR LAND.<br /><em>YOUR PROOF.</em></>} description="Register your property once. Government verification turns your submitted record into a Digital Land Title." action={!showForm ? <button className="button button-lime" onClick={() => setShowForm(true)}>REGISTER A PROPERTY <ArrowUpRight size={16} /></button> : undefined} />
    <section className="owner-intro"><div><span className="section-kicker">OWNER WORKFLOW</span><h2>Submit the record.<br /><em>Keep the proof.</em></h2><p>Your legal documents stay in secure storage. The registry receives a cryptographic proof and a government-reviewed ownership reference.</p></div><div className="owner-steps"><span className="owner-step active"><b>01</b> YOU SUBMIT</span><span className="owner-step"><b>02</b> GOVERNMENT REVIEWS</span><span className="owner-step"><b>03</b> TITLE ISSUED</span></div></section>
    {showForm && <RegistrationWizard onSubmit={async input => { await onRegister(input); setShowForm(false); }} onCancel={properties.length ? () => setShowForm(false) : undefined} />}
    <section className="owner-properties"><div className="section-row"><div><span className="section-kicker">YOUR SUBMISSIONS</span><h2>My properties</h2></div><span className="mono-label">{properties.length.toString().padStart(2, '0')} RECORDS</span></div>{properties.length ? <div className="owner-property-grid">{properties.map(property => <article className="owner-property-card" key={property.id}><div className="owner-property-head"><div><span className="mono-label">PROPERTY ID</span><h3>{property.id}</h3></div><StatusBadge status={property.status} /></div><div className="owner-property-facts"><span><small>LOCATION</small><strong>{property.location}</strong></span><span><small>SURVEY / AREA</small><strong>{property.surveyNumber} / {property.area}</strong></span><span><small>DOCUMENT PROOF</small><strong>{shortHash(property.blockchainHash)}</strong></span></div><div className="owner-property-foot"><span className="mono-label">{property.status === 'APPLICATION_PENDING' ? 'WAITING FOR GOVERNMENT REVIEW' : `BLOCKCHAIN / ${property.blockchainRecord}`}</span><button className="text-link" onClick={() => { onSelect(property.id); onNavigate(property.status === 'APPLICATION_PENDING' ? 'owner' : 'transfers'); }}>{property.status === 'APPLICATION_PENDING' ? 'VIEW APPLICATION' : 'OPEN TITLE'} <ArrowUpRight size={14} /></button></div></article>)}</div> : <div className="owner-empty"><div className="empty-stamp"><FileKey2 size={28} /></div><h3>NO PROPERTY REGISTERED YET.</h3><p>Start with your survey number, area, location, and one legal document. The government registrar will review it before any title is issued.</p><button className="button button-lime" onClick={() => setShowForm(true)}>START REGISTRATION <ArrowRight size={16} /></button></div>}</section>
  </>;
}

function RegistrationWizard({ onSubmit, onCancel }: { onSubmit: (input: RegistrationInput) => Promise<void>; onCancel?: () => void }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<RegistrationInput>({ surveyNumber: '', area: '', location: '', documentName: '' });
  const update = (key: keyof RegistrationInput, value: string) => setForm(current => ({ ...current, [key]: value }));
  const complete = Boolean(form.surveyNumber && form.area && form.location && form.documentName);
  async function submit() {
    setBusy(true);
    await onSubmit(form);
    setBusy(false);
  }
  return <section className="registration-wizard panel"><div className="wizard-head"><div><span className="section-kicker">NEW PROPERTY APPLICATION</span><h2>Register your property</h2><p>Three steps to create a government review request.</p></div>{onCancel && <button className="icon-button" onClick={onCancel} aria-label="Close registration form"><X size={17} /></button>}</div><div className="wizard-progress">{['PROPERTY DETAILS', 'LEGAL DOCUMENT', 'REVIEW + SUBMIT'].map((label, index) => <button key={label} className={step === index + 1 ? 'wizard-step active' : step > index + 1 ? 'wizard-step complete' : 'wizard-step'} onClick={() => step > index + 1 && setStep(index + 1)}><span>{String(index + 1).padStart(2, '0')}</span>{label}{step > index + 1 && <Check size={14} />}</button>)}</div><div className="wizard-body">{step === 1 && <div className="wizard-form"><div className="form-section-copy"><span className="section-kicker">01 / WHERE IS IT?</span><h3>Start with the public facts.</h3><p>These details identify the parcel. They are not enough to issue a title until a registrar verifies the supporting document.</p></div><div className="form-fields"><label>LOCATION<input value={form.location} onChange={event => update('location', event.target.value)} placeholder="JUBILEE HILLS / HYDERABAD" /></label><label>SURVEY NUMBER<input value={form.surveyNumber} onChange={event => update('surveyNumber', event.target.value)} placeholder="123/4" /></label><label>AREA / SQ YARDS<input type="number" min="1" value={form.area} onChange={event => update('area', event.target.value)} placeholder="240" /></label></div></div>}{step === 2 && <div className="wizard-form"><div className="form-section-copy"><span className="section-kicker">02 / WHAT PROVES IT?</span><h3>Attach one legal record.</h3><p>For this prototype, the file name represents the private document stored off-chain. The demo will hash the submitted record before review.</p></div><label className="document-upload"><FileKey2 size={23} /><strong>{form.documentName || 'CHOOSE A SALE DEED, TAX FILE, OR REGISTRATION RECORD'}</strong><span className="mono-label">PRIVATE STORAGE / DOCUMENT NEVER PUBLISHED</span><input type="file" className="sr-only" onChange={event => update('documentName', event.target.files?.[0]?.name || '')} /></label></div>}{step === 3 && <div className="review-card"><div><span className="mono-label">APPLICATION PREVIEW</span><h3>Ready for government review</h3></div><dl><dt>LOCATION</dt><dd>{form.location}</dd><dt>SURVEY NUMBER</dt><dd>{form.surveyNumber}</dd><dt>AREA</dt><dd>{form.area} SQ YARDS</dd><dt>LEGAL DOCUMENT</dt><dd>{form.documentName}</dd><dt>OWNER REFERENCE</dt><dd>OWNER PROFILE / CURRENT USER</dd></dl><div className="review-note"><ShieldCheck size={17} /><span>The submitted document will be fingerprinted. A Digital Land Title is issued only after government approval.</span></div></div>}</div><div className="wizard-foot"><span className="mono-label">{step === 3 ? 'READY TO SUBMIT / REVIEW IS REQUIRED' : 'FIELDS MARKED IN THE FORM ARE REQUIRED'}</span><div>{step > 1 && <button className="button button-plain" onClick={() => setStep(current => current - 1)}>BACK</button>}{step < 3 ? <button className="button button-dark" disabled={step === 1 ? !form.location || !form.surveyNumber || !form.area : !form.documentName} onClick={() => setStep(current => current + 1)}>CONTINUE <ArrowRight size={15} /></button> : <button className="button button-lime" disabled={!complete || busy} onClick={() => void submit()}>{busy ? 'SUBMITTING...' : 'SUBMIT FOR REVIEW'} <Stamp size={15} /></button>}</div></div></section>;
}

function GovernmentPage({ properties, auditEvents, onApprove, onSelect, onNavigate }: { properties: Property[]; auditEvents: AuditEvent[]; onApprove: (id: string) => void; onSelect: (id: string) => void; onNavigate: (view: View) => void }) {
  const applications = properties.filter(property => property.status === 'APPLICATION_PENDING');
  const [reviewId, setReviewId] = useState(applications[0]?.id || '');
  const selected = applications.find(property => property.id === reviewId) || applications[0];
  return <><PageHeader eyebrow="GOVERNMENT / REGISTRAR WORKSPACE" title={<>VERIFY.<br /><em>THEN ISSUE.</em></>} description="This is the legal gate. Owner submissions become Digital Land Titles only after a registrar checks the application." action={<div className="bank-badge"><Stamp size={17} /> AUTHORIZED REGISTRAR</div>} /><section className="government-stats"><MetricCard label="WAITING REVIEW" value={String(applications.length).padStart(2, '0')} note="OWNER APPLICATIONS" icon={<Clock3 />} tone={applications.length ? 'danger' : 'lime'} /><MetricCard label="TITLES ISSUED" value={String(properties.filter(property => property.status === 'VERIFIED').length).padStart(2, '0')} note="ACTIVE ON CHAIN" icon={<BadgeCheck />} tone="lime" /><MetricCard label="AUDIT EVENTS" value={String(auditEvents.length).padStart(2, '0')} note="PERMANENT LOG" icon={<ListChecks />} /></section><div className="government-layout"><section className="panel review-queue"><PanelHeader eyebrow="01 / OWNER SUBMISSIONS" title="Verification queue" action={<span className="mono-label">{applications.length.toString().padStart(2, '0')} WAITING</span>} />{applications.length ? applications.map(property => <button key={property.id} className={property.id === selected?.id ? 'review-row selected' : 'review-row'} onClick={() => { setReviewId(property.id); onSelect(property.id); }}><span className="review-row-index">●</span><div><strong>{property.id}</strong><span>{property.location} / SURVEY {property.surveyNumber}</span></div><span className="mono-label">{property.registeredAt.split(' / ')[0]}</span><ChevronRight size={15} /></button>) : <div className="queue-empty"><BadgeCheck size={30} /><strong>QUEUE CLEAR</strong><p>All owner applications have been reviewed.</p></div>}<div className="panel-foot"><span className="mono-label">DOCUMENTS STAY PRIVATE / PROOF GOES ON CHAIN</span></div></section><section className="panel review-console"><PanelHeader eyebrow="02 / REGISTRAR CHECK" title={selected?.id || 'NO APPLICATION SELECTED'} />{selected ? <><div className="review-document"><div className="review-document-icon"><FileKey2 size={25} /></div><div><span className="mono-label">SUBMITTED LEGAL RECORD</span><strong>{selected.documentLabel}</strong><small>{selected.location} / {selected.area}</small></div><span className="review-file-status"><Check size={13} /> RECEIVED</span></div><div className="review-checklist"><div><Check size={15} /><span>OWNER IDENTITY REFERENCE PRESENT</span></div><div><Check size={15} /><span>SURVEY + AREA DETAILS COMPLETE</span></div><div><Check size={15} /><span>SHA-256 PROOF READY FOR COMMIT</span></div></div><div className="review-proof"><span className="mono-label">DOCUMENT HASH TO COMMIT</span><code>{shortHash(selected.blockchainHash)}</code></div><div className="review-actions"><button className="button button-lime" onClick={() => onApprove(selected.id)}>APPROVE + ISSUE TITLE <Stamp size={15} /></button><button className="button button-plain" onClick={() => onNavigate('verification')}>OPEN DOCUMENT CHECK <FileSearch2 size={15} /></button></div></> : <div className="queue-empty"><FileSearch2 size={30} /><strong>NOTHING TO REVIEW</strong><p>New owner submissions will appear here.</p></div>}</section></div></>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: ReactNode; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-header-action">{action}</div>}</div>;
}

function Dashboard({ properties, selectedProperty, auditEvents, onSelect, onNavigate }: { properties: Property[]; selectedProperty: Property; auditEvents: AuditEvent[]; onSelect: (id: string, view?: View) => void; onNavigate: (view: View) => void }) {
  const verified = properties.filter(property => property.status === 'VERIFIED').length;
  const pending = properties.filter(property => property.status === 'TRANSFER_PENDING').length;
  const disputed = properties.filter(property => property.status === 'DISPUTED' || property.status === 'FROZEN').length;
  return <>
    <PageHeader eyebrow="01 / LANDCHAIN CONTROL ROOM" title={<>LAND RECORDS.<br /><em>PUBLIC PROOF.</em></>} description="A government-authorized registry that turns verified property records into tamper-evident digital land titles." action={<button className="button button-dark" onClick={() => onNavigate('verification')}>VERIFY A DOCUMENT <ArrowUpRight size={16} /></button>} />
    <section className="dashboard-hero">
      <div className="hero-message"><div className="hero-message-top"><span className="signal-mark" /><span className="mono-label">GOVERNMENT-VERIFIED INFRASTRUCTURE</span></div><p className="hero-body">Ownership should be easy to prove and impossible to secretly rewrite.</p><div className="hero-actions"><button className="button button-lime" onClick={() => onNavigate('registry')}>OPEN PROPERTY REGISTRY <ArrowRight size={17} /></button><button className="text-link" onClick={() => onNavigate('audit')}>VIEW AUDIT TRAIL <ArrowUpRight size={15} /></button></div><div className="hero-foot mono-label"><span>IMMUTABLE OWNERSHIP HISTORY</span><span>CONTROLLED TRANSFERS ONLY</span></div></div>
      <div className="chain-map" aria-label="LandChain verification path"><div className="map-label mono-label">THE LANDCHAIN PATH</div><div className="map-node map-node-first"><Stamp size={19} /><span>DOCUMENTS</span><small>PRIVATE STORAGE</small></div><div className="map-line" /><div className="map-node map-node-middle"><Hash size={19} /><span>HASH PROOF</span><small>BLOCKCHAIN RECORD</small></div><div className="map-line" /><div className="map-node map-node-last"><BadgeCheck size={21} /><span>DIGITAL TITLE</span><small>VERIFIED OWNER</small></div><div className="map-block mono-label">BLOCK 018492 <span>●</span> FINALITY 12 SEC</div></div>
    </section>
    <section className="metrics-grid" aria-label="Registry metrics"><MetricCard label="VERIFIED TITLES" value="12,842" note="+ 18 THIS WEEK" icon={<BadgeCheck />} tone="lime" /><MetricCard label="ACTIVE TRANSFERS" value={String(pending).padStart(2, '0')} note="AWAITING REGISTRAR" icon={<ArrowRight />} /><MetricCard label="LEGAL HOLDS" value={String(disputed).padStart(2, '0')} note="COURT CONTROLLED" icon={<Gavel />} tone="danger" /><MetricCard label="HASH INTEGRITY" value="100%" note="ALL RECORDS MATCHED" icon={<Hash />} tone="lime" /></section>
    <div className="dashboard-grid"><section className="panel registry-panel"><PanelHeader eyebrow="02 / RECENT REGISTRY" title="Verified property titles" action={<button className="text-link" onClick={() => onNavigate('registry')}>VIEW ALL <ArrowUpRight size={14} /></button>} /><div className="mini-property-list">{properties.map(property => <button key={property.id} className={property.id === selectedProperty.id ? 'property-row selected' : 'property-row'} onClick={() => onSelect(property.id)}><span className="property-id mono-label">{property.id}</span><span className="property-location">{property.location}<small>{property.surveyNumber} / {property.area}</small></span><StatusBadge status={property.status} /><ChevronRight size={16} /></button>)}</div><div className="panel-foot"><span className="mono-label">SHOWING {properties.length} OF 12,842 TITLES</span><button className="square-button" onClick={() => onNavigate('registry')} aria-label="Open property registry"><ArrowUpRight size={16} /></button></div></section><section className="panel audit-panel"><PanelHeader eyebrow="03 / LIVE AUDIT" title="Latest ledger activity" action={<button className="text-link" onClick={() => onNavigate('audit')}>FULL TRAIL <ArrowUpRight size={14} /></button>} /><AuditList events={auditEvents.slice(0, 4)} compact /><div className="audit-footer"><span className="live-dot" /> LIVE LEDGER FEED <span className="mono-label">/ {auditEvents.length.toString().padStart(2, '0')} EVENTS</span></div></section></div>
    <section className="title-showcase"><div className="showcase-intro"><span className="section-kicker">04 / THE DIGITAL LAND TITLE</span><h2>One record.<br /><em>Every proof.</em></h2><p>The title is the human-readable layer. The chain underneath keeps the history, hashes, and permissions accountable.</p><button className="text-link" onClick={() => onNavigate('registry')}>INSPECT SELECTED TITLE <ArrowUpRight size={15} /></button></div><DigitalTitle property={selectedProperty} onVerify={() => onNavigate('verification')} onCopyHash={() => undefined} /></section>
  </>;
}

function RegistryPage({ properties, allProperties, selectedProperty, search, setSearch, statusFilter, setStatusFilter, onSelect, onNavigate }: { properties: Property[]; allProperties: Property[]; selectedProperty: Property; search: string; setSearch: (value: string) => void; statusFilter: 'ALL' | PropertyStatus; setStatusFilter: (value: 'ALL' | PropertyStatus) => void; onSelect: (id: string, view?: View) => void; onNavigate: (view: View) => void }) {
  return <><PageHeader eyebrow="02 / PROPERTY REGISTRY" title="THE OFFICIAL RECORD." description="Search verified titles, inspect their public proof, and follow the complete ownership trail." action={<button className="button button-lime" onClick={() => onNavigate('verification')}>VERIFY DOCUMENT <FileCheck2 size={16} /></button>} /><section className="registry-toolbar"><label className="search-box"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="SEARCH PROPERTY ID, SURVEY, LOCATION..." aria-label="Search properties" /></label><label className="filter-box"><SlidersHorizontal size={16} /><select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'ALL' | PropertyStatus)} aria-label="Filter property status"><option value="ALL">ALL STATUSES</option><option value="APPLICATION_PENDING">APPLICATION PENDING</option><option value="VERIFIED">VERIFIED</option><option value="TRANSFER_PENDING">TRANSFER PENDING</option><option value="DISPUTED">DISPUTED</option><option value="FROZEN">FROZEN</option></select></label><span className="result-count mono-label">{properties.length.toString().padStart(2, '0')} MATCHES / {allProperties.length} LOADED</span></section><div className="registry-layout"><section className="panel registry-table-panel"><div className="table-head"><span>PROPERTY / LOCATION</span><span>OWNER REFERENCE</span><span>STATUS</span><span>CHAIN RECORD</span></div>{properties.length ? properties.map(property => <button key={property.id} className={property.id === selectedProperty.id ? 'registry-table-row selected' : 'registry-table-row'} onClick={() => onSelect(property.id)}><div><strong>{property.id}</strong><span>{property.location}<small>SURVEY {property.surveyNumber} / {property.area}</small></span></div><span className="table-owner">{property.ownerReference}<small>{property.ownerName}</small></span><StatusBadge status={property.status} /><code>{property.blockchainRecord}</code><ChevronRight size={17} /></button>) : <div className="empty-state"><Search size={28} /><strong>NO TITLES FOUND</strong><span>Try a different property ID or status.</span></div>}<div className="table-foot"><span className="mono-label">PUBLIC REGISTRY / READ-ONLY VIEW</span><span className="mono-label">LAST SYNC 06 OCT 2026 / 10:07:42</span></div></section><div className="registry-detail"><DigitalTitle property={selectedProperty} onVerify={() => onNavigate('verification')} onCopyHash={() => undefined} /><button className="button button-dark full-width" onClick={() => onSelect(selectedProperty.id, 'transfers')}>OPEN TRANSFER WORKFLOW <ArrowRight size={16} /></button></div></div></>;
}

function TransfersPage({ property, role, buyerReference, setBuyerReference, onRequest, onApprove, onSelect, properties, onNavigate }: { property: Property; role: Role; buyerReference: string; setBuyerReference: (value: string) => void; onRequest: () => void; onApprove: () => void; onSelect: (id: string) => void; properties: Property[]; onNavigate: (view: View) => void }) {
  const transfer = property.transfer;
  const currentStage = transfer?.stage || 0;
  const legalHold = property.status === 'DISPUTED' || property.status === 'FROZEN';
  return <><PageHeader eyebrow="03 / CONTROLLED TRANSFER" title="OWNERSHIP MOVES BY APPROVAL." description="A sale request is not a title change. The registrar is the final legal gate before the chain updates." action={<label className="select-property"><span className="mono-label">ACTIVE TITLE</span><select value={property.id} onChange={event => onSelect(event.target.value)} aria-label="Active transfer property">{properties.map(item => <option key={item.id} value={item.id}>{item.id}</option>)}</select></label>} /><section className="transfer-banner"><div><span className="section-kicker">TRANSFER TARGET</span><h2>{property.id}</h2><p>{property.location} / {property.area} / CURRENT OWNER {property.ownerReference}</p></div><StatusBadge status={property.status} /></section><div className="transfer-layout"><section className="panel workflow-panel"><PanelHeader eyebrow="01 / THE LEGAL PIPELINE" title="From sale request to chain update" /><div className="workflow-steps">{transferSteps.map((step, index) => <div key={step} className={index < currentStage ? 'workflow-step complete' : index === currentStage ? 'workflow-step current' : 'workflow-step'}><span>{(index + 1).toString().padStart(2, '0')}</span><strong>{step}</strong>{index < currentStage && <Check size={15} />}</div>)}</div><div className="workflow-note"><ShieldCheck size={19} /><p>{legalHold ? <><strong>LEGAL HOLD ACTIVE.</strong> This property cannot be sold, transferred, or changed until the court releases it.</> : transfer?.status === 'APPROVED' ? <><strong>CHAIN UPDATE COMPLETE.</strong> Previous owner and approval record remain in the permanent history.</> : <><strong>REGISTRAR IS THE FINAL GATE.</strong> Every document check happens before the ownership record changes.</>}</p></div></section><section className="panel transfer-form-panel"><PanelHeader eyebrow="02 / REQUEST + APPROVE" title="Action console" /><div className="role-callout"><div className="avatar-square">{role.slice(0, 2)}</div><div><span className="mono-label">YOU ARE ACTING AS</span><strong>{roleLabels[role]}</strong></div></div><label className="field-label" htmlFor="buyer-reference">BUYER IDENTITY REFERENCE</label><input id="buyer-reference" className="big-input" value={buyerReference || transfer?.buyerReference || ''} onChange={event => setBuyerReference(event.target.value)} placeholder="GOV-ID REF /•••• 6918" disabled={transfer?.status === 'APPROVED'} /><p className="field-note">Government identity is verified off-chain. Only the opaque reference is written to the ledger.</p><div className="form-actions"><button className="button button-lime" onClick={onRequest} disabled={legalHold || transfer?.status === 'APPROVED'}>REQUEST TRANSFER <ArrowRight size={16} /></button><button className="button button-dark" onClick={onApprove} disabled={legalHold || transfer?.status === 'APPROVED'}>APPROVE AS REGISTRAR <Stamp size={16} /></button></div><div className={legalHold ? 'action-alert danger' : 'action-alert'}>{legalHold ? <><AlertTriangle size={16} /><span><strong>TRANSFER BLOCKED</strong><small>{property.disputeReason || 'Court-controlled legal hold'}</small></span></> : <><LockKeyhole size={16} /><span><strong>SMART CONTRACT GATE</strong><small>Owner request + registrar approval required</small></span></>}</div></section></div><section className="transfer-history panel"><PanelHeader eyebrow="03 / IMMUTABLE HISTORY" title="Ownership events" action={<button className="text-link" onClick={() => onNavigate('audit')}>OPEN AUDIT TRAIL <ArrowUpRight size={14} /></button>} /><OwnershipTimeline property={property} /></section></>;
}

function VerificationPage({ property, role, hashBusy, onSelect, properties, onVerify, onToggleTamper, onCopyHash }: { property: Property; role: Role; hashBusy: boolean; onSelect: (id: string) => void; properties: Property[]; onVerify: () => void; onToggleTamper: () => void; onCopyHash: (value: string) => void }) {
  const verified = Boolean(property.blockchainHash) && property.blockchainHash === property.currentHash;
  return <><PageHeader eyebrow="04 / DOCUMENT INTEGRITY" title="PROVE THE RECORD WASN'T CHANGED." description="The document stays private. The blockchain stores a fingerprint that anyone with permission can compare." action={<label className="select-property"><span className="mono-label">CHECK TITLE</span><select value={property.id} onChange={event => onSelect(event.target.value)} aria-label="Verification property">{properties.map(item => <option key={item.id} value={item.id}>{item.id}</option>)}</select></label>} /><div className="verification-layout"><section className="panel document-panel"><PanelHeader eyebrow="01 / PRIVATE DOCUMENT" title={property.documentLabel} action={<span className="private-chip"><LockKeyhole size={13} /> PRIVATE STORAGE</span>} /><div className={property.documentTampered ? 'document-sheet tampered' : 'document-sheet'}><div className="document-sheet-head"><span>LANDCHAIN / LEGAL RECORD</span><span>REV. 01</span></div><div className="document-seal"><Landmark size={27} /><span>GOVERNMENT<br />REGISTRY</span></div><div className="document-lines"><span>PROPERTY ID <strong>{property.id}</strong></span><span>SURVEY NUMBER <strong>{property.surveyNumber}</strong></span><span>DECLARED AREA <strong>{property.documentTampered ? '540 SQ YARDS' : property.area}</strong></span><span>OWNER REFERENCE <strong>{property.ownerReference}</strong></span><span>REGISTERED <strong>{property.registeredAt.split(' / ')[0]}</strong></span></div><div className="document-sheet-foot"><span>DOCUMENT HASHED BEFORE REGISTRATION</span><span className="mono-label">SHA-256 / UTF-8</span></div>{property.documentTampered && <div className="tamper-stamp">TAMPERED</div>}</div><div className="document-actions"><button className="button button-dark" onClick={onToggleTamper} disabled={hashBusy}>{property.documentTampered ? 'RESTORE ORIGINAL DOCUMENT' : 'SIMULATE DOCUMENT EDIT'} <RefreshCw size={16} /></button><button className="button button-plain" onClick={onVerify} disabled={hashBusy}>{hashBusy ? 'CALCULATING...' : 'RECHECK SHA-256'} <Hash size={16} /></button></div><p className="demo-note"><AlertTriangle size={14} /> Demo control: edits the area field locally. The registered source record remains unchanged.</p></section><section className="panel hash-panel"><PanelHeader eyebrow="02 / PUBLIC PROOF" title="Hash comparison" action={<span className={verified ? 'verified-chip' : 'danger-chip'}>{verified ? <><Check size={13} /> MATCH</> : <><AlertTriangle size={13} /> MISMATCH</>}</span>} /><div className="hash-comparison"><HashRow label="BLOCKCHAIN RECORD" value={property.blockchainHash} display={shortHash(property.blockchainHash)} icon={<Blocks size={17} />} onCopy={() => onCopyHash(property.blockchainHash)} /><div className="hash-connector"><span /><span>COMPARE</span><span /></div><HashRow label="CURRENT DOCUMENT" value={property.currentHash} display={shortHash(property.currentHash)} icon={<FileKey2 size={17} />} onCopy={() => onCopyHash(property.currentHash)} /></div><div className={verified ? 'integrity-result verified' : 'integrity-result failed'}>{verified ? <><ShieldCheck size={28} /><div><strong>DOCUMENT INTEGRITY VERIFIED</strong><span>Current file and registered proof are identical.</span></div></> : <><ShieldAlert size={28} /><div><strong>DOCUMENT TAMPER DETECTED</strong><span>Blockchain hash and current document hash do not match.</span></div></>}</div><div className="proof-explainer"><div><span className="mono-label">ON CHAIN</span><strong>Small proof</strong><p>ID, status, timestamp, owner reference, and document hash.</p></div><div><span className="mono-label">PRIVATE STORAGE</span><strong>Full documents</strong><p>Sale deed, survey map, tax files, and registration scans.</p></div></div></section></div><section className="verification-strip"><div className="verification-strip-label"><span className="section-kicker">03 / THE RULE</span><h2>One changed character<br /><em>changes the proof.</em></h2></div><div className="verification-strip-copy"><p>LandChain never puts private legal documents on a public chain. It puts the evidence that lets authorized people prove the document is the same one that was verified.</p><div className="hash-rule"><span>A8F93C72...91B</span><ArrowRight size={18} /><span className={verified ? '' : 'changed-hash'}>{shortHash(property.currentHash)}</span></div></div></section></>;
}

function BankPage({ property, properties, setProperty, onGenerate }: { property: Property; properties: Property[]; setProperty: (value: string) => void; onGenerate: () => void }) {
  const checks = [{ label: 'PROPERTY EXISTS', value: 'REGISTERED ON CHAIN', ok: true }, { label: 'OWNER VERIFIED', value: property.ownerReference, ok: true }, { label: 'DOCUMENT AUTHENTIC', value: property.blockchainHash === property.currentHash ? 'SHA-256 MATCH' : 'HASH MISMATCH', ok: property.blockchainHash === property.currentHash }, { label: 'OWNERSHIP HISTORY', value: `${property.history.length} EVENTS AVAILABLE`, ok: true }, { label: 'DISPUTE STATUS', value: property.status === 'VERIFIED' ? 'NO ACTIVE DISPUTE' : statusLabels[property.status], ok: property.status === 'VERIFIED' }, { label: 'ENCUMBRANCE', value: property.encumbrance, ok: property.encumbrance === 'NONE DECLARED' }];
  return <><PageHeader eyebrow="05 / BANK VERIFICATION" title="CHECK BEFORE YOU LEND." description="A bank can verify the current owner, document proof, history, and legal status from one property ID." action={<div className="bank-badge"><Banknote size={19} /> LENDER VIEW / READ ONLY</div>} /><section className="bank-lookup"><div><span className="section-kicker">PROPERTY LOOKUP</span><h2>Verification report</h2><p>Enter a property ID to inspect its public proof.</p></div><label className="lookup-select"><span className="mono-label">PROPERTY ID</span><select value={property.id} onChange={event => setProperty(event.target.value)} aria-label="Bank verification property">{properties.map(item => <option value={item.id} key={item.id}>{item.id}</option>)}</select></label></section><div className="bank-layout"><section className="panel bank-report"><div className="report-header"><div><span className="section-kicker">LANDCHAIN PROPERTY REPORT</span><h2>{property.id}</h2><p>{property.location} / SURVEY {property.surveyNumber} / {property.area}</p></div><StatusBadge status={property.status} /></div><div className="report-checks">{checks.map(check => <div className={check.ok ? 'report-check' : 'report-check failed'} key={check.label}><span className="report-check-icon">{check.ok ? <Check size={16} /> : <X size={16} />}</span><div><span className="mono-label">{check.label}</span><strong>{check.value}</strong></div><span className="check-state">{check.ok ? 'PASS' : 'REVIEW'}</span></div>)}</div><div className="report-footer"><span className="mono-label">GENERATED FROM BLOCK {property.blockchainRecord}</span><button className="button button-lime" onClick={onGenerate}>GENERATE REPORT <ArrowUpRight size={16} /></button></div></section><section className="panel lender-note"><div className="note-icon"><WalletCards size={23} /></div><span className="section-kicker">WHY THIS MATTERS</span><h3>Less paper.<br /><em>More certainty.</em></h3><p>The bank does not need to trust a screenshot or chase separate offices. It can verify the title's current state and the proof behind it.</p><div className="lender-quote">“A property exists on paper.<br /><strong>A title exists in history.</strong>”</div></section></div></>;
}

function DisputesPage({ properties, selectedProperty, role, onSelect, onFreeze, onUnfreeze }: { properties: Property[]; selectedProperty: Property; role: Role; onSelect: (id: string) => void; onFreeze: () => void; onUnfreeze: () => void }) {
  const held = properties.filter(property => property.status === 'DISPUTED' || property.status === 'FROZEN');
  return <><PageHeader eyebrow="06 / COURT CONTROL" title="WHEN THE LAW SAYS STOP." description="A disputed title becomes non-transferable until an authorized court officer releases the legal hold." action={<div className="court-badge"><Gavel size={18} /> COURT OVERSIGHT</div>} /><div className="dispute-grid"><section className="panel dispute-list"><PanelHeader eyebrow="01 / ACTIVE HOLDS" title="Legal status by title" /><div className="hold-list">{properties.map(property => <button key={property.id} className={property.id === selectedProperty.id ? 'hold-row selected' : 'hold-row'} onClick={() => onSelect(property.id)}><span className={property.status === 'VERIFIED' ? 'hold-indicator clear' : 'hold-indicator'} /> <div><strong>{property.id}</strong><span>{property.location}</span></div><StatusBadge status={property.status} /><ChevronRight size={15} /></button>)}</div><div className="panel-foot"><span className="mono-label">{held.length.toString().padStart(2, '0')} TITLES REQUIRE COURT REVIEW</span><Scale size={17} /></div></section><section className="panel dispute-action"><PanelHeader eyebrow="02 / SELECTED TITLE" title={selectedProperty.id} action={<StatusBadge status={selectedProperty.status} />} /><div className="dispute-property"><div className="property-geo"><MapPinned size={20} /><span>{selectedProperty.location}<small>SURVEY {selectedProperty.surveyNumber} / {selectedProperty.area}</small></span></div><div className="dispute-reason"><span className="mono-label">LEGAL STATE</span><strong>{selectedProperty.disputeReason || 'NO ACTIVE LEGAL HOLD'}</strong><p>{selectedProperty.status === 'VERIFIED' ? 'This title is available for ordinary verified transfer workflows.' : 'Smart-contract transfer functions are disabled while this status is active.'}</p></div></div><div className="court-console"><div className="role-callout"><div className="avatar-square">{role.slice(0, 2)}</div><div><span className="mono-label">CURRENT AUTHORITY</span><strong>{roleLabels[role]}</strong></div></div><div className="court-actions">{selectedProperty.status === 'DISPUTED' || selectedProperty.status === 'FROZEN' ? <button className="button button-lime" onClick={onUnfreeze}><Check size={16} /> RESOLVE + UNFREEZE</button> : <button className="button button-danger" onClick={onFreeze}><Gavel size={16} /> FREEZE PROPERTY</button>}</div></div><div className={selectedProperty.status === 'VERIFIED' ? 'freeze-banner clear' : 'freeze-banner'}>{selectedProperty.status === 'VERIFIED' ? <><ShieldCheck size={20} /><span><strong>TRANSFER AVAILABLE</strong><small>Registrar approval is the only remaining legal gate.</small></span></> : <><ShieldAlert size={20} /><span><strong>PROPERTY FROZEN / TRANSFER BLOCKED</strong><small>Sale, ownership change, and title update functions are disabled.</small></span></>}</div></section></div></>;
}

function AuditPage({ events }: { events: AuditEvent[] }) {
  return <><PageHeader eyebrow="07 / IMMUTABLE AUDIT TRAIL" title="EVERY CHANGE LEAVES A MARK." description="LandChain records the actor, property, action, and outcome for every important registry event." action={<div className="ledger-count"><Blocks size={17} /> BLOCK 018492 / FINAL</div>} /><section className="audit-overview"><div><span className="section-kicker">LEDGER INTEGRITY</span><strong>ALL EVENTS ACCOUNTED FOR</strong></div><div><span className="mono-label">EVENTS THIS SESSION</span><strong>{events.length.toString().padStart(2, '0')}</strong></div><div><span className="mono-label">PUBLIC PROOF</span><strong>SHA-256</strong></div><div><span className="mono-label">RETENTION</span><strong>PERMANENT</strong></div></section><section className="panel full-audit"><div className="full-audit-head"><div><span className="section-kicker">LIVE EVENT STREAM</span><h2>Registry activity</h2></div><span className="live-label"><span className="live-dot" /> RECORDING</span></div><AuditList events={events} /><div className="audit-chain-footer"><span>PREVIOUS BLOCK / 018491</span><ArrowRight size={17} /><span>CURRENT BLOCK / 018492</span><ArrowRight size={17} /><span>NEXT BLOCK / PENDING</span></div></section></>;
}

function PanelHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="panel-header"><div><span className="section-kicker">{eyebrow}</span><h2>{title}</h2></div>{action}</div>;
}

function MetricCard({ label, value, note, icon, tone = 'default' }: { label: string; value: string; note: string; icon: ReactNode; tone?: 'default' | 'lime' | 'danger' }) {
  return <article className={`metric-card metric-${tone}`}><div className="metric-icon">{icon}</div><span className="mono-label">{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function StatusBadge({ status }: { status: PropertyStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><span />{statusLabels[status]}</span>;
}

function DigitalTitle({ property, onVerify, onCopyHash }: { property: Property; onVerify: () => void; onCopyHash: () => void }) {
  return <article className="title-card"><div className="title-card-top"><div><span className="section-kicker">LANDCHAIN DIGITAL TITLE</span><h3>{property.id}</h3></div><StatusBadge status={property.status} /></div><div className="title-card-body"><div className="title-emblem"><div className="emblem-grid"><span /><span /><span /><span /></div><small>LC / {property.registeredAt.slice(-8, -6) || '26'}</small></div><div className="title-facts"><div><span className="mono-label">SURVEY NUMBER</span><strong>{property.surveyNumber}</strong></div><div><span className="mono-label">AREA</span><strong>{property.area}</strong></div><div><span className="mono-label">OWNER REFERENCE</span><strong>{property.ownerReference}</strong></div><div><span className="mono-label">REGISTERED</span><strong>{property.registeredAt.split(' / ')[0]}</strong></div></div></div><div className="title-hash"><div><span className="mono-label">DOCUMENT HASH / SHA-256</span><code>{shortHash(property.blockchainHash)}</code></div><button className="square-button" onClick={onCopyHash} aria-label="Copy document hash"><Copy size={15} /></button></div><div className="title-chain"><span className="mono-label">BLOCKCHAIN RECORD</span><code>{property.blockchainRecord}</code><span className="chain-verified"><Check size={13} /> VERIFIED</span></div><div className="title-card-actions"><button className="button button-lime" onClick={onVerify}>VERIFY DOCUMENT <FileCheck2 size={15} /></button><span className="mono-label">OWNER HISTORY / {property.history.length} EVENTS</span></div></article>;
}

function HashRow({ label, value, display, icon, onCopy }: { label: string; value: string; display: string; icon: ReactNode; onCopy: () => void }) {
  return <div className="hash-row"><div className="hash-row-label">{icon}<span className="mono-label">{label}</span></div><code title={value}>{display}</code><button className="icon-button" onClick={onCopy} aria-label={`Copy ${label.toLowerCase()}`}><Clipboard size={14} /></button></div>;
}

function OwnershipTimeline({ property }: { property: Property }) {
  return <div className="ownership-timeline">{property.history.map((event, index) => <div className="ownership-event" key={`${event.date}-${event.title}`}><span className={index === 0 ? 'timeline-node current' : 'timeline-node'}>{index === 0 ? <Check size={11} /> : <span />}</span><div><span className="mono-label">{event.date} / {event.tag}</span><strong>{event.title}</strong><p>{event.detail}</p></div></div>)}</div>;
}

function AuditList({ events, compact = false }: { events: AuditEvent[]; compact?: boolean }) {
  return <div className={compact ? 'audit-list compact' : 'audit-list'}>{events.map(event => <div className="audit-event" key={event.id}><span className={`audit-status audit-${event.status.toLowerCase()}`} /> <div className="audit-event-main"><div><strong>{event.event}</strong><span className="mono-label">{event.property}</span></div><p>{event.detail}</p><span className="mono-label">{event.time} / {event.actor}</span></div><span className={`audit-outcome outcome-${event.status.toLowerCase()}`}>{event.status}</span></div>)}</div>;
}

export default App;

createRoot(document.getElementById('root')!).render(<App />);
