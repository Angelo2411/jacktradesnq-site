'use client';

import { useSearchParams, useRouter } from 'next/navigation';

/**
 * ModeToggle — gold pill that flips ?mode=advanced in the URL (shallow push).
 *
 * Simple mode  = default (no ?mode param or any value that isn't "advanced")
 * Advanced mode = ?mode=advanced
 *
 * Contract section A.3 / contract F: surgical, no new color, honors
 * existing OKLCH tokens, respects prefers-reduced-motion via CSS class.
 */
export default function ModeToggle() {
  const sp = useSearchParams();
  const router = useRouter();
  const isAdvanced = sp.get('mode') === 'advanced';

  function toggle() {
    const params = new URLSearchParams(sp.toString());
    if (isAdvanced) {
      params.delete('mode');
    } else {
      params.set('mode', 'advanced');
    }
    // Shallow replace so the tab/filter state in the URL is preserved
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`v3-simple-toggle${isAdvanced ? ' advanced' : ''}`}
      aria-pressed={isAdvanced}
      aria-label={isAdvanced ? 'Switch to Simple view' : 'Switch to Advanced view'}
    >
      {isAdvanced ? '← Simple' : 'Advanced →'}
    </button>
  );
}
