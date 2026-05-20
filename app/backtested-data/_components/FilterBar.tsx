'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type VariantKey = 'tp1_be' | 'be_50' | 'no_be';
type SmtKey = 'on' | 'off';
type LookbackKey = '3mo' | '6mo' | '1y' | '5y' | 'all';

const VARIANT_OPTS: Array<{ key: VariantKey; label: string }> = [
  { key: 'tp1_be', label: 'TP1 + BE' },
  { key: 'be_50',  label: 'TP only + BE' },
  { key: 'no_be',  label: 'TP only' },
];

const SMT_OPTS: Array<{ key: SmtKey; label: string }> = [
  { key: 'on',  label: 'SMT on' },
  { key: 'off', label: 'SMT off' },
];

const LOOKBACK_OPTS: Array<{ key: LookbackKey; label: string }> = [
  { key: '3mo', label: '3 mo' },
  { key: '6mo', label: '6 mo' },
  { key: '1y',  label: '1 yr' },
  { key: '5y',  label: '5 yr' },
  { key: 'all', label: 'All' },
];

// Defaults — absent from URL means default
const DEFAULT_VARIANT: VariantKey = 'tp1_be';
const DEFAULT_SMT: SmtKey = 'on';
const DEFAULT_LOOKBACK: LookbackKey = 'all';

export function useFilterState() {
  const searchParams = useSearchParams();
  const variant = (searchParams.get('variant') as VariantKey) || DEFAULT_VARIANT;
  const smt = (searchParams.get('smt') as SmtKey) || DEFAULT_SMT;
  const lookback = (searchParams.get('lookback') as LookbackKey) || DEFAULT_LOOKBACK;
  return { variant, smt, lookback, smtOn: smt === 'on' };
}

export default function FilterBar({ hasSmtToggle = true }: { hasSmtToggle?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { variant, smt, lookback } = useFilterState();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      // Remove defaults to keep URL clean
      if (
        (key === 'variant' && value === DEFAULT_VARIANT) ||
        (key === 'smt' && value === DEFAULT_SMT) ||
        (key === 'lookback' && value === DEFAULT_LOOKBACK)
      ) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      router.replace(pathname + (qs ? '?' + qs : ''), { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const reset = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('variant');
    params.delete('smt');
    params.delete('lookback');
    // Keep tab / year / day
    const qs = params.toString();
    router.replace(pathname + (qs ? '?' + qs : ''), { scroll: false });
  }, [router, pathname, searchParams]);

  const isDefault =
    variant === DEFAULT_VARIANT &&
    smt === DEFAULT_SMT &&
    lookback === DEFAULT_LOOKBACK;

  return (
    <div className="fb-bar" role="toolbar" aria-label="Dashboard filters">
      {/* Variant group */}
      <div className="fb-group" role="group" aria-label="Variant">
        {VARIANT_OPTS.map((opt) => (
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

      {hasSmtToggle && (
        <>
          <div className="fb-sep" aria-hidden="true" />
          {/* SMT group */}
          <div className="fb-group" role="group" aria-label="SMT filter">
            {SMT_OPTS.map((opt) => (
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

      {!isDefault && (
        <>
          <div className="fb-sep" aria-hidden="true" />
          <button
            type="button"
            className="fb-reset"
            onClick={reset}
            aria-label="Reset all filters to defaults"
          >
            Reset
          </button>
        </>
      )}
    </div>
  );
}
