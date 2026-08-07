'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLocale } from '@/components/providers/LocaleProvider';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Primary process — Procure-to-Pay (MM). */
const P2P = [
  { code: 'PR', y: 40 },
  { code: 'PO', y: 100 },
  { code: 'GR', y: 160 },
  { code: 'IV', y: 220 },
] as const;

/** Secondary process — Order-to-Cash (SD), quieter weight. */
const O2C = [
  { code: 'SO', y: 40 },
  { code: 'DLV', y: 100 },
  { code: 'GI', y: 160 },
  { code: 'BIL', y: 220 },
] as const;

const P2P_X = 78;
const O2C_X = 322;
const BTP_Y = 130;

function NodeBlock({
  x,
  y,
  code,
  delay,
  reduced,
  muted = false,
}: {
  x: number;
  y: number;
  code: string;
  delay: number;
  reduced: boolean;
  muted?: boolean;
}) {
  const stroke = muted ? 'var(--color-on-surface-variant)' : 'var(--color-primary)';
  const strokeOpacity = muted ? 0.35 : 0.6;

  return (
    <motion.g
      initial={reduced ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      <rect
        x={x - 28}
        y={y - 14}
        width={56}
        height={28}
        rx={3}
        fill="color-mix(in srgb, var(--color-surface) 92%, transparent)"
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth="1.25"
      />
      {!reduced && !muted ? (
        <motion.rect
          x={x - 28}
          y={y - 14}
          width={56}
          height={28}
          rx={3}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.85, 0.2] }}
          transition={{
            duration: 2,
            delay: delay + 0.35,
            repeat: Infinity,
            repeatDelay: 2.4,
            ease: 'easeInOut',
          }}
        />
      ) : null}
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={muted ? 'var(--color-on-surface-variant)' : 'var(--color-on-surface)'}
        style={{
          fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        {code}
      </text>
    </motion.g>
  );
}

/**
 * Signature: MM P2P + SD O2C document lanes with a BTP integration bridge.
 * Agent/AI is intentionally not a co-equal lane — this is a techno-functional figure.
 */
export function BridgeGraph({ className = '' }: { className?: string }) {
  const { t } = useLocale();
  const prefersReducedMotion = useReducedMotion();
  const reduced = Boolean(prefersReducedMotion);

  return (
    <div className={`ops-shell ${className}`} role="img" aria-label={t('hero.bridgeAria')}>
      <div className="ops-shell__bar">
        <span className="ops-shell__title">{t('hero.bridgeTitle')}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
          MM / SD / BTP
        </span>
      </div>

      <div className="px-4 sm:px-5 pt-4 pb-5">
        <div className="grid grid-cols-2 gap-4 mb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
            {t('hero.erpLane')}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant text-right sm:text-left sm:pl-8">
            {t('hero.agentLane')}
          </p>
        </div>

        <svg
          viewBox="0 0 400 260"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <motion.line
            x1={P2P_X}
            y1={P2P[0].y}
            x2={P2P_X}
            y2={P2P[P2P.length - 1].y}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/12"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
          />
          <motion.line
            x1={O2C_X}
            y1={O2C[0].y}
            x2={O2C_X}
            y2={O2C[O2C.length - 1].y}
            stroke="currentColor"
            strokeWidth="1.25"
            className="text-white/10"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.65, delay: 0.2, ease: EASE }}
          />

          {/* BTP bridge — integration fabric between MM and SD cycles */}
          <motion.line
            x1={P2P_X + 30}
            y1={BTP_Y}
            x2={O2C_X - 30}
            y2={BTP_Y}
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 0.45, delay: 0.5, ease: EASE }}
          />
          <motion.rect
            x={178}
            y={BTP_Y - 12}
            width={44}
            height={24}
            rx={3}
            fill="color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))"
            stroke="var(--color-primary)"
            strokeWidth="1.25"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.58, ease: EASE }}
          />
          <motion.text
            x={200}
            y={BTP_Y + 4}
            textAnchor="middle"
            fill="var(--color-primary)"
            style={{
              fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.62, ease: EASE }}
          >
            BTP
          </motion.text>

          {!reduced ? (
            <motion.circle
              r="3.5"
              fill="var(--color-primary)"
              initial={{ cx: P2P_X + 30, cy: BTP_Y, opacity: 0 }}
              animate={{
                cx: [P2P_X + 30, O2C_X - 30, P2P_X + 30],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2.8,
                delay: 0.85,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ) : null}

          {P2P.map((node, i) => (
            <NodeBlock
              key={node.code}
              x={P2P_X}
              y={node.y}
              code={node.code}
              delay={0.16 + i * 0.1}
              reduced={reduced}
            />
          ))}
          {O2C.map((node, i) => (
            <NodeBlock
              key={node.code}
              x={O2C_X}
              y={node.y}
              code={node.code}
              delay={0.26 + i * 0.1}
              reduced={reduced}
              muted
            />
          ))}
        </svg>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          <p className="text-[12px] sm:text-[13px] leading-snug text-on-surface-variant font-sans max-w-[28ch]">
            {t('hero.erpGloss')}
          </p>
          <p className="text-[12px] sm:text-[13px] leading-snug text-on-surface-variant font-sans max-w-[28ch] sm:justify-self-end sm:text-right">
            {t('hero.agentGloss')}
          </p>
        </div>

        <p className="mt-4 pt-3 border-t border-white/8 text-[11px] leading-relaxed text-on-surface-variant/80 font-sans">
          {t('hero.aiAside')}
        </p>
      </div>
    </div>
  );
}
