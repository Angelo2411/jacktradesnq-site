'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export type VariantKey = string;
export type SmtKey = string;
type LookbackKey = '3mo' | '6mo' | '1y' | '5y' | 'all';

export type BestCombo = {
  variant: VariantKey;
  smt: SmtKey;
  lookback: LookbackKey;
  pf: number;
};

const DEFAULT_VARIANT_OPTS: Array<{ key: string; label: string }> = [
  { key: 'tp1_be', label: 'TP1 + BE' },
  { key: 'be_50',  label: 'TP only + BE' },
  { key: 'no_be',  label: 'TP only' },
];

const DEFAULT_SMT_OPTS: Array<{ key: string; label: string }> = [
  { key: 'on',  label: 'SMT on' },
  { key: 'off', label: 'SMT off' },
];

const LOOKBACK_OPTS: Array<{ key: LookbackKey; label: string }> = [
  { key: '6mo', label: '6 mo' },
  { key: '1y',  label: '1 yr' },
  { key: 'all', label: 'All' },
];

// Defaults — absent from URL means default
const DEFAULT_VARIANT: VariantKey = 'tp1_be';
const DEFAULT_SMT: SmtKey = 'on';
const DEFAULT_LOOKBACK: LookbackKey = '1y';

export function useFilterState(opts?: { defaultVariant?: string; defaultSmt?: string; defaultTp?: string }) {
  const searchParams = useSearchParams();
  const variant = (searchParams.get('variant') as VariantKey) || opts?.defaultVariant || DEFAULT_VARIANT;
  const smt = (searchParams.get('smt') as SmtKey) || opts?.defaultSmt || DEFAULT_SMT;
  const lookback = (searchParams.get('lookback') as LookbackKey) || DEFAULT_LOOKBACK;
  const tp = searchParams.get('tp') || opts?.defaultTp || '';
  return { variant, smt, lookback, tp, smtOn: smt === 'on' };
}

export default function FilterBar({
  hasSmtToggle = true,
  bestCombo = null,
  variantOptions,
  smtOptions,
  tpOptions,
  variantLabel,
  smtLabel,
  tpLabel,
  defaultVariant = DEFAULT_VARIANT,
  defaultSmt = DEFAULT_SMT,
  defaultTp,
}: {
  hasSmtToggle?: boolean;
  bestCombo?: BestCombo | null;
  variantOptions?: Array<{ key: string; label: string }>;
  smtOptions?: Array<{ key: string; label: string }>;
  tpOptions?: Array<{ key: string; label: string }>;
  variantLabel?: string;
  smtLabel?: string;
  tpLabel?: string;
  defaultVariant?: string;
  defaultSmt?: string;
  defaultTp?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const variant = (searchParams.get('variant') as string) || defaultVariant;
  const smt = (searchParams.get('smt') as string) || defaultSmt;
  const tp = tpOptions ? (searchParams.get('tp') || defaultTp || tpOptions[0]?.key || '') : '';
  const lookback = (searchParams.get('lookback') as LookbackKey) || DEFAULT_LOOKBACK;

  const vOpts = variantOptions ?? DEFAULT_VARIANT_OPTS;
  const sOpts = smtOptions ?? DEFAULT_SMT_OPTS;

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      // Remove defaults to keep URL clean
      const isDefault =
        (key === 'variant' && value === defaultVariant) ||
        (key === 'smt' && value === defaultSmt) ||
        (key === 'tp' && value === defaultTp) ||
        (key === 'lookback' && value === DEFAULT_LOOKBACK);
      if (isDefault) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.replace(pathname + (qs ? '?' + qs : ''), { scroll: false });
    },
    [router, pathname, searchParams, defaultVariant, defaultSmt, defaultTp]
  );

  const reset = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('variant');
    params.delete('smt');
    params.delete('tp');
    params.delete('lookback');
    // Keep tab / year / day
    const qs = params.toString();
    router.replace(pathname + (qs ? '?' + qs : ''), { scroll: false });
  }, [router, pathname, searchParams]);

  const applyBest = useCallback(() => {
    if (!bestCombo) return;
    const params = new URLSearchParams(searchParams.toString());
    if (bestCombo.variant === defaultVariant) params.delete('variant'); else params.set('variant', bestCombo.variant);
    if (bestCombo.smt === defaultSmt) params.delete('smt'); else params.set('smt', bestCombo.smt);
    if (bestCombo.lookback === DEFAULT_LOOKBACK) params.delete('lookback'); else params.set('lookback', bestCombo.lookback);
    const qs = params.toString();
    router.replace(pathname + (qs ? '?' + qs : ''), { scroll: false });
  }, [bestCombo, router, pathname, searchParams, defaultVariant, defaultSmt]);

  const isDefault =
    variant === defaultVariant &&
    smt === defaultSmt &&
    (!tpOptions || tp === defaultTp) &&
    lookback === DEFAULT_LOOKBACK;

  const isBestActive = bestCombo !== null &&
    variant === bestCombo.variant &&
    smt === bestCombo.smt &&
    lookback === bestCombo.lookback;

  return (
    <div className="fb-bar" role="toolbar" aria-label="Dashboard filters">
      {/* All filter groups in a flex cluster that fills available width */}
      <div className="fb-groups">
        {/* Variant group */}
        <div className="fb-group" role="group" aria-label={variantLabel ?? 'Variant'}>
          {(variantLabel ?? 'Variant') !== '' && <span className="fb-group-label">{variantLabel ?? 'Variant'}</span>}
          {vOpts.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={'fb-pill' + (variant === opt.key ? ' active' : '')}
              onClick={() => update('variant', opt.key)}
              aria-pressed={variant === opt.key}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {tpOptions && tpOptions.length > 0 && (
          <>
            <div className="fb-sep" aria-hidden="true" />
            <div className="fb-group" role="group" aria-label={tpLabel ?? 'TP'}>
              {(tpLabel ?? '') !== '' && <span className="fb-group-label">{tpLabel ?? 'TP'}</span>}
              {tpOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={'fb-pill' + (tp === opt.key ? ' active' : '')}
                  onClick={() => update('tp', opt.key)}
                  aria-pressed={tp === opt.key}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        {(hasSmtToggle || (smtOptions !== undefined && smtOptions.length > 0)) && (
          <>
            <div className="fb-sep" aria-hidden="true" />
            {/* SMT group */}
            <div className="fb-group" role="group" aria-label={smtLabel ?? 'SMT filter'}>
              {(smtLabel ?? '') !== '' && <span className="fb-group-label">{smtLabel ?? 'SMT filter'}</span>}
              {sOpts.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={'fb-pill' + (smt === opt.key ? ' active' : '')}
                  onClick={() => update('smt', opt.key)}
                  aria-pressed={smt === opt.key}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="fb-sep" aria-hidden="true" />

        {/* Lookback group */}
        <div className="fb-group" role="group" aria-label="Lookback period">
          {LOOKBACK_OPTS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={'fb-pill' + (lookback === opt.key ? ' active' : '')}
              onClick={() => update('lookback', opt.key)}
              aria-pressed={lookback === opt.key}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Best combo button — right of groups, left of Reset */}
      {bestCombo !== null && (
        <button
          type="button"
          className={'fb-best' + (isBestActive ? ' active' : '')}
          onClick={applyBest}
          aria-pressed={isBestActive}
          title={`Auto-select best combo (PF ${bestCombo.pf.toFixed(2)})`}
        >
          Best · PF {bestCombo.pf.toFixed(2)}
        </button>
      )}

      {/* Reset floated to far right via margin-left: auto in CSS */}
      {!isDefault && (
        <button
          type="button"
          className="fb-reset"
          onClick={reset}
          aria-label="Reset all filters to defaults"
        >
          Reset
        </button>
      )}
    </div>
  );
}
