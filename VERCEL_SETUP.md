# Vercel Setup - WYKONAJ RĘCZNIE

## 1. Wejdź na https://vercel.com/bocikkaiser-cpu

## 2. Nowy projekt
- Kliknij "Add New"
- Wybierz "Project"
- Zaloguj się GitHub-em (bocikkaiser-cpu)
- Selectuj repo: `bocikkaiser-cpu/runner-app`

## 3. Deploy
- Name: `biegacz-galloway-timer-dominik`
- Build: `npm run build`
- Output: `dist`
- Deploy!

## 4. GitHub Secrets
Po deploymencie na Vercel, dodaj secrets do repo:

https://github.com/bocikkaiser-cpu/runner-app/settings/secrets/actions

Dodaj 3 secrets:
1. `VERCEL_TOKEN` → https://vercel.com/account/tokens
2. `VERCEL_ORG_ID` → Domena Vercel (np: bocikkaiser-cpu)
3. `VERCEL_PROJECT_ID` → ID projektu z dashboarda Vercel

## 5. Gotowe!
Każdy push do `main` → auto-deploy na Vercel ✅

## URL aplikacji
https://biegacz-galloway-timer-dominik.vercel.app
