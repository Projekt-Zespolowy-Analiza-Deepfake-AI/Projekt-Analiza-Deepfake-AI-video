# 🖥 AI-model Developer Workflow

## Opis
Ten plik opisuje proces pracy dla dewelopera AI-model.  
Kod ai-modelu rozwijany jest na gałęzi **`AI-model-develop`**, a po przetestowaniu i akceptacji trafia do **`main`**.

> 💡 Uwaga: W katalogu `AI-mopdel/` znajduje się **tylko ten plik README** — nie jest to folder produkcyjny.  
> Kod należy pisać **w głównym katalogu projektu**, zgodnie ze strukturą aplikacji (np. `/app`, `/api`, `/src`).

---

## ⚙️ Setup lokalny

```bash
git clone <adres_repo>
cd <nazwa_repo>
git checkout backend-develop
```

Uruchom lokalny serwer:

```bash
python app.py
# lub
npm run dev
```

---

## 🧩 Workflow

### 2. Commit i push

```bash
git add .
git commit -m "Opis zmian"
git push origin AI-model-develop
```

### 3. Pull Request (PR)
Po zakończeniu pracy:
1. Utwórz **Pull Request** z `AI-model-develop` do `main`.
2. Po review i testach merge do `main`.
3. Aktualizacja lokalnego `main`:

```bash
git checkout main
git pull origin main
```

---

## 💡 Dobre praktyki

- Przed nową funkcjonalnością wykonaj:
  ```bash
  git pull origin AI-model-develop
  ```
- Rebase’uj branch z najnowszego `main`.
- `main` zawsze zawiera kompletny, działający kod — backend + frontend + aimodel.

---

## 🧱 Efekt końcowy
Po scaleniu PR do `main`, kod backendu jest zintegrowany z frontendem i ai modelem w jednej, działającej wersji projektu.