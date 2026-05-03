import Link from 'next/link';

export default function ComingSoon() {
  return (
    <main className="page">
      <h1 className="heading">Coming soon<span className="dot">.</span></h1>
      <footer className="footer"><Link href="/">← Back</Link></footer>
    </main>
  );
}
