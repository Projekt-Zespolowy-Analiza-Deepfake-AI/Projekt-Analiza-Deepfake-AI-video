# 🖥 Backend Developer Workflow

## Opis
Ten plik opisuje proces pracy dla dewelopera backendowego.  
Kod backendu rozwijany jest na gałęzi **`backend-develop`**, a po przetestowaniu i akceptacji trafia do **`main`**.

> 💡 Uwaga: W katalogu `backend/` znajduje się **tylko ten plik README** — nie jest to folder produkcyjny.  
> Kod backendowy należy pisać **w głównym katalogu projektu**, zgodnie ze strukturą aplikacji (np. `/app`, `/api`, `/src`).

---

## ⚙️ Setup lokalny

```bash
git clone <adres_repo>
cd <nazwa_repo>
git checkout backend-develop
```

Uruchom lokalny serwer backendowy:

```bash
python app.py
# lub
npm run dev
```

---

## 🧩 Workflow

### 1. Praca lokalna
Dodawaj nowe endpointy, logikę API i funkcje aplikacji.  
Testuj lokalnie przed wypchnięciem zmian.

### 2. Commit i push

```bash
git add .
git commit -m "Opis zmian w backendzie"
git push origin backend-develop
```

### 3. Pull Request (PR)
Po zakończeniu pracy:
1. Utwórz **Pull Request** z `backend-develop` do `main`.
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
  git pull origin backend-develop
  ```
- Rebase’uj branch z najnowszego `main`.
- `main` zawsze zawiera kompletny, działający kod — backend + frontend.

---

## 🧱 Efekt końcowy
Po scaleniu PR do `main`, kod backendu jest zintegrowany z frontendem w jednej, działającej wersji projektu.