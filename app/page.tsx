import Link from 'next/link';
import SceneScroller from './components/scene/SceneScroller';

export default function Home() {
  return (
    <>
      <SceneScroller />

      <footer className="scene-footer">
        <Link href="/mentions-legales/">Mentions légales</Link>
        <span>·</span>
        <Link href="/politique-confidentialite/">Confidentialité</Link>
        <span>·</span>
        <span>Disclaimer AMF article D.321-1</span>
        <span>·</span>
        <span>© 2026 JackTradesNQ</span>
      </footer>
    </>
  );
}
