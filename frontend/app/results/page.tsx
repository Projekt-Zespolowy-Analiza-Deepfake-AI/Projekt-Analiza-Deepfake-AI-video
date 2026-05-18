'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { videoStore } from '../page';
import { useLang } from '../contexts/LangContext';
import { T } from '../lib/translations';
import { Suspense } from 'react';

type Verdict = 'FAKE' | 'SUSPICIOUS' | 'REAL';

interface AnalysisResult {
  fileName:           string;
  verdict:            Verdict;
  score:              number;       // 0–1 final manipulation probability
  generalScore:       number | null;
  faceScore:          number | null;
  usedModel:          'face' | 'general' | null;
  metadataSuspicious: boolean;
  metadataReasons:    string[];
  fileUrl:            string;
  error:              string | null;
}

function scoreToVerdict(s: number): Verdict {
  if (s >= 0.7) return 'FAKE';
  if (s <= 0.3) return 'REAL';
  return 'SUSPICIOUS';
}

const DEMO_DATA: Record<string, Omit<AnalysisResult, 'fileName' | 'fileUrl'>> = {
  fake: {
    verdict: 'FAKE', score: 0.923,
    generalScore: 0.891, faceScore: 0.923,
    usedModel: 'face',
    metadataSuspicious: true,
    metadataReasons: ['Detected software: capcut'],
    error: null,
  },
  suspicious: {
    verdict: 'SUSPICIOUS', score: 0.541,
    generalScore: 0.541, faceScore: null,
    usedModel: 'general',
    metadataSuspicious: false,
    metadataReasons: [],
    error: null,
  },
  real: {
    verdict: 'REAL', score: 0.087,
    generalScore: 0.087, faceScore: 0.112,
    usedModel: 'face',
    metadataSuspicious: false,
    metadataReasons: [],
    error: null,
  },
};

function MeterFill({ pct, verdict }: { pct: number; verdict: Verdict }) {
  const [width, setWidth] = useState('0%');
  useEffect(() => {
    const id = setTimeout(() => setWidth(pct.toFixed(1) + '%'), 200);
    return () => clearTimeout(id);
  }, [pct]);
  const cls = verdict === 'FAKE' ? 'fake' : verdict === 'REAL' ? 'real' : 'suspicious';
  return (
    <div
      className={`meter-fill ${cls}`}
      style={{ width, transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }}
    />
  );
}

function ResultsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const demoKey      = searchParams.get('demo') as 'fake' | 'suspicious' | 'real' | null;
  const isDemo       = demoKey !== null && demoKey in DEMO_DATA;

  const { lang }  = useLang();
  const t         = T[lang].results;

  const [phase,    setPhase]    = useState<'loading' | 'done'>('loading');
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [result,   setResult]   = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // ── Demo mode: skip API, use mock data ──
    if (isDemo) {
      const mock = DEMO_DATA[demoKey!];
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = Math.min(prev + 3.0, 100);
          setStageIdx(next < 18 ? 0 : next < 35 ? 1 : next < 62 ? 2 : next < 88 ? 3 : 4);
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setResult({ ...mock, fileName: `demo_${demoKey}.mp4`, fileUrl: '' });
              setPhase('done');
            }, 400);
          }
          return next;
        });
      }, 60);
      return () => clearInterval(interval);
    }

    const file = videoStore.file;
    if (!file) { router.push('/'); return; }
    const objectUrl = URL.createObjectURL(file);

    let apiDone   = false;
    let apiData:  Record<string, unknown> | null = null;
    let apiError: string | null = null;

    const formData = new FormData();
    formData.append('video', file);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api';

    fetch(`${apiUrl}/detect`, { method: 'POST', body: formData })
      .then(r => r.json())
      .then(data => {
        if (data.error) apiError = data.error as string;
        else            apiData  = data as Record<string, unknown>;
        apiDone = true;
      })
      .catch(() => { apiError = 'Could not reach the analysis server.'; apiDone = true; });

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev < 88
          ? prev + 2.2
          : apiDone ? Math.min(prev + 3.5, 100) : prev;

        setStageIdx(next < 18 ? 0 : next < 35 ? 1 : next < 62 ? 2 : next < 88 ? 3 : 4);

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (apiError || !apiData) {
              setResult({
                fileName: file.name, verdict: 'REAL', score: 0,
                generalScore: null, faceScore: null, usedModel: null,
                metadataSuspicious: false, metadataReasons: [],
                fileUrl: objectUrl, error: apiError ?? 'Unknown error',
              });
            } else {
              // Support both old { score } and new { final_score, ... } API shapes
              const finalScore     = (apiData.final_score   ?? apiData.score ?? 0) as number;
              const generalScore   = (apiData.general_score ?? null) as number | null;
              const faceScore      = (apiData.face_score    ?? null) as number | null;
              const usedModel      = (apiData.used_model    ?? null) as 'face' | 'general' | null;
              const metaSuspicious = (apiData.metadata_suspicious ?? false) as boolean;
              const metaReasons    = (apiData.metadata_reasons    ?? [])    as string[];

              setResult({
                fileName:           file.name,
                verdict:            scoreToVerdict(finalScore),
                score:              finalScore,
                generalScore,
                faceScore,
                usedModel,
                metadataSuspicious: metaSuspicious,
                metadataReasons:    metaReasons,
                fileUrl:            objectUrl,
                error:              null,
              });
            }
            setPhase('done');
          }, 500);
        }
        return next;
      });
    }, 60);

    return () => { clearInterval(interval); URL.revokeObjectURL(objectUrl); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const manipPct = result ? parseFloat((result.score * 100).toFixed(1)) : 0;

  const verdictClass =
    result?.verdict === 'FAKE'       ? 'fake'       :
    result?.verdict === 'SUSPICIOUS' ? 'suspicious' : 'real';

  const chipClass =
    result?.verdict === 'FAKE'       ? 'chip-fake'       :
    result?.verdict === 'SUSPICIOUS' ? 'chip-suspicious' : 'chip-real';

  const chipLabel =
    result?.verdict === 'FAKE'       ? t.chipFake       :
    result?.verdict === 'SUSPICIOUS' ? t.chipSuspicious : t.chipReal;

  const verdictTitle =
    result?.verdict === 'FAKE'       ? t.verdictFakeTitle       :
    result?.verdict === 'SUSPICIOUS' ? t.verdictSuspiciousTitle : t.verdictRealTitle;

  const verdictSub =
    result?.verdict === 'FAKE'       ? t.verdictFakeSub       :
    result?.verdict === 'SUSPICIOUS' ? t.verdictSuspiciousSub : t.verdictRealSub;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 2 }}>

      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div className="shell topbar-inner">
          <a className="brand" href="/">
            <div className="brand-mark" />
            <div className="brand-name">Deep<em>Guard</em></div>
          </a>
        </div>
      </header>

      {/* ── ANALYZING ── */}
      {phase === 'loading' && (
        <div className="fade-in" style={{ padding: '120px 0' }}>
          <div className="shell-narrow" style={{ textAlign: 'center' }}>

            <div className="eyebrow eyebrow-accent" style={{ marginBottom: 16 }}>
              <span className="live-dot"
                    style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
              {t.analyzingEyebrow}
            </div>

            <h2 className="serif" style={{ fontSize: 44, lineHeight: 1.1, margin: '0 0 8px' }}>
              {t.analyzingTitle}
            </h2>
            <p className="mono text-sm"
               style={{ color: 'var(--ink-3)', letterSpacing: '0.06em', marginBottom: 56 }}>
              {videoStore.file?.name ?? 'your_video.mp4'}
            </p>

            <div className="serif tabular" style={{
              fontSize: 120, lineHeight: 1, letterSpacing: '-0.04em',
              color: 'var(--accent-violet)', marginBottom: 20,
            }}>
              {Math.floor(progress)}
              <span className="mono" style={{ fontSize: 22, color: 'var(--ink-3)', marginLeft: 8 }}>%</span>
            </div>

            <div className="bar-track" style={{ marginBottom: 56 }}>
              <div className="bar-fill" style={{ width: `${progress}%` }} />
            </div>

            <ul className="stage-list" style={{ textAlign: 'left', maxWidth: 480, margin: '0 auto' }}>
              {t.stages.map((s, i) => (
                <li key={i}
                    className={`stage-item${i < stageIdx ? ' done' : i === stageIdx ? ' active' : ''}`}>
                  <span className="stage-num">{i < stageIdx ? '✓' : String(i + 1).padStart(2, '0')}</span>
                  <span className="stage-label">{s.label}</span>
                  <span className="stage-time">{s.time}</span>
                </li>
              ))}
            </ul>

          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {phase === 'done' && result && (
        <div className="fade-in" style={{ padding: '64px 0 120px' }}>
          <div className="shell-narrow">

            {isDemo && (
              <div style={{
                background: 'rgba(129,140,248,0.08)',
                border: '1px solid rgba(129,140,248,0.25)',
                borderRadius: 10, padding: '10px 16px',
                marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'var(--mono)', fontSize: 11,
                color: 'var(--accent)', letterSpacing: '0.08em',
              }}>
                <span style={{ opacity: 0.6 }}>◈</span>
                DEMO MODE — mock data, no real video analyzed
              </div>
            )}

            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 40 }}>
              <div className="eyebrow">{t.reportEyebrow}</div>
              <button className="btn btn-sm btn-ghost" onClick={() => router.push('/')}>
                {t.back}
              </button>
            </div>

            {result.error && (
              <div style={{
                background: 'var(--fake-soft)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 12, padding: '16px 20px',
                marginBottom: 24, color: 'var(--fake)',
              }}>
                ⚠️ {result.error}
              </div>
            )}

            {!result.error && (
              <div className={`results-grid${result.fileUrl ? ' has-video' : ''}`}>

                {/* ── LEFT: analysis ── */}
                <div className="results-main">

                  {/* Verdict */}
                  <div className={`verdict ${verdictClass}`}
                       style={{ padding: 40, textAlign: 'center', marginBottom: 20 }}>
                    <span className={`chip ${chipClass}`} style={{ marginBottom: 20 }}>
                      <span className="dot" />
                      {chipLabel}
                    </span>
                    <div className="verdict-num tabular">
                      {(result.score * 100).toFixed(1)}<sup>%</sup>
                    </div>
                    <div className="serif" style={{ fontSize: 28, lineHeight: 1.2, marginTop: 14 }}>
                      {verdictTitle}
                    </div>
                    <p className="text-sm" style={{
                      color: 'var(--ink-2)', marginTop: 8,
                      maxWidth: 360, marginLeft: 'auto', marginRight: 'auto',
                    }}>
                      {verdictSub}
                    </p>
                  </div>

                  {/* Meter */}
                  <div className="panel" style={{ padding: 24, marginBottom: 20 }}>
                    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
                      <span className="eyebrow">{t.manipProb}</span>
                      <span className="mono tabular text-sm" style={{
                        color: result.verdict === 'FAKE'       ? 'var(--fake)'       :
                               result.verdict === 'SUSPICIOUS' ? 'var(--suspicious)' : 'var(--real)',
                      }}>
                        {manipPct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="meter">
                      <div className="meter-track">
                        <MeterFill pct={manipPct} verdict={result.verdict} />
                      </div>
                      <div className="meter-scale">
                        <span>0</span><span>50</span><span>100</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical details */}
                  <div className="panel" style={{ padding: 24 }}>
                    <div className="eyebrow" style={{ marginBottom: 14 }}>{t.techDetails}</div>

                    <div className="data-row">
                      <span className="k">{t.detailLabels.generalScore}</span>
                      <span className="mono tabular text-sm" style={{ color: 'var(--ink-2)' }}>
                        {result.generalScore !== null
                          ? (result.generalScore * 100).toFixed(1) + '%'
                          : '—'}
                      </span>
                    </div>

                    <div className="data-row">
                      <span className="k">{t.detailLabels.faceScore}</span>
                      <span className="mono tabular text-sm" style={{ color: 'var(--ink-2)' }}>
                        {result.faceScore !== null
                          ? (result.faceScore * 100).toFixed(1) + '%'
                          : t.detailValues.noFace}
                      </span>
                    </div>

                    <div className="data-row">
                      <span className="k">{t.detailLabels.usedModel}</span>
                      <span className={`chip ${result.usedModel === 'face' ? 'chip-accent' : 'chip-real'}`}
                            style={{ fontSize: 9.5 }}>
                        {result.usedModel === 'face'
                          ? t.detailValues.face
                          : result.usedModel === 'general'
                            ? t.detailValues.general
                            : '—'}
                      </span>
                    </div>

                    <div className="data-row">
                      <span className="k">{t.detailLabels.metadata}</span>
                      <span className={`chip ${result.metadataSuspicious ? 'chip-suspicious' : 'chip-real'}`}
                            style={{ fontSize: 9.5 }}>
                        {result.metadataSuspicious
                          ? t.detailValues.metaSuspicious
                          : t.detailValues.metaClean}
                      </span>
                    </div>

                    {result.metadataSuspicious && result.metadataReasons.length > 0 && (
                      <div style={{
                        marginTop: 12, padding: '10px 14px',
                        background: 'var(--suspicious-soft)',
                        border: '1px solid rgba(251,191,36,0.2)',
                        borderRadius: 8,
                        fontFamily: 'var(--mono)', fontSize: 11,
                        color: 'var(--suspicious)', letterSpacing: '0.04em',
                      }}>
                        {result.metadataReasons.join(' · ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── RIGHT: sticky video player ── */}
                {result.fileUrl && (
                  <div className="results-sidebar">
                    <div className="video-sticky">
                      <div className="panel" style={{ padding: 20 }}>
                        <div className="eyebrow" style={{ marginBottom: 12 }}>
                          {t.analyzedVideo}
                        </div>
                        <p className="mono text-sm"
                           style={{ color: 'var(--ink-3)', marginBottom: 14, letterSpacing: '0.04em',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {result.fileName}
                        </p>
                        <video
                          src={result.fileUrl}
                          controls
                          playsInline
                          style={{ width: '100%', borderRadius: 10, display: 'block' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn btn-accent" onClick={() => router.push('/')}>
                {t.newAnalysis}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export default function BounderedResultsPage() {
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <ResultsPage />
    </Suspense>
  );
}
