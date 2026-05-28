'use client';
import { useAsset } from './AssetContext';

const TEXT: Record<string, string> = {
  nq: '10 years of NQ futures · 1-min bars · AI-backtested entry models.',
  gc: '10 years of GC futures · 1-min bars · AI-backtested entry models.',
  es: '10 years of ES futures · 1-min bars · AI-backtested entry models.',
  si: '10 years of SI futures · 1-min bars · AI-backtested entry models.',
  all: '10 years of NQ · GC · ES · SI futures · 1-min bars · AI-backtested entry models.',
};

export default function DataSubtitle() {
  const { asset } = useAsset();
  return <p className="v3-hero-sub">{TEXT[asset] ?? TEXT.all}</p>;
}
