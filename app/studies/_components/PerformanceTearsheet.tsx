// PerformanceTearsheet — server component
// Reads content/studies/<slug>/tearsheet.json and renders full tearsheet.
// To add a new slug: run ~/jtnq-hub/scripts/gen_tearsheet.py --slug <slug>
// Fallback: if tearsheet.json absent, renders nothing (graceful).

import fs from 'fs';
import path from 'path';
import type { TearsheetData } from '@/lib/tearsheet';
import MetricsStrip from './MetricsStrip';
import EquityJourneyChart from './EquityJourneyChart';
import PnLDistribution from './PnLDistribution';
import QualityFactors from './QualityFactors';
import TradeSequence from './TradeSequence';

interface Props {
  slug: string;
}

function loadTearsheet(slug: string): TearsheetData | null {
  const filePath = path.join(process.cwd(), 'content', 'studies', slug, 'tearsheet.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as TearsheetData;
  } catch {
    return null;
  }
}

export default function PerformanceTearsheet({ slug }: Props) {
  const data = loadTearsheet(slug);
  if (!data) return null;

  return (
    <section className="ts-shell">
      {/* Header */}
      <div className="ts-head">
        <div>
          <h2 className="ts-head-h2">
            Performance · {data.eventLabel}{' '}
            <em className="ts-head-pattern">{data.patternLabel}</em>
          </h2>
          <p className="ts-head-sub">{data.subtitle}</p>
        </div>
        <div className="ts-head-meta">
          <span className="ts-head-meta-label">Period</span>
          <span className="ts-head-meta-val">{data.periodStart} — {data.periodEnd}</span>
        </div>
      </div>

      {/* Metrics strip */}
      <MetricsStrip data={data} />

      {/* 2-col grid */}
      <div className="ts-main-grid">
        {/* Left: equity chart */}
        <EquityJourneyChart data={data} />

        {/* Right: sidebar */}
        <div className="ts-sidebar">
          <PnLDistribution data={data} />
          <QualityFactors data={data} />
          <TradeSequence data={data} />
        </div>
      </div>
    </section>
  );
}
