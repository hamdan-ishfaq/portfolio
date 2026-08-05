'use client';

import { useCallback, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { DepotWorld } from '@/components/public/DepotWorld';
import { SimulationScene } from '@/components/public/SimulationScene';
import { useLocale } from '@/components/providers/LocaleProvider';
import {
  SIM_NODES,
  canPost,
  createSimState,
  isCycleComplete,
  nodeStatus,
  postDocument,
  simCopy,
  type SimCycle,
  type SimLocale,
  type SimNodeId,
  type SimNodeStatus,
  type SimState,
} from '@/lib/content/p2p-simulation';

const STATUS_STYLE: Record<SimNodeStatus, string> = {
  posted: 'border-secondary/45 bg-secondary/[0.08]',
  blocked: 'border-amber-500/45 bg-amber-500/[0.08]',
  available: 'border-primary/50 bg-primary/[0.07]',
  locked: 'border-white/8 bg-white/[0.02] opacity-60',
};

const DOT_STYLE: Record<SimNodeStatus, string> = {
  posted: 'bg-secondary',
  blocked: 'bg-amber-500',
  available: 'bg-primary animate-pulse',
  locked: 'bg-on-surface-variant/40',
};

type P2PSimulatorProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function P2PSimulator({ isOpen, onClose }: P2PSimulatorProps) {
  const { locale } = useLocale();
  const simLocale: SimLocale = locale === 'de' ? 'de' : 'en';
  const copy = simCopy(simLocale);
  // Driving is motion by definition, so reduced-motion users get the static
  // clickable network instead.
  const prefersReducedMotion = useReducedMotion();

  const [state, setState] = useState<SimState>(() => createSimState());
  const [message, setMessage] = useState<string | null>(null);

  const select = useCallback(
    (id: SimNodeId) => {
      const check = canPost(state, id, simLocale);
      if (!check.ok) {
        setMessage(check.reason);
        return;
      }
      setMessage(null);
      setState(postDocument(state, id, simLocale));
    },
    [state, simLocale]
  );

  const reset = useCallback(() => {
    setState((current) => createSimState(current.variance));
    setMessage(null);
  }, []);

  const toggleVariance = useCallback(() => {
    setState((current) => createSimState(!current.variance));
    setMessage(null);
  }, []);

  const grouped = useMemo(() => {
    const byCycle: Record<SimCycle, typeof SIM_NODES> = { p2p: [], o2c: [] };
    for (const node of SIM_NODES) byCycle[node.cycle].push(node);
    return byCycle;
  }, []);

  const documents = state.order.map((id) => state.posted[id]!);
  const complete = isCycleComplete(state);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={copy.ui.title} id="p2p-simulator" size="xl">
      {/* Below lg the dialog is one scrolling column; wide viewports get the
          depot on the left and a steps/ledger rail on the right. */}
      <div className="flex h-full min-h-0 flex-col overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:overflow-hidden">
        {/* Depot */}
        <div className="relative h-[320px] shrink-0 border-b border-white/8 lg:h-auto lg:border-b-0 lg:border-r">
          {prefersReducedMotion ? (
            <SimulationScene
              state={state}
              locale={simLocale}
              onSelect={select}
              className="absolute inset-0"
            />
          ) : (
            <DepotWorld
              state={state}
              locale={simLocale}
              onDock={select}
              className="absolute inset-0"
            />
          )}
        </div>

        <div className="flex flex-col lg:min-h-0">
          {/* Steps */}
          <div className="flex flex-col border-b border-white/8 lg:min-h-0 lg:flex-1">
            <div className="shrink-0 border-b border-white/8 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="type-label">{copy.ui.steps}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant tabular-nums">
                  {state.order.length}/{SIM_NODES.length} {copy.ui.progress}
                </p>
              </div>
              {prefersReducedMotion ? (
                <p className="mt-2 text-[11px] leading-relaxed text-on-surface-variant">
                  {copy.ui.lead}
                </p>
              ) : (
                <>
                  <p className="mt-2 hidden text-[11px] leading-relaxed text-on-surface-variant lg:block">
                    {copy.ui.driveHint}
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-on-surface-variant lg:hidden">
                    {copy.ui.driveHintTouch}
                  </p>
                </>
              )}
            </div>

            <div className="px-4 py-4 space-y-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
              {(['p2p', 'o2c'] as SimCycle[]).map((cycle) => (
                <div key={cycle} className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
                    {copy.cycles[cycle]}
                  </p>
                  {grouped[cycle].map((node) => {
                    const status = nodeStatus(state, node.id, simLocale);
                    const document = state.posted[node.id];
                    const locked = status === 'locked';
                    return (
                      <div key={node.id}>
                        <button
                          type="button"
                          onClick={() => select(node.id)}
                          disabled={Boolean(document)}
                          aria-describedby={locked ? `sim-hint-${node.id}` : undefined}
                          className={`w-full rounded border px-3 py-2.5 text-left transition-colors ${STATUS_STYLE[status]} ${
                            document ? 'cursor-default' : 'hover:border-primary/60'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className={`size-1.5 shrink-0 rounded-full ${DOT_STYLE[status]}`}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[0.8125rem] font-medium text-on-surface">
                                {copy.nodes[node.id].title}
                              </span>
                              <span className="block font-mono text-[10px] text-on-surface-variant">
                                {node.transaction}
                                {document ? ` · ${document.number}` : ''}
                              </span>
                            </span>
                            <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-on-surface-variant">
                              {status === 'posted'
                                ? copy.ui.posted
                                : status === 'blocked'
                                  ? copy.ui.blockedForPayment
                                  : status === 'available'
                                    ? copy.ui.post
                                    : copy.ui.locked}
                            </span>
                          </span>
                        </button>
                        {/* Sibling, not a child — a description inside the button
                          would be swallowed into its accessible name. */}
                        {locked ? (
                          <span id={`sim-hint-${node.id}`} className="sr-only">
                            {copy.nodes[node.id].blocked}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="shrink-0 space-y-3 border-t border-white/8 px-4 py-3">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={state.variance}
                  onChange={toggleVariance}
                  className="mt-0.5 size-3.5 shrink-0 accent-[color:var(--ds-accent-bright)]"
                />
                <span>
                  <span className="block text-[0.8125rem] text-on-surface">{copy.ui.variance}</span>
                  <span className="block text-[11px] leading-relaxed text-on-surface-variant">
                    {copy.ui.varianceHint}
                  </span>
                </span>
              </label>
              <button
                type="button"
                onClick={reset}
                className="w-full rounded border border-white/12 px-3 py-2 text-[0.8125rem] text-on-surface-variant transition-colors hover:border-white/25 hover:text-on-surface"
              >
                {copy.ui.reset}
              </button>
            </div>
          </div>

          {/* Ledger */}
          <div className="flex flex-col border-t border-white/8 lg:min-h-0 lg:flex-1">
            <div className="shrink-0 border-b border-white/8 px-4 py-3">
              <p className="type-label">{copy.ui.ledger}</p>
            </div>

            <div
              className="px-4 py-4 space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
              aria-live="polite"
              aria-atomic="false"
            >
              {message ? (
                <p className="rounded border border-amber-500/40 bg-amber-500/[0.08] px-3 py-2 text-xs leading-relaxed text-on-surface">
                  {message}
                </p>
              ) : null}

              {documents.length === 0 && !message ? (
                <p className="text-xs leading-relaxed text-on-surface-variant">{copy.ui.empty}</p>
              ) : null}

              {documents.map((document) => (
                <article
                  key={document.number}
                  className={`rounded border px-3 py-2.5 ${
                    document.blockedForPayment
                      ? 'border-amber-500/40 bg-amber-500/[0.06]'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <header className="mb-2 flex items-baseline justify-between gap-2">
                    <h4 className="text-[0.8125rem] font-semibold text-on-surface">
                      {document.docType}
                    </h4>
                    <span className="font-mono text-[10px] text-primary tabular-nums">
                      {document.number}
                    </span>
                  </header>
                  <dl className="space-y-1">
                    {document.fields.map((field) => (
                      <div key={field.label} className="flex gap-2 text-[11px] leading-relaxed">
                        <dt className="w-24 shrink-0 text-on-surface-variant">{field.label}</dt>
                        <dd className="min-w-0 flex-1 text-on-surface">{field.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {document.references.length > 0 ? (
                    <p className="mt-2 border-t border-white/8 pt-2 font-mono text-[10px] text-on-surface-variant">
                      {copy.ui.references}: {document.references.join(' · ')}
                    </p>
                  ) : null}
                </article>
              ))}

              {complete ? (
                <p className="rounded border border-secondary/45 bg-secondary/[0.08] px-3 py-2 text-xs text-on-surface">
                  {copy.ui.complete}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
