import { Suspense } from 'react';
import PrintReport from './PrintReport';

export const dynamic = 'force-static';

export default function DayStatsPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, fontFamily: 'system-ui' }}>Loading…</div>}>
      <PrintReport />
    </Suspense>
  );
}
