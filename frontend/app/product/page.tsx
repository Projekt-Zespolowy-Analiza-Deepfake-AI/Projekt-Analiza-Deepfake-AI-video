'use client';

import { useState } from 'react';
import styles from '../page.module.css';

const faqs = [
  { q: 'What is a deepfake?', a: "A deepfake is a synthetic media in which a person's likeness is replaced using deep learning. Our system detects facial manipulation performed by GANs, diffusion models, and face-swap algorithms." },
  { q: 'What video formats are supported?', a: 'We support MP4, MOV, AVI, MKV, and WEBM up to 500 MB. For best results, upload videos in 720p or higher resolution.' },
  { q: 'How accurate is the detection?', a: 'Our model achieves 97.3% accuracy on the FaceForensics++ benchmark and 94.8% on Celeb-DF v2. Accuracy may vary on unseen GAN architectures or heavily compressed video.' },
  { q: 'Is my video stored after analysis?', a: 'No. Videos are processed entirely in-memory and discarded immediately after the analysis pipeline completes. We do not retain any user data.' },
  { q: 'Can I use the API in my own application?', a: 'An API with JSON responses and batch processing is planned for Q3 2025. Contact us to get early access.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqItem}>
      <div className={styles.faqQ} onClick={() => setOpen(!open)}>
        {q}
        <span className={`${styles.faqChevron} ${open ? styles.open : ''}`}>▼</span>
      </div>
      <div className={`${styles.faqA} ${open ? styles.open : ''}`}>{a}</div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionEyebrow}>FAQ</div>
      <div className={styles.sectionTitle}>Frequently asked questions</div>
      <div className={styles.faqList}>
        {faqs.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </section>
  );
}
