# PHENIX-TECH-SERVICES - Frontend Netlify

Frontend statique pour PHENIX-TECH-SERVICES hébergé sur **Netlify**, communiquant avec un backend hébergé sur **Render**.

## 🚀 Architecture

```
Frontend (Netlify)         Backend (Render)
https://front-phenix.netlify.app  <--->  https://backend-phenix.onrender.com/api
```

## 📦 Structure Frontend

```
frontend/
├── index.html              # Page d'accueil
├── catalog.html           # Catalogue produits
├── cart.html              # Panier
├── checkout.html          # Paiement
├── login-user.html        # Connexion utilisateur
├── signup.html            # Inscription utilisateur
├── admin.html             # Dashboard admin
├── admin-login.html       # Connexion admin
├── admin-access-code.html # Code d'accès admin
├── config.js              # Configuration globale (URL API, endpoints)
├── api.js                 # Client API (fetch wrapper)
├── theme.js               # Gestion du thème
├── server.js              # ⚠️ DÉVELOPPEMENT LOCAL UNIQUEMENT
├── _redirects             # Routes Netlify
├── netlify.toml           # Configuration Netlify
├── css/                   # Styles CSS
├── images/                # Ressources images
└── README.md              # Cette documentation
```

## ⚙️ Configuration

### 1. Variables d'environnement (`config.js`)

Le fichier `config.js` contient la configuration globale:

```javascript
const CONFIG = {
  API_BASE_URL: 'https://backend-phenix.onrender.com/api',
  BACKEND_URL: 'https://backend-phenix.onrender.com',
  FRONTEND_URL: window.location.origin, // Détection automatique
  
  STORAGE: {
    USER_TOKEN: 'user_token',
    ADMIN_TOKEN: 'admin_token',
    CART_ITEMS: 'cart_items'
  }
};
```

### 2. Client API (`api.js`)

Toutes les requêtes API passent par `PhenixAPI`:

```javascript
// Récupérer les produits
const products = await PhenixAPI.getProducts();

// Connexion utilisateur
const result = await PhenixAPI.loginUser(email, password);

// Ajouter au panier
const response = await PhenixAPI.addToCart(productId, quantity);
```

**Gestion automatique:**
- ✅ Headers CORS
- ✅ Token d'authentification (Bearer)
- ✅ Gestion des erreurs 401 (déconnexion)
- ✅ Logging des requêtes

## 🌐 Endpoints API

### Authentification Utilisateur
- `POST /api/auth/login` - Connexion
- `POST /api/auth/signup` - Inscription
- `POST /api/auth/verify` - Vérification session
- `POST /api/auth/logout` - Déconnexion

### Authentification Admin
- `POST /api/auth/admin/login` - Connexion admin
- `POST /api/auth/admin/signup` - Inscription admin
- `POST /api/auth/admin/verify` - Vérification admin

### Produits
- `GET /api/products` - Liste produits
- `GET /api/products/:id` - Détail produit
- `GET /api/products/search?q=query` - Rechercher
- `POST /api/products` - Créer (admin)
- `PUT /api/products/:id` - Modifier (admin)
- `DELETE /api/products/:id` - Supprimer (admin)

### Panier
- `GET /api/cart` - Récupérer panier
- `POST /api/cart/add` - Ajouter article
- `DELETE /api/cart/remove/:id` - Retirer article
- `PUT /api/cart/update/:id` - Mettre à jour quantité
- `DELETE /api/cart/clear` - Vider panier

### Commandes
- `POST /api/orders` - Créer commande
- `GET /api/orders` - Mes commandes
- `GET /api/orders/:id` - Détail commande
- `PUT /api/orders/:id/status` - Mettre à jour statut (admin)

### Paiements
- `POST /api/payments/create` - Créer paiement
- `POST /api/payments/verify` - Vérifier paiement
- `GET /api/payments` - Historique paiements

## 📝 Utilisation

### Affaquet

```javascript
// ✓ Utiliser PhenixAPI pour toutes les requêtes
const products = await PhenixAPI.getProducts({ search: 'laptop' });

// ✓ Configuration centralisée
const apiUrl = CONFIG.API_BASE_URL;

// ✓ Gestion des tokens
const token = CONFIG.getUserToken();
```

### ❌ À ÉVITER

```javascript
// ✗ Appels fetch directs
fetch('http://localhost:3000/api/products')

// ✗ URLs en dur dans le code
const url = 'https://backend-phenix.onrender.com/api/products';

// ✗ Socket.io en production (Netlify statique)
```

## 🚀 Déploiement

### Avec Netlify CLI

```bash
# 1. Installer Netlify CLI
npm install -g netlify-cli

# 2. Se connecter à Netlify
netlify login

# 3. Déployer
netlify deploy --prod

# Ou simplement pousser sur GitHub (Netlify se déclenche automatiquement)
git push origin main
```

### Avec GitHub Integration

1. Connecter votre repo GitHub à Netlify
2. Branch production: `main`
3. Netlify redéploiera automatiquement à chaque push

## 🔐 CORS & Authentification

### Configuration CORS Backend

Le backend Render doit accepter les requêtes depuis Netlify:

```javascript
// Backend: app.use(cors({
  origin: ['https://front-phenix.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Headers Requis (Netlify)

```toml
[headers]
  [headers.values]
    Access-Control-Allow-Origin = "https://backend-phenix.onrender.com"
```

## 🧪 Tests

### Vérifier les requêtes API

Ouvrir DevTools (F12) → Console:

```javascript
// Vérifier la configuration
console.log(CONFIG.API_BASE_URL);
// Résultat: https://backend-phenix.onrender.com/api

// Tester une requête
PhenixAPI.getProducts().then(products => console.log(products));
```

### Éléments à tester

- ✅ `index.html` - Charge les produits
- ✅ `catalog.html` - Affiche le catalogue
- ✅ `cart.html` - Panier fonctionne
- ✅ `checkout.html` - Paiement initié
- ✅ `login-user.html` - Connexion OK
- ✅ `admin.html` - Dashboard admin

## 📚 Fichiers de Développement

### `server.js` - Développement Local UNIQUEMENT

Ce fichier est fourni pour servir le frontend localement pendant le développement:

```bash
# Serveur local à port 5500
node server.js

# Accès: http://localhost:5500
```

**⚠️ NE PAS UTILISER EN PRODUCTION** - Netlify n'exécute pas Node.js.

## 🐛 Dépannage

### Erreur CORS

```
Access to XMLHttpRequest at 'https://backend-phenix.onrender.com/api/products' 
from origin 'https://front-phenix.netlify.app' has been blocked by CORS policy
```

**Solution:**
1. Backend: Ajouter Netlify URL à `allowedOrigins`
2. Frontend: Vérifier `API_BASE_URL` dans `config.js`

### Erreur 401 Unauthorized

```
{"error":"Unauthorized","message":"Invalid token"}
```

**Solution:**
1. Vérifier que le token est stocké: `localStorage.getItem('user_token')`
2. Vérifier l'expiration du token
3. Se reconnecter via `login-user.html`

### Erreur 404 sur les sous-pages

```
Page not found: /cart.html
```

**Solution:**
Vérifier le fichier `_redirects` est bien configuré:
```
/* /index.html 200
```

## 📞 Support

Pour les problèmes de connexion Backend-Frontend, vérifier:

1. Backend Render accessible: `curl https://backend-phenix.onrender.com/api/products`
2. CORS headers in DevTools Network tab
3. `config.js` pointe vers la bonne URL
4. Token authentication valide

---

**Dernière mise à jour:** 2026-03-12  
**Frontend Hosting:** Netlify  
**Backend Hosting:** Render  
**Architecture:** Statique Frontend + API REST Backend
