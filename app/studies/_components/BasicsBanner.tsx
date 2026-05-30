'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'jtnq-basics-banner-dismissed';

export default function BasicsBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  return (
    <div className="bd-basics-banner">
      <span>New here? Start with the Basics to understand the numbers.</span>
      <a href="/studies/basics/">Read the Basics →</a>
      <button type="button" onClick={dismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
