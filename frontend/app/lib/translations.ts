export type Lang = 'en' | 'pl';

export const T = {
  en: {
    nav: { how: 'How it works', faq: 'FAQ', cta: 'Try it free', demo: 'Preview demo' },

    hero: {
      chip: 'Forensic AI · Research project',
      h1a: 'Tell the truth',
      h1b: 'from',
      h1em: 'the synth.',
      lede: 'Drop in any video. Our dual-branch neural network analyzes frames in both the visual and frequency domain — detecting manipulation artifacts invisible to the human eye.',
      cta1: '↗ Analyze a video',
      cta2: 'How it works',
    },

    upload: {
      eyebrow: 'Upload',
      title: 'Analyze your video',
      drag: 'Drag a video file here',
      dragActive: 'Release to upload',
      formats: 'MP4 · MOV · MKV · WEBM · AVI · MAX 500 MB',
      btn: 'Choose file',
      privacy: 'Processed in-memory. Nothing is stored.',
    },

    how: {
      eyebrow: 'Method',
      title: 'Two models, one verdict.',
      steps: [
        { n: '01', title: 'Frame extraction & face detection', body: 'Frames are sampled evenly across the video. OpenCV\'s Haar Cascade detector then locates faces — the largest face is cropped with a 20% margin and passed to the face-specific model.' },
        { n: '02', title: 'Dual-branch neural analysis',       body: 'Each frame goes through EfficientNet-B0 (RGB features) and a custom CNN (FFT frequency spectrum). A general model runs on full frames; a face-specific model runs on face crops in parallel.' },
        { n: '03', title: 'Score fusion & metadata check',     body: 'If a face was detected, the face model score is used as the primary result; otherwise the general model applies. Video metadata is also scanned — traces of known editing software add +0.10 to the final score.' },
      ],
    },

    faq: {
      eyebrow: 'FAQ',
      title: 'Frequently asked',
      items: [
        { q: 'What is a deepfake?',           a: "A deepfake is synthetic media where a person's face or appearance has been replaced or altered using a neural network. DeepGuard is designed to detect such manipulations." },
        { q: 'Which formats are supported?',  a: 'MP4, MOV, AVI, MKV and WEBM up to 500 MB. Best results with a face clearly visible throughout the video.' },
        { q: 'How does the model work?',      a: 'Two independent neural networks run in parallel. Both share a dual-branch architecture: EfficientNet-B0 analyses RGB features, a custom CNN analyses the FFT frequency spectrum. If a face is detected via Haar Cascade, the face-specific model\'s score takes priority. Video metadata is also scanned for known editing software.' },
        { q: 'What happens to my video?',     a: "Files are processed on the server and deleted after 24 hours. We don't store any personal data. No account or login required." },
        { q: 'Can you ever be 100% sure?',    a: 'No. Every verdict is probabilistic. The score represents the model\'s confidence — the final interpretation is always up to a human.' },
      ],
    },

    footer: '© 2026 DeepGuard · Research project · Wrocław University of Technology',

    results: {
      analyzingEyebrow: 'Analysis in progress',
      analyzingTitle: 'Analyzing',
      stages: [
        { label: 'Frame extraction & face detection', time: '0–20%'   },
        { label: 'RGB branch (EfficientNet-B0)',       time: '20–45%'  },
        { label: 'FFT branch (frequency CNN)',         time: '45–65%'  },
        { label: 'Score selection & metadata check',  time: '65–88%'  },
        { label: 'Final verdict',                     time: '88–100%' },
      ],
      reportEyebrow: 'Analysis report',
      back: '← Back',
      manipProb: 'Manipulation probability',
      techDetails: 'Technical details',
      detailLabels: {
        generalScore:  'General model score',
        faceScore:     'Face model score',
        usedModel:     'Active model',
        metadata:      'Metadata check',
      },
      detailValues: {
        noFace:        'No face detected',
        face:          'Face-specific',
        general:       'General',
        metaClean:     'Clean',
        metaSuspicious:'Suspicious (+0.10)',
      },
      chipFake:       'DEEPFAKE',
      chipSuspicious: 'SUSPICIOUS',
      chipReal:       'AUTHENTIC',
      verdictFakeTitle:       'Likely deepfake',
      verdictSuspiciousTitle: 'Inconclusive',
      verdictRealTitle:       'Likely authentic',
      verdictFakeSub:       'Multiple synthesis indicators detected.',
      verdictSuspiciousSub: 'Score in the ambiguous range — manual review recommended.',
      verdictRealSub:       'No meaningful manipulation traces found.',
      analyzedVideo: 'Analyzed video',
      newAnalysis: '↗ Analyze another video',
    },
  },

  pl: {
    nav: { how: 'Jak działa', faq: 'FAQ', cta: 'Wypróbuj', demo: 'Podgląd demo' },

    hero: {
      chip: 'Forensic AI · Projekt badawczy',
      h1a: 'Odróżnij prawdę',
      h1b: 'od',
      h1em: 'syntezy.',
      lede: 'Wgraj dowolny film. Nasza dwugałęziowa sieć neuronowa analizuje klatki w dziedzinie wizualnej i częstotliwościowej — wykrywając artefakty manipulacji niewidoczne gołym okiem.',
      cta1: '↗ Analizuj film',
      cta2: 'Jak to działa',
    },

    upload: {
      eyebrow: 'Wgraj film',
      title: 'Przeanalizuj swój film',
      drag: 'Przeciągnij plik wideo tutaj',
      dragActive: 'Upuść, aby wgrać',
      formats: 'MP4 · MOV · MKV · WEBM · AVI · MAX 500 MB',
      btn: 'Wybierz plik',
      privacy: 'Przetwarzane w pamięci. Nic nie jest zapisywane.',
    },

    how: {
      eyebrow: 'Metoda',
      title: 'Dwa modele, jedna decyzja.',
      steps: [
        { n: '01', title: 'Ekstrakcja klatek i detekcja twarzy', body: 'Klatki są równomiernie próbkowane z całego filmu. Detektor Haar Cascade (OpenCV) lokalizuje twarze — największa twarz jest wycinana z marginesem 20% i przekazywana do modelu dedykowanego twarzom.' },
        { n: '02', title: 'Dwugałęziowa analiza neuronowa',      body: 'Każda klatka przechodzi przez EfficientNet-B0 (cechy RGB) i własną sieć CNN (widmo FFT). Model ogólny przetwarza całe klatki; model dedykowany twarzom — wycięte fragmenty twarzy.' },
        { n: '03', title: 'Łączenie wyników i analiza metadanych', body: 'Jeśli wykryto twarz, wynik modelu twarzowego ma priorytet; w przeciwnym razie stosowany jest model ogólny. Metadane pliku są również sprawdzane — wykrycie znanych programów do edycji dodaje +0,10 do końcowego wyniku.' },
      ],
    },

    faq: {
      eyebrow: 'FAQ',
      title: 'Częste pytania',
      items: [
        { q: 'Czym jest deepfake?',              a: 'Deepfake to zsyntetyzowany materiał, w którym wygląd lub twarz osoby zostały zastąpione lub zmodyfikowane za pomocą sieci neuronowej. DeepGuard jest zaprojektowany do wykrywania takich manipulacji.' },
        { q: 'Jakie formaty są obsługiwane?',    a: 'MP4, MOV, AVI, MKV i WEBM do 500 MB. Najlepsze wyniki gdy twarz jest wyraźnie widoczna przez cały film.' },
        { q: 'Jak działa model?',                a: 'Działają dwie niezależne sieci neuronowe. Obie mają dwugałęziową architekturę: EfficientNet-B0 analizuje cechy RGB, własna sieć CNN analizuje widmo FFT. Jeśli w filmie wykryto twarz (Haar Cascade), wynik modelu twarzowego ma priorytet. Metadane wideo są również skanowane pod kątem znanych programów do edycji.' },
        { q: 'Co dzieje się z moim filmem?',     a: 'Plik jest przetwarzany na serwerze i usuwany po 24 godzinach. Nie przechowujemy żadnych danych osobowych. Brak konta, brak logowania.' },
        { q: 'Czy 100% pewności jest możliwe?',  a: 'Nie. Każda decyzja jest probabilistyczna. Wynik reprezentuje pewność modelu — ostateczna interpretacja zawsze należy do człowieka.' },
      ],
    },

    footer: '© 2026 DeepGuard · Projekt badawczy studentów Politechniki Wrocławskiej',

    results: {
      analyzingEyebrow: 'Analiza w toku',
      analyzingTitle: 'Analizujemy',
      stages: [
        { label: 'Ekstrakcja klatek i detekcja twarzy', time: '0–20%'   },
        { label: 'Gałąź RGB (EfficientNet-B0)',          time: '20–45%'  },
        { label: 'Gałąź FFT (sieć CNN)',                 time: '45–65%'  },
        { label: 'Wybór wyniku i analiza metadanych',    time: '65–88%'  },
        { label: 'Końcowy werdykt',                      time: '88–100%' },
      ],
      reportEyebrow: 'Raport analizy',
      back: '← Wróć',
      manipProb: 'Prawdopodobieństwo manipulacji',
      techDetails: 'Szczegóły techniczne',
      detailLabels: {
        generalScore:  'Wynik modelu ogólnego',
        faceScore:     'Wynik modelu twarzowego',
        usedModel:     'Aktywny model',
        metadata:      'Sprawdzenie metadanych',
      },
      detailValues: {
        noFace:        'Nie wykryto twarzy',
        face:          'Twarzowy',
        general:       'Ogólny',
        metaClean:     'Czyste',
        metaSuspicious:'Podejrzane (+0,10)',
      },
      chipFake:       'DEEPFAKE',
      chipSuspicious: 'PODEJRZANY',
      chipReal:       'AUTENTYCZNY',
      verdictFakeTitle:       'Prawdopodobny deepfake',
      verdictSuspiciousTitle: 'Wynik niejednoznaczny',
      verdictRealTitle:       'Prawdopodobnie autentyczny',
      verdictFakeSub:       'Wykryto wiele wskaźników syntezy.',
      verdictSuspiciousSub: 'Wynik w strefie niejednoznacznej — zalecana weryfikacja ręczna.',
      verdictRealSub:       'Brak istotnych śladów manipulacji.',
      analyzedVideo: 'Analizowany film',
      newAnalysis: '↗ Analizuj kolejny film',
    },
  },
} as const;
