/**
 * Procure-to-Pay / Order-to-Cash document engine.
 *
 * Pure logic — no React, no Three.js. Posting a document is only allowed when
 * its predecessor documents exist, which is the point of the whole exercise:
 * you cannot receive goods against a purchase order that was never created.
 *
 * Document numbers are deterministic so a given sequence always reproduces the
 * same ledger.
 */

export type SimLocale = 'en' | 'de';
export type SimCycle = 'p2p' | 'o2c';

export type SimNodeId = 'pr' | 'po' | 'gr' | 'iv' | 'pay' | 'so' | 'dlv' | 'gi' | 'bil';

export type SimNode = {
  id: SimNodeId;
  cycle: SimCycle;
  transaction: string;
  requires: SimNodeId[];
  /** Ring position, shared by the hero teaser and the simulator scene. */
  position: [number, number, number];
};

/** Ring order is process order — travelling the ring walks the cycle. */
const RING: SimNodeId[] = ['pr', 'po', 'gr', 'iv', 'pay', 'so', 'dlv', 'gi', 'bil'];

export const RING_RADIUS = 2.75;

/**
 * `yFactor` flattens or rounds the ring so it fills whatever panel shape it is
 * given — a tall panel gets a rounder ring, a wide one a flatter ellipse.
 */
export function ringPositionFor(id: SimNodeId, yFactor = 0.62): [number, number, number] {
  const angle = (RING.indexOf(id) / RING.length) * Math.PI * 2 - Math.PI / 2;
  return [
    Math.cos(angle) * RING_RADIUS,
    Math.sin(angle) * RING_RADIUS * yFactor,
    Math.sin(angle * 2) * 0.55,
  ];
}

/** Ring flatness that best fills a panel of the given aspect ratio. */
export function ringYFactor(aspect: number): number {
  if (aspect >= 1.5) return 0.55;
  if (aspect >= 1.1) return 0.68;
  if (aspect >= 0.85) return 0.85;
  return 1;
}

const NODE_DEFS: Array<Omit<SimNode, 'position'>> = [
  { id: 'pr', cycle: 'p2p', transaction: 'ME51N', requires: [] },
  { id: 'po', cycle: 'p2p', transaction: 'ME21N', requires: ['pr'] },
  { id: 'gr', cycle: 'p2p', transaction: 'MIGO', requires: ['po'] },
  { id: 'iv', cycle: 'p2p', transaction: 'MIRO', requires: ['po', 'gr'] },
  { id: 'pay', cycle: 'p2p', transaction: 'F-53', requires: ['iv'] },
  { id: 'so', cycle: 'o2c', transaction: 'VA01', requires: ['gr'] },
  { id: 'dlv', cycle: 'o2c', transaction: 'VL01N', requires: ['so'] },
  { id: 'gi', cycle: 'o2c', transaction: 'VL02N', requires: ['dlv'] },
  { id: 'bil', cycle: 'o2c', transaction: 'VF01', requires: ['gi'] },
];

export const SIM_NODES: SimNode[] = NODE_DEFS.map((node) => ({
  ...node,
  position: ringPositionFor(node.id),
}));

export function getSimNode(id: SimNodeId): SimNode {
  const node = SIM_NODES.find((n) => n.id === id);
  if (!node) throw new Error(`Unknown simulation node: ${id}`);
  return node;
}

/** Process flow plus the reference links that make a three-way match possible. */
export const SIM_EDGES: Array<{ from: SimNodeId; to: SimNodeId; kind: 'flow' | 'reference' }> = [
  { from: 'pr', to: 'po', kind: 'flow' },
  { from: 'po', to: 'gr', kind: 'flow' },
  { from: 'gr', to: 'iv', kind: 'flow' },
  { from: 'iv', to: 'pay', kind: 'flow' },
  { from: 'gr', to: 'so', kind: 'flow' },
  { from: 'so', to: 'dlv', kind: 'flow' },
  { from: 'dlv', to: 'gi', kind: 'flow' },
  { from: 'gi', to: 'bil', kind: 'flow' },
  { from: 'po', to: 'iv', kind: 'reference' },
  { from: 'dlv', to: 'bil', kind: 'reference' },
];

// --- Master data -----------------------------------------------------------

export const SIM_MASTER = {
  companyCode: '1000',
  plant: '1000',
  storageLocation: '0001',
  material: '100-UREA-50',
  vendor: 'V-100234',
  customer: 'C-500118',
  quantity: '500 BAG',
  unitPrice: '4,800.00',
  netValue: '2,400,000.00',
  varianceUnitPrice: '4,900.00',
  varianceValue: '2,450,000.00',
  varianceDelta: '50,000.00',
  currency: 'PKR',
  paymentTerms: 'NT30',
} as const;

const DOC_NUMBERS: Record<SimNodeId, string> = {
  pr: '10004521',
  po: '4500000123',
  gr: '5000000456',
  iv: '5105600123',
  pay: '1500000089',
  so: '0000012345',
  dlv: '0080001234',
  gi: '4900001234',
  bil: '0090001234',
};

// --- Copy ------------------------------------------------------------------

type NodeCopy = { short: string; title: string; docType: string; blocked: string };

type SimCopy = {
  nodes: Record<SimNodeId, NodeCopy>;
  fields: Record<string, string>;
  cycles: Record<SimCycle, string>;
  ui: Record<string, string>;
  match: { cleared: string; variance: string };
};

const EN: SimCopy = {
  nodes: {
    pr: {
      short: 'Purchase Req.',
      title: 'Purchase Requisition',
      docType: 'Purchase requisition',
      blocked: '',
    },
    po: {
      short: 'Purchase Order',
      title: 'Purchase Order',
      docType: 'Purchase order',
      blocked: 'No purchase requisition exists to convert.',
    },
    gr: {
      short: 'Goods Receipt',
      title: 'Goods Receipt',
      docType: 'Material document',
      blocked: 'No purchase order found. Goods cannot be received against a missing document.',
    },
    iv: {
      short: 'Invoice',
      title: 'Invoice Verification',
      docType: 'Invoice document',
      blocked: 'Three-way match requires both a purchase order and a posted goods receipt.',
    },
    pay: {
      short: 'Payment',
      title: 'Outgoing Payment',
      docType: 'Payment document',
      blocked: 'Invoice not posted, or blocked for payment by a variance.',
    },
    so: {
      short: 'Sales Order',
      title: 'Sales Order',
      docType: 'Sales order',
      blocked: 'No unrestricted stock available. Post the goods receipt first.',
    },
    dlv: {
      short: 'Delivery',
      title: 'Outbound Delivery',
      docType: 'Outbound delivery',
      blocked: 'No sales order to deliver against.',
    },
    gi: {
      short: 'Goods Issue',
      title: 'Goods Issue',
      docType: 'Material document',
      blocked: 'No outbound delivery exists.',
    },
    bil: {
      short: 'Billing',
      title: 'Billing Document',
      docType: 'Billing document',
      blocked: 'Goods issue not posted. Billing requires a completed delivery.',
    },
  },
  fields: {
    vendor: 'Vendor',
    customer: 'Customer',
    material: 'Material',
    quantity: 'Quantity',
    plant: 'Plant',
    storageLocation: 'Storage location',
    netValue: 'Net value',
    movementType: 'Movement type',
    companyCode: 'Company code',
    paymentTerms: 'Payment terms',
    unitPrice: 'Unit price',
    invoiceValue: 'Invoice value',
    match: 'Three-way match',
    stock: 'Stock effect',
    billingValue: 'Billing value',
    clearedItem: 'Cleared item',
  },
  cycles: { p2p: 'Procure-to-Pay', o2c: 'Order-to-Cash' },
  ui: {
    title: 'Document flow simulation',
    lead: 'Post each document in sequence. Steps stay locked until their predecessor exists — the same way the cycle behaves in a live system.',
    steps: 'Process steps',
    ledger: 'Document ledger',
    empty: 'No documents posted yet. Start with the purchase requisition.',
    post: 'Post',
    posted: 'Posted',
    locked: 'Locked',
    available: 'Available',
    blockedForPayment: 'Blocked',
    reset: 'Reset',
    variance: 'Inject price variance',
    varianceHint: 'Simulates a supplier invoice above the PO price, which blocks payment.',
    references: 'References',
    open: 'Run simulation',
    close: 'Close simulation',
    complete: 'Cycle complete — all nine documents posted.',
    progress: 'posted',
    driveHint: 'Drive with W A S D or the arrow keys. Pull up to a building to post its document.',
    driveHintTouch: 'Use the on-screen controls. Pull up to a building to post its document.',
    recentre: 'Recentre vehicle',
    accelerate: 'Accelerate',
    reverse: 'Reverse',
    steerLeft: 'Steer left',
    steerRight: 'Steer right',
  },
  match: {
    cleared: 'PO / GR / Invoice agree on quantity and price. Cleared for payment.',
    variance: `Price variance +${SIM_MASTER.varianceDelta} ${SIM_MASTER.currency} against the purchase order. Blocked for payment.`,
  },
};

const DE: SimCopy = {
  nodes: {
    pr: { short: 'Banf', title: 'Bestellanforderung', docType: 'Bestellanforderung', blocked: '' },
    po: {
      short: 'Bestellung',
      title: 'Bestellung',
      docType: 'Bestellung',
      blocked: 'Es existiert keine Bestellanforderung zur Umsetzung.',
    },
    gr: {
      short: 'Wareneingang',
      title: 'Wareneingang',
      docType: 'Materialbeleg',
      blocked: 'Keine Bestellung gefunden. Wareneingang ohne Bestellbezug nicht möglich.',
    },
    iv: {
      short: 'Rechnung',
      title: 'Rechnungsprüfung',
      docType: 'Rechnungsbeleg',
      blocked: 'Der Dreifachabgleich benötigt eine Bestellung und einen gebuchten Wareneingang.',
    },
    pay: {
      short: 'Zahlung',
      title: 'Ausgangszahlung',
      docType: 'Zahlungsbeleg',
      blocked: 'Rechnung nicht gebucht oder wegen Abweichung zahlungsgesperrt.',
    },
    so: {
      short: 'Kundenauftrag',
      title: 'Kundenauftrag',
      docType: 'Kundenauftrag',
      blocked: 'Kein frei verwendbarer Bestand. Zuerst Wareneingang buchen.',
    },
    dlv: {
      short: 'Lieferung',
      title: 'Auslieferung',
      docType: 'Auslieferung',
      blocked: 'Kein Kundenauftrag für die Lieferung vorhanden.',
    },
    gi: {
      short: 'Warenausgang',
      title: 'Warenausgang',
      docType: 'Materialbeleg',
      blocked: 'Keine Auslieferung vorhanden.',
    },
    bil: {
      short: 'Faktura',
      title: 'Faktura',
      docType: 'Fakturabeleg',
      blocked:
        'Warenausgang nicht gebucht. Die Faktura setzt eine abgeschlossene Lieferung voraus.',
    },
  },
  fields: {
    vendor: 'Lieferant',
    customer: 'Kunde',
    material: 'Material',
    quantity: 'Menge',
    plant: 'Werk',
    storageLocation: 'Lagerort',
    netValue: 'Nettowert',
    movementType: 'Bewegungsart',
    companyCode: 'Buchungskreis',
    paymentTerms: 'Zahlungsbedingungen',
    unitPrice: 'Preis je Einheit',
    invoiceValue: 'Rechnungswert',
    match: 'Dreifachabgleich',
    stock: 'Bestandswirkung',
    billingValue: 'Fakturawert',
    clearedItem: 'Ausgeglichene Position',
  },
  cycles: { p2p: 'Procure-to-Pay', o2c: 'Order-to-Cash' },
  ui: {
    title: 'Belegfluss-Simulation',
    lead: 'Buchen Sie die Belege der Reihe nach. Schritte bleiben gesperrt, bis der Vorgängerbeleg existiert — genau wie im Live-System.',
    steps: 'Prozessschritte',
    ledger: 'Belegübersicht',
    empty: 'Noch keine Belege gebucht. Beginnen Sie mit der Bestellanforderung.',
    post: 'Buchen',
    posted: 'Gebucht',
    locked: 'Gesperrt',
    available: 'Verfügbar',
    blockedForPayment: 'Gesperrt',
    reset: 'Zurücksetzen',
    variance: 'Preisabweichung erzeugen',
    varianceHint:
      'Simuliert eine Lieferantenrechnung über dem Bestellpreis, die die Zahlung sperrt.',
    references: 'Referenzen',
    open: 'Simulation starten',
    close: 'Simulation schließen',
    complete: 'Zyklus abgeschlossen — alle neun Belege gebucht.',
    progress: 'gebucht',
    driveHint:
      'Steuern Sie mit W A S D oder den Pfeiltasten. Fahren Sie an ein Gebäude heran, um den Beleg zu buchen.',
    driveHintTouch:
      'Nutzen Sie die Bildschirmsteuerung. Fahren Sie an ein Gebäude heran, um den Beleg zu buchen.',
    recentre: 'Fahrzeug zurücksetzen',
    accelerate: 'Beschleunigen',
    reverse: 'Rückwärts',
    steerLeft: 'Nach links lenken',
    steerRight: 'Nach rechts lenken',
  },
  match: {
    cleared:
      'Bestellung / Wareneingang / Rechnung stimmen in Menge und Preis überein. Zahlung freigegeben.',
    variance: `Preisabweichung +${SIM_MASTER.varianceDelta} ${SIM_MASTER.currency} gegenüber der Bestellung. Zahlung gesperrt.`,
  },
};

export function simCopy(locale: SimLocale): SimCopy {
  return locale === 'de' ? DE : EN;
}

// --- State -----------------------------------------------------------------

export type DocumentField = { label: string; value: string };

export type PostedDocument = {
  nodeId: SimNodeId;
  docType: string;
  number: string;
  transaction: string;
  fields: DocumentField[];
  references: string[];
  /** A blocked invoice still exists as a document; it just cannot be paid. */
  blockedForPayment: boolean;
  note?: string;
};

export type SimState = {
  posted: Partial<Record<SimNodeId, PostedDocument>>;
  order: SimNodeId[];
  variance: boolean;
};

export function createSimState(variance = false): SimState {
  return { posted: {}, order: [], variance };
}

export type PostCheck = { ok: true } | { ok: false; reason: string };

export function canPost(state: SimState, id: SimNodeId, locale: SimLocale): PostCheck {
  const copy = simCopy(locale);
  if (state.posted[id]) return { ok: false, reason: copy.ui.posted };

  const node = getSimNode(id);
  const missing = node.requires.filter((req) => !state.posted[req]);
  if (missing.length > 0) return { ok: false, reason: copy.nodes[id].blocked };

  if (id === 'pay' && state.posted.iv?.blockedForPayment) {
    return { ok: false, reason: copy.nodes.pay.blocked };
  }

  return { ok: true };
}

function buildDocument(state: SimState, id: SimNodeId, locale: SimLocale): PostedDocument {
  const copy = simCopy(locale);
  const f = copy.fields;
  const m = SIM_MASTER;
  const node = getSimNode(id);
  const number = DOC_NUMBERS[id];
  const base = {
    nodeId: id,
    docType: copy.nodes[id].docType,
    number,
    transaction: node.transaction,
    blockedForPayment: false,
  };

  switch (id) {
    case 'pr':
      return {
        ...base,
        fields: [
          { label: f.material, value: `${m.material} · ${m.quantity}` },
          { label: f.plant, value: m.plant },
          { label: f.storageLocation, value: m.storageLocation },
        ],
        references: [],
      };
    case 'po':
      return {
        ...base,
        fields: [
          { label: f.vendor, value: m.vendor },
          { label: f.material, value: `${m.material} · ${m.quantity}` },
          { label: f.unitPrice, value: `${m.unitPrice} ${m.currency}` },
          { label: f.netValue, value: `${m.netValue} ${m.currency}` },
          { label: f.paymentTerms, value: m.paymentTerms },
        ],
        references: [DOC_NUMBERS.pr],
      };
    case 'gr':
      return {
        ...base,
        fields: [
          { label: f.movementType, value: '101' },
          { label: f.material, value: `${m.material} · ${m.quantity}` },
          { label: f.plant, value: `${m.plant} / ${m.storageLocation}` },
          { label: f.stock, value: `+${m.quantity}` },
        ],
        references: [DOC_NUMBERS.po],
      };
    case 'iv': {
      const variance = state.variance;
      return {
        ...base,
        fields: [
          { label: f.vendor, value: m.vendor },
          {
            label: f.unitPrice,
            value: `${variance ? m.varianceUnitPrice : m.unitPrice} ${m.currency}`,
          },
          {
            label: f.invoiceValue,
            value: `${variance ? m.varianceValue : m.netValue} ${m.currency}`,
          },
          { label: f.match, value: variance ? copy.match.variance : copy.match.cleared },
        ],
        references: [DOC_NUMBERS.po, DOC_NUMBERS.gr],
        blockedForPayment: variance,
        note: variance ? copy.match.variance : undefined,
      };
    }
    case 'pay':
      return {
        ...base,
        fields: [
          { label: f.companyCode, value: m.companyCode },
          { label: f.vendor, value: m.vendor },
          { label: f.clearedItem, value: `${DOC_NUMBERS.iv} · ${m.netValue} ${m.currency}` },
        ],
        references: [DOC_NUMBERS.iv],
      };
    case 'so':
      return {
        ...base,
        fields: [
          { label: f.customer, value: m.customer },
          { label: f.material, value: `${m.material} · ${m.quantity}` },
          { label: f.plant, value: m.plant },
        ],
        references: [],
      };
    case 'dlv':
      return {
        ...base,
        fields: [
          { label: f.customer, value: m.customer },
          { label: f.quantity, value: m.quantity },
          { label: f.storageLocation, value: m.storageLocation },
        ],
        references: [DOC_NUMBERS.so],
      };
    case 'gi':
      return {
        ...base,
        fields: [
          { label: f.movementType, value: '601' },
          { label: f.material, value: `${m.material} · ${m.quantity}` },
          { label: f.stock, value: `−${m.quantity}` },
        ],
        references: [DOC_NUMBERS.dlv],
      };
    case 'bil':
      return {
        ...base,
        fields: [
          { label: f.customer, value: m.customer },
          { label: f.billingValue, value: `${m.netValue} ${m.currency}` },
          { label: f.companyCode, value: m.companyCode },
        ],
        references: [DOC_NUMBERS.dlv, DOC_NUMBERS.gi],
      };
  }
}

export function postDocument(state: SimState, id: SimNodeId, locale: SimLocale): SimState {
  if (!canPost(state, id, locale).ok) return state;
  const document = buildDocument(state, id, locale);
  return {
    ...state,
    posted: { ...state.posted, [id]: document },
    order: [...state.order, id],
  };
}

export type SimNodeStatus = 'posted' | 'blocked' | 'available' | 'locked';

/** Shared by the 3D scene and the accessible step list so they never disagree. */
export function nodeStatus(state: SimState, id: SimNodeId, locale: SimLocale): SimNodeStatus {
  const document = state.posted[id];
  if (document) return document.blockedForPayment ? 'blocked' : 'posted';
  return canPost(state, id, locale).ok ? 'available' : 'locked';
}

export function isCycleComplete(state: SimState): boolean {
  return SIM_NODES.every((node) => state.posted[node.id]);
}
