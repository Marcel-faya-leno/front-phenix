// api.js - API Client para PHENIX-TECH-SERVICES
// Netlify Frontend + Render Backend (sans Node.js, sans Socket.io)

const PhenixAPI = {
    // Configuration
    config: {
        apiBase: CONFIG?.API_BASE_URL || 'https://backend-phenix.onrender.com/api',
        timeout: 30000
    },

    /**
     * Requête fetch standard avec gestion CORS
     */
    async fetch(endpoint, options = {}) {
        try {
            // Récupérer le token d'authentification
            const token = localStorage.getItem(CONFIG?.STORAGE?.USER_TOKEN) || localStorage.getItem(CONFIG?.STORAGE?.ADMIN_TOKEN);
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            };

            // Ajouter le token Authorization si disponible
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Configuration de la requête
            const config = {
                method: options.method || 'GET',
                headers,
                ...options
            };

            // Sérialiser le body si nécessaire
            if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
                config.body = JSON.stringify(options.body);
            }

            console.log(`[API] ${config.method} ${endpoint}`);

            const response = await fetch(endpoint, config);
            const data = await response.json();

            // Gestion des erreurs d'authentification
            if (response.status === 401) {
                console.error('[API] Non authentifié (401)');
                localStorage.removeItem(CONFIG?.STORAGE?.USER_TOKEN);
                localStorage.removeItem(CONFIG?.STORAGE?.ADMIN_TOKEN);
                localStorage.removeItem(CONFIG?.STORAGE?.USER_INFO);
                localStorage.removeItem(CONFIG?.STORAGE?.ADMIN_INFO);
                if (window.location.pathname !== '/login-user.html' && window.location.pathname !== '/admin-login.html') {
                    window.location.href = '/login-user.html';
                }
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }

            // Vérifier la réponse
            if (!response.ok) {
                console.error('[API] Erreur:', response.status, data);
                throw new Error(data?.message || data?.error || 'Erreur serveur');
            }

            console.log(`[API] ✓ ${config.method} ${endpoint}`);
            return data;
        } catch (error) {
            console.error('[API] Erreur fetch:', error.message);
            throw error;
        }
    },

    // === AUTHENTIFICATION UTILISATEUR ===

    /**
     * Connexion utilisateur
     */
    async loginUser(email, password) {
        try {
            const response = await this.fetch(`${this.config.apiBase}/auth/login`, {
                method: 'POST',
                body: { email, password }
            });

            if (response.success && response.data?.token) {
                localStorage.setItem(CONFIG?.STORAGE?.USER_TOKEN, response.data.token);
                localStorage.setItem(CONFIG?.STORAGE?.USER_INFO, JSON.stringify(response.data.user || {}));
                return response;
            }

            throw new Error(response.message || 'Erreur de connexion');
        } catch (error) {
            console.error('[API] Erreur loginUser:', error);
            throw error;
        }
    },

    /**
     * Inscription utilisateur
     */
    async signupUser(userData) {
        try {
            const response = await this.fetch(`${this.config.apiBase}/auth/signup`, {
                method: 'POST',
                body: userData
            });

            if (response.success && response.data?.token) {
                localStorage.setItem(CONFIG?.STORAGE?.USER_TOKEN, response.data.token);
                localStorage.setItem(CONFIG?.STORAGE?.USER_INFO, JSON.stringify(response.data.user || {}));
            }

            return response;
        } catch (error) {
            console.error('[API] Erreur signupUser:', error);
            throw error;
        }
    },

    /**
     * Vérifier la session utilisateur
     */
    async verifyUser() {
        try {
            const token = localStorage.getItem(CONFIG?.STORAGE?.USER_TOKEN);
            if (!token) {
                return { success: false, data: null };
            }

            const response = await this.fetch(`${this.config.apiBase}/auth/verify`, {
                method: 'POST'
            });

            return response;
        } catch (error) {
            console.error('[API] Erreur verifyUser:', error);
            return { success: false, data: null };
        }
    },

    /**
     * Déconnexion utilisateur
     */
    async logoutUser() {
        try {
            await this.fetch(`${this.config.apiBase}/auth/logout`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('[API] Erreur logoutUser:', error);
        } finally {
            localStorage.removeItem(CONFIG?.STORAGE?.USER_TOKEN);
            localStorage.removeItem(CONFIG?.STORAGE?.USER_INFO);
            window.location.href = '/';
        }
    },

    // === AUTHENTIFICATION ADMIN ===

    /**
     * Connexion admin
     */
    async loginAdmin(email, password) {
        try {
            const response = await this.fetch(`${this.config.apiBase}/auth/admin/login`, {
                method: 'POST',
                body: { email, password }
            });

            if (response.success && response.data?.token) {
                localStorage.setItem(CONFIG?.STORAGE?.ADMIN_TOKEN, response.data.token);
                localStorage.setItem(CONFIG?.STORAGE?.ADMIN_INFO, JSON.stringify(response.data.admin || {}));
                return response;
            }

            throw new Error(response.message || 'Erreur de connexion admin');
        } catch (error) {
            console.error('[API] Erreur loginAdmin:', error);
            throw error;
        }
    },

    /**
     * Inscription admin
     */
    async signupAdmin(adminData) {
        try {
            const response = await this.fetch(`${this.config.apiBase}/auth/admin/signup`, {
                method: 'POST',
                body: adminData
            });

            if (response.success && response.data?.token) {
                localStorage.setItem(CONFIG?.STORAGE?.ADMIN_TOKEN, response.data.token);
                localStorage.setItem(CONFIG?.STORAGE?.ADMIN_INFO, JSON.stringify(response.data.admin || {}));
            }

            return response;
        } catch (error) {
            console.error('[API] Erreur signupAdmin:', error);
            throw error;
        }
    },

    /**
     * Vérifier la session admin
     */
    async verifyAdmin() {
        try {
            const token = localStorage.getItem(CONFIG?.STORAGE?.ADMIN_TOKEN);
            if (!token) {
                return { success: false, data: null };
            }

            const response = await this.fetch(`${this.config.apiBase}/auth/admin/verify`, {
                method: 'POST'
            });

            return response;
        } catch (error) {
            console.error('[API] Erreur verifyAdmin:', error);
            return { success: false, data: null };
        }
    },

    /**
     * Déconnexion admin
     */
    async logoutAdmin() {
        try {
            await this.fetch(`${this.config.apiBase}/auth/admin/logout`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('[API] Erreur logoutAdmin:', error);
        } finally {
            localStorage.removeItem(CONFIG?.STORAGE?.ADMIN_TOKEN);
            localStorage.removeItem(CONFIG?.STORAGE?.ADMIN_INFO);
            window.location.href = '/admin-login.html';
        }
    },

    // === PRODUITS ===

    /**
     * Récupérer la liste des produits
     */
    async getProducts(options = {}) {
        try {
            const url = new URL(`${this.config.apiBase}/products`);
            if (options.search) url.searchParams.append('search', options.search);
            if (options.category) url.searchParams.append('category', options.category);
            if (options.page) url.searchParams.append('page', options.page);
            if (options.limit) url.searchParams.append('limit', options.limit);
            if (options.sort) url.searchParams.append('sort', options.sort);

            const response = await this.fetch(url.toString());
            return Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            console.error('[API] Erreur getProducts:', error);
            return [];
        }
    },

    /**
     * Récupérer un produit par ID
     */
    async getProduct(id) {
        try {
            const response = await this.fetch(`${this.config.apiBase}/products/${id}`);
            return response.data || response || null;
        } catch (error) {
            console.error('[API] Erreur getProduct:', error);
            return null;
        }
    },

    /**
     * Obtenir les catégories
     */
    async getCategories() {
        try {
            const response = await this.fetch(`${this.config.apiBase}/products/categories`);
            return Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            console.error('[API] Erreur getCategories:', error);
            return [];
        }
    },

    /**
     * Récupérer les statistiques
     */
    async getStats() {
        try {
            const response = await this.fetch(`${this.config.apiBase}/products/stats`);
            const data = response.data || response || {};

            return {
                totalProducts: data.totalProducts || 0,
                totalCategories: data.totalCategories || 0,
                totalRevenue: data.totalRevenue || 0,
                totalOrders: data.totalOrders || 0,
                customers: data.customers || 0,
                successRate: data.successRate || 98,
                supportTime: data.supportTime || '24h'
            };
        } catch (error) {
            console.error('[API] Erreur getStats:', error);
            return {
                totalProducts: 0,
                totalCategories: 0,
                totalRevenue: 0,
                totalOrders: 0,
                customers: 0,
                successRate: 0,
                supportTime: 'N/A'
            };
        }
    },

    /**
     * Créer un produit (admin)
     */
    async createProduct(formData) {
        try {
            const token = localStorage.getItem(CONFIG?.STORAGE?.ADMIN_TOKEN);
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`${this.config.apiBase}/products`, {
                method: 'POST',
                headers,
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur création produit');
            }

            return data;
        } catch (error) {
            console.error('[API] Erreur createProduct:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour un produit (admin)
     */
    async updateProduct(id, formData) {
        try {
            const token = localStorage.getItem(CONFIG?.STORAGE?.ADMIN_TOKEN);
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`${this.config.apiBase}/products/${id}`, {
                method: 'PUT',
                headers,
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur mise à jour produit');
            }

            return data;
        } catch (error) {
            console.error('[API] Erreur updateProduct:', error);
            throw error;
        }
    },

    /**
     * Supprimer un produit (admin)
     */
    async deleteProduct(id) {
        try {
            const token = localStorage.getItem(CONFIG?.STORAGE?.ADMIN_TOKEN);
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`${this.config.apiBase}/products/${id}`, {
                method: 'DELETE',
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur suppression produit');
            }

            return data;
        } catch (error) {
            console.error('[API] Erreur deleteProduct:', error);
            throw error;
        }
    },

    /**
     * Rechercher des produits
     */
    async searchProducts(query) {
        try {
            const url = new URL(`${this.config.apiBase}/products/search`);
            url.searchParams.append('q', query);

            const response = await this.fetch(url.toString());
            return Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            console.error('[API] Erreur searchProducts:', error);
            return [];
        }
    },

    // === PANIER ===

    /**
     * Récupérer le panier
     */
    async getCart() {
        try {
            const response = await this.fetch(`${this.config.apiBase}/cart`);

            if (response.success && response.data?.items) {
                localStorage.setItem(CONFIG?.STORAGE?.CART_ITEMS, JSON.stringify(response.data.items));
            }

            return response;
        } catch (error) {
            console.error('[API] Erreur getCart:', error);
            const cached = localStorage.getItem(CONFIG?.STORAGE?.CART_ITEMS);
            if (cached) {
                return { success: true, data: { items: JSON.parse(cached) } };
            }
            return { success: false, data: { items: [] } };
        }
    },

    /**
     * Ajouter un article au panier
     */
    async addToCart(productId, quantity = 1) {
        try {
            if (!productId) {
                throw new Error('ID produit requis');
            }

            const result = await this.fetch(`${this.config.apiBase}/cart/add`, {
                method: 'POST',
                body: {
                    productId: productId.toString(),
                    quantity: parseInt(quantity) || 1
                }
            });

            if (result.success && result.data) {
                localStorage.setItem(CONFIG?.STORAGE?.CART_ITEMS, JSON.stringify(result.data.items || []));
                return result;
            }

            throw new Error(result.message || 'Erreur ajout panier');
        } catch (error) {
            console.error('[API] Erreur addToCart:', error);
            throw error;
        }
    },

    /**
     * Retirer un article du panier
     */
    async removeFromCart(productId) {
        try {
            const result = await this.fetch(`${this.config.apiBase}/cart/remove/${productId}`, {
                method: 'DELETE'
            });

            if (result.success) {
                localStorage.setItem(CONFIG?.STORAGE?.CART_ITEMS, JSON.stringify(result.data?.items || []));
                return result;
            }

            throw new Error(result.message || 'Erreur suppression panier');
        } catch (error) {
            console.error('[API] Erreur removeFromCart:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour la quantité d'un article
     */
    async updateCartItem(productId, quantity) {
        try {
            const result = await this.fetch(`${this.config.apiBase}/cart/update/${productId}`, {
                method: 'PUT',
                body: { quantity }
            });

            if (result.success && result.data) {
                localStorage.setItem(CONFIG?.STORAGE?.CART_ITEMS, JSON.stringify(result.data.items || []));
                return result;
            }

            throw new Error(result.message || 'Erreur mise à jour panier');
        } catch (error) {
            console.error('[API] Erreur updateCartItem:', error);
            throw error;
        }
    },

    /**
     * Vider le panier
     */
    async clearCart() {
        try {
            const result = await this.fetch(`${this.config.apiBase}/cart/clear`, {
                method: 'DELETE'
            });

            if (result.success) {
                localStorage.removeItem(CONFIG?.STORAGE?.CART_ITEMS);
                return result;
            }

            throw new Error(result.message || 'Erreur vidage panier');
        } catch (error) {
            console.error('[API] Erreur clearCart:', error);
            throw error;
        }
    },
    // === COMMANDES ===

    /**
     * Créer une commande
     */
    async createOrder(orderData) {
        try {
            const response = await this.fetch(`${this.config.apiBase}/orders`, {
                method: 'POST',
                body: orderData
            });

            if (response.success) {
                localStorage.removeItem(CONFIG?.STORAGE?.CART_ITEMS);
            }

            return response;
        } catch (error) {
            console.error('[API] Erreur createOrder:', error);
            throw error;
        }
    },

    /**
     * Récupérer les commandes de l'utilisateur
     */
    async getOrders() {
        try {
            const response = await this.fetch(`${this.config.apiBase}/orders`);
            return Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            console.error('[API] Erreur getOrders:', error);
            return [];
        }
    },

    /**
     * Récupérer une commande par ID
     */
    async getOrder(id) {
        try {
            const response = await this.fetch(`${this.config.apiBase}/orders/${id}`);
            return response.data || response || null;
        } catch (error) {
            console.error('[API] Erreur getOrder:', error);
            return null;
        }
    },

    /**
     * Mettre à jour le statut d'une commande (admin)
     */
    async updateOrderStatus(id, status) {
        try {
            const token = localStorage.getItem(CONFIG?.STORAGE?.ADMIN_TOKEN);
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const response = await fetch(`${this.config.apiBase}/orders/${id}/status`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur mise à jour statut');
            }

            return data;
        } catch (error) {
            console.error('[API] Erreur updateOrderStatus:', error);
            throw error;
        }
    },

    // === PAIEMENTS ===

    /**
     * Créer un paiement
     */
    async createPayment(paymentData) {
        try {
            const response = await this.fetch(`${this.config.apiBase}/payments/create`, {
                method: 'POST',
                body: paymentData
            });

            return response;
        } catch (error) {
            console.error('[API] Erreur createPayment:', error);
            throw error;
        }
    },

    /**
     * Vérifier un paiement
     */
    async verifyPayment(paymentReference) {
        try {
            const response = await this.fetch(`${this.config.apiBase}/payments/verify`, {
                method: 'POST',
                body: { paymentReference }
            });

            return response;
        } catch (error) {
            console.error('[API] Erreur verifyPayment:', error);
            throw error;
        }
    },

    /**
     * Récupérer l'historique des paiements
     */
    async getPayments() {
        try {
            const response = await this.fetch(`${this.config.apiBase}/payments`);
            return Array.isArray(response) ? response : (response.data || []);
        } catch (error) {
            console.error('[API] Erreur getPayments:', error);
            return [];
        }
    },

    // === UTILITAIRES ===

    /**
     * Formater un prix
     */
    formatPrice(price) {
        if (!price) return '0 GNF';
        return new Intl.NumberFormat('fr-FR').format(Math.round(price)) + ' GNF';
    },

    /**
     * Formater une date
     */
    formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // ============================================
    // === SOCKET.IO STUBS (Deprecated) ===
    // === Kept for backward compatibility ===
    // ============================================

    /**
     * Initialiser Socket.io (deprecated - Netlify compatible version)
     * @deprecated Socket.io not available in Netlify production
     */
    initSocket() {
        console.warn('[API] Socket.io disabled for Netlify production');
        return null;
    },

    /**
     * Récupérer le socket (deprecated)
     * @deprecated Socket.io not available
     */
    getSocket() {
        return null;
    },

    /**
     * Fermer le socket (deprecated)
     * @deprecated Socket.io not available
     */
    closeSocket() {
        // No-op
    },

    /**
     * Afficher une notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';

        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: '500',
            animation: 'slideIn 0.3s ease',
            maxWidth: '400px'
        });

        if (type === 'success') {
            notification.style.background = 'rgba(16, 185, 129, 0.95)';
            notification.style.color = 'white';
        } else if (type === 'error') {
            notification.style.background = 'rgba(239, 68, 68, 0.95)';
            notification.style.color = 'white';
        } else if (type === 'warning') {
            notification.style.background = 'rgba(245, 158, 11, 0.95)';
            notification.style.color = 'white';
        } else {
            notification.style.background = 'rgba(42, 92, 170, 0.95)';
            notification.style.color = 'white';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    /**
     * Mettre à jour le compteur du panier
     */
    async updateCartCount() {
        try {
            const cart = JSON.parse(localStorage.getItem(CONFIG?.STORAGE?.CART_ITEMS) || '[]');
            const total = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartCount = document.getElementById('cart-count');
            
            if (!cartCount) return total;
            
            const oldCount = parseInt(cartCount.textContent) || 0;
            cartCount.textContent = total;
            
            // Ajouter l'animation uniquement si le compteur a augmenté
            if (total > oldCount) {
                cartCount.classList.remove('updated');
                void cartCount.offsetWidth;
                cartCount.classList.add('updated');
                
                // Remplir de couleur vive
                cartCount.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.8)';
                
                setTimeout(() => {
                    cartCount.style.boxShadow = '0 2px 8px rgba(255, 107, 53, 0.4)';
                }, 600);
            }
            
            return total;
        } catch (error) {
            console.error('[API] Erreur updateCartCount:', error);
            const cartCount = document.getElementById('cart-count');
            if (cartCount) cartCount.textContent = '0';
            return 0;
        }
    }
};

// Rendre disponible globalement
if (typeof window !== 'undefined') {
    window.PhenixAPI = PhenixAPI;
}

// Exporter pour Node.js si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhenixAPI;
}
