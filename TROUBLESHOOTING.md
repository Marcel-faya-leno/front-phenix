# 🐛 Guide de Dépannage - PHENIX-TECH-SERVICES

## Problèmes Courants et Solutions

### 1. Erreur CORS

**Symptôme:**
```
Access to XMLHttpRequest at 'https://backend-phenix.onrender.com/api/products' 
from origin 'https://front-phenix.netlify.app' has been blocked by CORS policy
```

**Causes Possibles:**
- Backend ne configure pas CORS correctement
- Domaine frontend ne est pas whitelisté

**Solutions:**
```javascript
// Backend: app.js ou server.js
const cors = require('cors');

app.use(cors({
  origin: ['https://front-phenix.netlify.app', 'http://localhost:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
```

**Vérification:**
Ouvrir DevTools → Network → Chercher la requête → Response Headers:
```
Access-Control-Allow-Origin: https://front-phenix.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

### 2. Erreur 401 Unauthorized

**Symptôme:**
```json
{"error": "Unauthorized", "message": "Invalid token"}
```

**Causes Possibles:**
- Token expiré
- Token invalide stocké
- Pas d'token envoyé

**Solutions:**

1. **Vérifier le token en localStorage:**
```javascript
// DevTools Console
localStorage.getItem('user_token')
// Doit afficher quelque chose comme: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

2. **Clear localStorage et se reconnecter:**
```javascript
localStorage.clear();
// Aller à https://front-phenix.netlify.app/login-user.html
```

3. **Vérifier que le backend envoie le token:**
```bash
curl -X POST https://backend-phenix.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Doit retourner:
# {"success": true, "data": {"token": "eyJ...", "user": {...}}}
```

---

### 3. Erreur 404 sur les sous-pages

**Symptôme:**
```
Page not found: /cart.html
Netlify error: Page not found on this site
```

**Cause:**
Le fichier `_redirects` est incorrectement configuré ou absent.

**Solution:**
```toml
# _redirects
/* /index.html 200
```

**Vérification:**
Netlify Dashboard → Settings → Redirects

---

### 4. API Lente ou Timeout

**Symptômes:**
- Requêtes qui prennent +30 secondes
- "ERR_TIMED_OUT"

**Causes Possibles:**
- Backend sur Render sleeping (plan gratuit)
- Mauvaise connexion réseau
- Base de données lente

**Solutions:**

1. **Vérifier si le backend est actif:**
```bash
curl https://backend-phenix.onrender.com/health
```

2. **Augmenter le timeout dans config.js:**
```javascript
// config.js
config: {
  timeout: 60000 // 60 secondes au lieu de 30
}
```

3. **Relancer le backend Render:**
- Render Dashboard → Services → backend-phenix → Redeploy

---

### 5. Produits ne s'affichent pas

**Symptôme:**
Page catalog.html vide, pas d'erreur visible

**Causes Possibles:**
- API retourne vide []
- Configuration API_BASE_URL incorrecte
- Pas de produits dans la base de données

**Diagnostic:**

```javascript
// DevTools Console → testez API
PhenixAPI.getProducts()
  .then(products => console.log('Produits:', products))
  .catch(error => console.error('Erreur:', error));
```

**Solutions:**

1. **Vérifier la configuration:**
```javascript
console.log('API_BASE_URL:', CONFIG.API_BASE_URL);
// Doit afficher: https://backend-phenix.onrender.com/api
```

2. **Tester directement l'endpoint:**
```bash
curl https://backend-phenix.onrender.com/api/products
```

3. **Vérifier que les produits existent:**
```bash
# Sur le backend
mongo phenix_db
db.products.find().limit(5)
```

---

### 6. Panier vide après rechargement de page

**Symptôme:**
Articles ajoutés au panier, mais disparaissent après F5

**Cause:**
Backend bug ou localStorage non synchronisé

**Solution temporaire:**
```javascript
// api.js - addToCart() a un fallback localStorage
// Les articles sont sauvegardés même si l'API échoue
```

**Debug:**
```javascript
// Vérifier localStorage
localStorage.getItem('cart_items')
// Doit contenir: [{"productId":"123","quantity":1},...]
```

---

### 7. Erreur lors du login

**Symptôme:**
```
POST /api/auth/login 400 Bad Request
{"error": "Invalid credentials"}
```

**Solutions:**

1. **Vérifier les champs required:**
```javascript
// S'assurer que email et password ne sont pas vides
if (!email || !password) {
  throw new Error('Email et mot de passe requis');
}
```

2. **Vérifier que l'utilisateur existe:**
```bash
curl -X POST https://backend-phenix.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **Vérifier le hachage du mot de passe:**
Le backend doit comparer correctement bcrypt

---

### 8. Netlify affiche une page blanche

**Symptôme:**
Site Netlify page blanche, console vide

**Causes Possibles:**
- JavaScript erreur
- config.js/api.js ne charge pas
- HTML structure cassée

**Solutions:**

1. **Vérifier les erreurs console:**
DevTools → Console → Chercher les erreurs rouges

2. **Vérifier les fichiers chargent:**
DevTools → Network → Chercher config.js, api.js

3. **Vérifier que config.js est chargé avant api.js:**
```html
<!-- ✓ BON ORDRE -->
<script src="config.js"></script>
<script src="api.js"></script>  <!-- Dépend de CONFIG -->

<!-- ✗ MAUVAIS ORDRE -->
<script src="api.js"></script>
<script src="config.js"></script>
```

---

### 9. Session qui expire rapidement

**Symptôme:**
Connecté → 2 minutes plus tard → Déconnexion auto

**Cause:**
Token JWT avec TTL court sur le backend

**Solution:**
Backend → Augmenter le JWT expiration:
```javascript
// Backend: auth middleware
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }  // Augmenter de 24h à 7j
);
```

---

### 10. Images ne s'affichent pas

**Symptôme:**
Icône "image cassée" au lieu des produits

**Causes Possibles:**
- URL images incorrecte
- Images non uploadées au backend
- Problème CORS images

**Solutions:**

1. **Vérifier l'URL image:**
DevTools → Network → Chercher les requêtes image
Doit commencer par: `https://backend-phenix.onrender.com/uploads/...`

2. **Vérifier les fichiers existent:**
```bash
# Sur le backend
ls -la backend/uploads/products/
```

3. **Vérifier les headers CORS pour images:**
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

---

## 📊 Checklist de Vérification

Avant de déployer, vérifier:

- [ ] `config.js` pointe vers backend Render
- [ ] `_redirects` rédirige vers index.html
- [ ] `netlify.toml` headers CORS configurés
- [ ] Backend accepte requêtes CORS depuis Netlify
- [ ] Test page fonctionne: `test-api.html`
- [ ] Index.html affiche les produits
- [ ] Panier fonctionne
- [ ] Login/Signup fonctionne
- [ ] Admin dashboard accessible
- [ ] Pas d'erreurs en console JavaScript
- [ ] DevTools Network: pas d'erreurs rouge

---

## 🔍 Outils de Diagnostic

### 1. Test API Direct

```bash
# Vérifier que le backend répond
curl -X GET https://backend-phenix.onrender.com/api/products \
  -H "Content-Type: application/json"
```

### 2. Test CORS

```bash
# Vérifier les headers CORS
curl -X OPTIONS https://backend-phenix.onrender.com/api/products \
  -H "Access-Control-Request-Method: GET" \
  -H "Origin: https://front-phenix.netlify.app" -v
```

### 3. DevTools Console

```javascript
// Vérifier configuration
console.log({
  api: CONFIG.API_BASE_URL,
  frontend: CONFIG.FRONTEND_URL,
  token: localStorage.getItem('user_token'),
  cartItems: JSON.parse(localStorage.getItem('cart_items') || '[]')
});
```

### 4. Netlify Logs

Dashboard → Deploys → Logs → "Deploy log"

---

## 📞 Contacter le Support

Si le problème persiste:

1. Partager l'erreur exacte (copy/paste console)
2. Partager le URL Netlify
3. Partager la requête curl qui échoue
4. Partager les logs Netlify

---

**Last Updated:** 2026-03-12  
**Netlify Frontend:** https://front-phenix.netlify.app  
**Render Backend:** https://backend-phenix.onrender.com
