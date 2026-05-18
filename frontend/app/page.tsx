'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from './contexts/LangContext';
import { T } from './lib/translations';

export const videoStore: { file: File | null } = { file: null };

function FaqItem({
  q, a, idx, open, onToggle,
}: { q: string; a: string; idx: number; open: boolean; onToggle: () => void }) {
  return (
    <div className={`faq-item${open ? ' open' : ''}`} onClick={onToggle}>
      <div className="faq-q">
        <span style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flex: 1 }}>
          <span className="mono"
            style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.1em', paddingTop: 8, minWidth: 28 }}>
            {String(idx + 1).padStart(2, '0')}
          </span>
          <span style={{ flex: 1 }}>{q}</span>
        </span>
        <span className="faq-toggle">{open ? '−' : '+'}</span>
      </div>
      <div className="faq-a">{a}</div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const t = T[lang];

  const [drag, setDrag]       = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    videoStore.file = file;
    router.push('/results');
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div style={{ position: 'relative', zIndex: 2 }}>

      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div className="shell topbar-inner">
          <a className="brand" href="#">
            <div className="brand-mark" />
            <div className="brand-name">Deep<em>Guard</em></div>
          </a>

          <ul className="nav-links">
            <li><a href="#how">{t.nav.how}</a></li>
            <li><a href="#faq">{t.nav.faq}</a></li>
          </ul>

          <div className="row" style={{ gap: 12 }}>
            <div className="lang-switch">
              <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
              <button className={lang === 'pl' ? 'on' : ''} onClick={() => setLang('pl')}>PL</button>
            </div>
            <button className="btn btn-sm btn-accent" onClick={() => scrollTo('upload')}>
              {t.nav.cta}
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <div className="fade-in" style={{ paddingTop: 96, paddingBottom: 120 }}>
        <div className="shell-narrow" style={{ textAlign: 'center' }}>

          <h1 className="display-1" style={{ marginBottom: 28 }}>
            {t.hero.h1a}<br />
            {t.hero.h1b}{' '}
            <em className="italic gradient-text">{t.hero.h1em}</em>
          </h1>

          <p className="lede" style={{ margin: '0 auto 40px', textAlign: 'center' }}>
            {t.hero.lede}
          </p>

          <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
            <button className="btn btn-accent" onClick={() => scrollTo('upload')}>
              {t.hero.cta1}
            </button>
            <button className="btn btn-ghost" onClick={() => scrollTo('how')}>
              {t.hero.cta2}
            </button>
          </div>

        </div>
      </div>

      {/* ── UPLOAD ── */}
      <div id="upload" style={{ paddingBottom: 120 }}>
        <div className="shell-narrow">

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>{t.upload.eyebrow}</div>
            <h2 className="display-2">{t.upload.title}</h2>
          </div>

          <div
            className={`upload-zone${drag ? ' drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon-wrap">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.4">
                <path d="M12 5v12M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 19h14" strokeLinecap="round" />
              </svg>
            </div>

            <div className="serif" style={{ fontSize: 26, marginBottom: 10 }}>
              {drag ? t.upload.dragActive : t.upload.drag}
            </div>
            <p className="text-sm mono"
               style={{ color: 'var(--ink-3)', letterSpacing: '0.08em', marginBottom: 24 }}>
              {t.upload.formats}
            </p>

            <button
              className="btn btn-primary"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              {t.upload.btn}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <p className="text-sm mono"
             style={{ color: 'var(--ink-3)', textAlign: 'center', marginTop: 24, letterSpacing: '0.06em' }}>
            <span style={{ color: 'var(--accent)' }}>●</span>{' '}
            {t.upload.privacy}
          </p>

        </div>
      </div>

      <div className="divider" />

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how">
        <div className="shell-narrow">

          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>{t.how.eyebrow}</div>
            <h2 className="display-2">{t.how.title}</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            border: '1px solid var(--line)',
            borderRadius: 20,
            overflow: 'hidden',
          }}>
            {t.how.steps.map((s, i) => (
              <div key={i} className="how-step" style={{
                borderRight: i < 2 ? '1px solid var(--line)' : 'none',
              }}>
                <div className="step-num-badge">
                  <span className="mono" style={{ fontSize: 11, letterSpacing: '0.05em' }}>{s.n}</span>
                </div>
                <div className="serif" style={{ fontSize: 22, lineHeight: 1.2, marginBottom: 12 }}>
                  {s.title}
                </div>
                <p style={{ color: 'var(--ink-2)', margin: 0, fontSize: 13.5, lineHeight: 1.7 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <div className="divider" />

      {/* ── FAQ ── */}
      <section className="section" id="faq">
        <div className="shell-narrow">

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>{t.faq.eyebrow}</div>
            <h2 className="display-2">{t.faq.title}</h2>
          </div>

          {t.faq.items.map((item, i) => (
            <FaqItem
              key={i} q={item.q} a={item.a} idx={i}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
            />
          ))}

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="shell-narrow">
          <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div className="row" style={{ gap: 12 }}>
              <div className="brand-mark" />
              <div className="brand-name serif">Deep<em>Guard</em></div>
            </div>
            <span className="mono text-xs" style={{ color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
              {t.footer}
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
