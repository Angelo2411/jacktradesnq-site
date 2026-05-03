import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

const contentDir = path.join(process.cwd(), 'content', 'backtested-data');

export type Category = 'tradingview' | 'data';

export interface EntryMeta {
  title: string;
  category: Category;
  date: string;
  excerpt: string;
  tradingviewUrl: string;
  pdfFile: string;
}

export interface Entry extends EntryMeta {
  slug: string;
}

export interface EntryDetail extends EntryMeta {
  slug: string;
  explanationHtml: string;
}

export function getAllEntries(): Entry[] {
  if (!fs.existsSync(contentDir)) return [];

  const slugs = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  return slugs
    .map((slug) => {
      const metaPath = path.join(contentDir, slug, 'meta.json');
      if (!fs.existsSync(metaPath)) return null;
      const raw = fs.readFileSync(metaPath, 'utf-8');
      const meta = JSON.parse(raw) as EntryMeta;
      return { slug, ...meta };
    })
    .filter((entry): entry is Entry => entry !== null);
}

export function getEntry(slug: string): EntryDetail | null {
  const entryDir = path.join(contentDir, slug);
  if (!fs.existsSync(entryDir)) return null;

  const metaPath = path.join(entryDir, 'meta.json');
  if (!fs.existsSync(metaPath)) return null;

  const rawMeta = fs.readFileSync(metaPath, 'utf-8');
  const meta = JSON.parse(rawMeta) as EntryMeta;

  const mdPath = path.join(entryDir, 'explanation.md');
  const explanationHtml = fs.existsSync(mdPath)
    ? marked.parse(fs.readFileSync(mdPath, 'utf-8')) as string
    : '';

  return { slug, ...meta, explanationHtml };
}
