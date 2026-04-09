# 🎨 Frontend Developer Workflow

## Opis
Ten plik opisuje proces pracy dla dewelopera frontendowego w tym repozytorium.  
Kod frontendu rozwijany jest na gałęzi **`frontend-develop`**, a gotowe zmiany są scalane do **`main`** po akceptacji Pull Requesta.

> 💡 Uwaga: W katalogu `frontend/` znajduje się **tylko ten plik README** — nie jest to miejsce na kod.  
> Cały kod aplikacji frontendowej należy tworzyć **bezpośrednio w głównym katalogu projektu**, zgodnie ze strukturą aplikacji (np. `/src`, `/components`, `/public` itp.).

---

## ⚙️ Setup lokalny

```bash
git clone <adres_repo>
cd <nazwa_repo>
git checkout frontend-develop
```

Uruchom aplikację lokalnie:

```bash
npm install
npm start
# lub
ng serve
```

---

## 🧩 Workflow

### 1. Praca lokalna
Twórz nowe komponenty, widoki i funkcjonalności w kodzie frontendu.  
Testuj wszystko lokalnie przed wypchnięciem zmian.

### 2. Commit i push

```bash
git add .
git commit -m "Opis zmian we frontendzie"
git push origin frontend-develop
```

### 3. Pull Request (PR)
Kiedy funkcjonalność jest gotowa:
1. Utwórz **Pull Request** z `frontend-develop` do `main`.
2. Po review i akceptacji PR zostanie zmergowany.
3. Zaktualizuj lokalny `main`:

```bash
git checkout main
git pull origin main
```

---

## 💡 Dobre praktyki

- Przed rozpoczęciem pracy wykonaj:
  ```bash
  git pull origin frontend-develop
  ```
- Regularnie aktualizuj branch i wykonuj rebase z `main`, by uniknąć konfliktów.
- `main` zawiera zawsze działający kod całego projektu.

---

## 🧱 Efekt końcowy
Po scaleniu PR do `main`, kod frontendu zostaje połączony z backendem w pełną aplikację.