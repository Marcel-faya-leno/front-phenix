# 🚀 Intégration Netlify - PHENIX-TECH-SERVICES

Guide complète pour déployer le frontend sur Netlify et le connecter au backend Render.

## 📋 Prérequis

- [ ] Compte Netlify (gratuit: https://netlify.com)
- [ ] Compte GitHub / GitLab / Bitbucket
- [ ] Repo Git avec le code frontend
- [ ] Backend Render actif: https://backend-phenix.onrender.com

## 🔗 Architecture Déploiement

```
GitHub (source code)
    ↓
Netlify (CI/CD - build & deploy)
    ↓
https://front-phenix.netlify.app (Frontend statique)
    ↓
Fetch API
    ↓
https://backend-phenix.onrender.com/api (Backend REST)
    ↓
MongoDB Atlas (base de données)
```

---

## 📖 Méthode 1: Netlify Direct Deploy (Sans Git)

### Étape 1: Préparer les fichiers

```bash
cd frontend
ls -la
# Doit contenir: *.html, config.js, api.js, css/, images/
```

### Étape 2: Drag & Drop sur Netlify

1. Aller à https://app.netlify.com/drop
2. Glisser/déposer le dossier `frontend`
3. Site généré automatiquement
4. Attendre le déploiement (~30 secondes)

### Étape 3: Configurer le domaine

```
Netlify Dashboard → Site name → Change site name
front-phenix.netlify.app
```

---

## 🔧 Méthode 2: Netlify avec GitHub (Recommandé)

### Étape 1: Pousser le code sur GitHub

```bash
cd frontend
git init
git add .
git commit -m "Initial commit - PHENIX Frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/frontend-phenix.git
git push -u origin main
```

### Étape 2: Connecter GitHub à Netlify

1. Aller à https://app.netlify.com
2. Cliquer **"New site from Git"**
3. Choisir **GitHub** (authentifier si nécessaire)
4. Sélectionner repo **frontend-phenix**
5. Branch: **main**
6. Cliquer **Deploy** site

### Étape 3: Configuration Netlify

```toml
# netlify.toml (déjà présent)
[build]
  command = "echo 'Frontend statique - pas de build'"
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Étape 4: Redéployer automatiquement

À chaque `git push origin main`, Netlify redéploie automatiquement! ✨

---

## 🌐 Configuration Domaine Personnalisé

### Option A: Sous-domaine Netlify

URL par défaut: `https://front-phenix.netlify.app`

No configuration needed!

### Option B: Domaine Personnalisé

1. **Acheter un domaine** (GoDaddy, Namecheap, OVH, etc.)
2. **Netlify Dashboard → Site settings → Domain management**
3. **Ajouter le domaine:** `https://phenix-tech.com`
4. **Mettre à jour DNS:**
   - Créer un CNAME: `phenix-tech.com → front-phenix.netlify.app`
   - Attendre la propagation DNS (jusqu'à 48h)

---

## 🔒 HTTPS & SSL

**Automatique avec Netlify!** 🔐

- [ ] HTTPS activé par défaut
- [ ] SSL certificate auto-renouvellement
- [ ] Redirection HTTP → HTTPS

---

## 📊 Variables d'Environnement

### Créer un fichier `.env`

```bash
# .env (non committé sur Git)
VITE_API_BASE_URL=https://backend-phenix.onrender.com/api
VITE_BACKEND_URL=https://backend-phenix.onrender.com
VITE_FRONTEND_URL=https://front-phenix.netlify.app
```

### Netlify: Ajouter les variables

1. **Dashboard → Site settings → Build & deploy → Environment**
2. **Add environment variables:**
   - Key: `VITE_API_BASE_URL`
   - Value: `https://backend-phenix.onrender.com/api`

**Alternative:** Éditer directement `config.js` pour chaque déploiement

---

## 🛡️ CORS & Headers

### Netlify Headers Automatiques

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "https://backend-phenix.onrender.com"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
```

### Backend Render: Configuration CORS

```javascript
// Backend: auth/middleware
const cors = require('cors');

app.use(cors({
  origin: ['https://front-phenix.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📁 Files Essentiels pour Netlify

```
frontend/
├── index.html              ← Point d'entrée
├── config.js               ← Configuration API
├── api.js                  ← Client API
├── netlify.toml            ← Netlify config
├── _redirects              ← Routes SPA
├── *.html                  ← Pages
├── css/                    ← Styles
└── images/                 ← Ressources

⚠️ EXCLUDED:
├── server.js               (local dev only)
├── node_modules/           (.gitignore)
├── .env                    (.gitignore)
└── backend/                (repo séparé)
```

---

## 🧪 Tester après Déploiement

### Test 1: Page home charge

```bash
curl -I https://front-phenix.netlify.app
# HTTP/1.1 200 OK
```

### Test 2: Sous-pages chargent

```bash
# Doit afficher index.html, pas 404
curl https://front-phenix.netlify.app/cart.html
curl https://front-phenix.netlify.app/checkout.html
curl https://front-phenix.netlify.app/admin.html
```

### Test 3: API fonctionne

Ouvrir: https://front-phenix.netlify.app/test-api.html
- [ ] Produits se chargent
- [ ] Panier accessible
- [ ] CORS OK

### Test 4: Vérifier les headers

```bash
curl -I https://front-phenix.netlify.app/
# Doit contenir les headers CORS
```

---

## 🔄 Pipeline CI/CD

### Workflow GitHub Actions (Optionnel)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './frontend'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📊 Monitoring & Analytics

### Netlify Analytics (Gratuit)

1. **Dashboard → Analytics**
2. Voir le trafic et les erreurs en temps réel
3. Performance metrics

### Google Analytics (Optionnel)

```html
<!-- Ajouter à index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🚨 Erreurs Courants lors du Déploiement

### Erreur 1: 404 Not Found

**Symptôme:** `/cart.html` → 404

**Solution:**
```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Redéployer: `Netlify Dashboard → Deploys → Trigger deploy`

### Erreur 2: CORS Bloqué

**Symptôme:** Console error: CORS policy blocked

**Solution:**
1. Vérifier `config.js` API base URL
2. Vérifier backend accepte domaine Netlify
3. Vérifier headers Netlify

```bash
# Tester CORS
curl -X OPTIONS https://backend-phenix.onrender.com/api/products \
  -H "Origin: https://front-phenix.netlify.app" -v
```

### Erreur 3: Fichiers manquants

**Symptôme:** CSS/images ne chargent pas

**Solution:**
```toml
# Vérifier publish directory
[build]
  publish = "."   # Ou "./" ou "./frontend"
```

Vérifier Netlify: **Site settings → Build & deploy → Publishing**

---

## 🔐 Variables Sensibles

### ❌ À NE PAS faire

```bash
# ✗ Committer les secrets
git add .env
git commit -m "Add API keys"
git push

# ✗ Hardcoder les URLs
const API_URL = "https://backend-phenix.onrender.com/api"; // Visible dans le code!
```

### ✅ Faire plutôt

```bash
# ✓ Exclure .env
echo ".env" >> .gitignore

# ✓ Utiliser config.js + env variables
const API_URL = process.env.VITE_API_BASE_URL || DEFAULT_URL;
```

---

## 📝 Checklist Déploiement Complet

### Avant le déploiement

- [ ] Code testé localement
- [ ] `config.js` pointe vers backend Render
- [ ] `_redirects` configuré
- [ ] `netlify.toml` présent
- [ ] CSV minifiés (optionnel)
- [ ] Images optimisées
- [ ] Pas de console.log() debug

### Pendant le déploiement

- [ ] Site créé sur Netlify
- [ ] GitHub connecté
- [ ] Build réussi (voir logs Netlify)
- [ ] Pas d'erreurs en build

### Après le déploiement

- [ ] Site online: https://front-phenix.netlify.app
- [ ] HTTPS actif 🔒
- [ ] Pages chargent
- [ ] API fonctionne (test-api.html)
- [ ] Login possible
- [ ] Panier fonctionne
- [ ] Admin accessible
- [ ] Pas d'erreurs console

---

## 🔔 Troubleshooting Deployment

### Logs Netlify

```
Netlify Dashboard → Deploys → Latest → "Deploy log"
```

Chercher:
- Erreurs pendant le build
- Commands exécutées
- Résultat final

### Re-deploy

```bash
# Force un re-deploy
Netlify Dashboard → Deploys → "Trigger deploy" → "Deploy site"
```

### Vider le cache

```bash
Netlify Dashboard → Deploys → "Clear cache and retry"
```

---

## 📞 Ressources Netlify

- **Docs:** https://docs.netlify.com
- **Support:** support@netlify.com
- **Community:** https://community.netlify.com
- **Status:** https://www.netlify.com/status

---

## 🎯 Prochaines Étapes

1. [ ] Deploy le frontend sur Netlify
2. [ ] Tester avec test-api.html
3. [ ] Configurer domaine personnalisé
4. [ ] Activer Google Analytics
5. [ ] Mettre en place CI/CD GitHub Actions
6. [ ] Configurer Sentry pour les erreurs

---

**Status:** ✅ Déploiement Frontend Configuré  
**Frontend:** https://front-phenix.netlify.app  
**Backend:** https://backend-phenix.onrender.com  
**Last Updated:** 2026-03-12
