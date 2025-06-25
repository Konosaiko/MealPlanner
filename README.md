# MealPlanner

Application web collaborative de planification de repas et de génération de listes de courses. Cette application permet aux utilisateurs de planifier leurs repas hebdomadaires, gérer leurs ingrédients et générer automatiquement des listes de courses optimisées.

## 📸 Aperçu du Projet

Une solution complète pour :
- 🍽️ **Gérer vos repas** : Créer, modifier et organiser votre base de données de repas
- 📅 **Planifier votre semaine** : Interface intuitive pour assigner des repas aux créneaux midi/soir
- 🛒 **Générer vos listes de courses** : Consolidation automatique des ingrédients nécessaires
- 👥 **Collaborer** : Partage et planification à plusieurs utilisateurs

## ✨ Fonctionnalités Implémentées

### 🔐 Authentification & Sécurité
- Système d'authentification JWT sécurisé
- Gestion des utilisateurs avec chiffrement des mots de passe
- Routes protégées et autorisation par utilisateur

### 🍽️ Gestion des Repas
- **CRUD complet** : Création, modification, suppression et consultation des repas
- **Base de données personnelle** : Chaque utilisateur gère ses propres repas
- **Gestion des ingrédients** : Association d'ingrédients avec quantités pour chaque repas
- **Interface moderne** : Modal de création/édition avec auto-complétion

### 📅 Planification Hebdomadaire
- **Vue calendaire intuitive** : Planning par semaine avec créneaux midi/soir
- **Attribution flexible** : Sélection de repas depuis votre base de données
- **Navigation temporelle** : Consultation et modification des semaines passées/futures
- **Gestion collaborative** : Partage de plannings entre utilisateurs

### 🛒 Liste de Courses Intelligente 
- **Génération automatique** : Consolidation de tous les ingrédients de la semaine
- **Vérification de disponibilité** : Interface pour cocher les ingrédients déjà possédés
- **Optimisation des quantités** : Calcul automatique des quantités totales par ingrédient
- **Historique des listes** : Consultation des listes de courses précédentes

## 🛠️ Stack Technique

### Backend (Symfony 7.3)
- **Framework** : Symfony 7.3 avec PHP 8.2+
- **API** : API Platform pour REST API
- **Base de données** : PostgreSQL avec Doctrine ORM
- **Authentification** : JWT avec LexikJWTAuthenticationBundle
- **CORS** : Configuration Nelmio CORS pour communication frontend/backend
- **Architecture** : Architecture propre avec entités, repositories, services et contrôleurs

### Frontend (React 19)
- **Framework** : React 19 avec TypeScript
- **Styling** : TailwindCSS + Material-UI (MUI)
- **Routing** : React Router DOM v7
- **HTTP Client** : Axios pour les appels API
- **State Management** : TanStack Query pour la gestion d'état serveur
- **Build Tool** : Vite pour le développement et la production
- **Gestion des dates** : date-fns pour la manipulation des dates

## 📊 Architecture des Données

### Entités Backend
- **User** : Gestion des utilisateurs et authentification
- **Meal** : Repas avec nom, description et association utilisateur
- **Ingredient** : Base de données d'ingrédients avec unités
- **MealIngredient** : Relation repas/ingrédients avec quantités
- **WeekPlanning** : Planifications hebdomadaires
- **MealSlot** : Créneaux de repas (jour + moment + repas assigné)
- **ShoppingList** : Listes de courses générées
- **ShoppingItem** : Éléments de liste avec statut acheté/non acheté

### Pages Frontend
- **Connexion** (`Login.tsx`) : Authentification utilisateur
- **Gestion des Repas** (`MealManagement.tsx`) : CRUD des repas
- **Planification** (`WeekPlanning.tsx`) : Interface de planification hebdomadaire
- **Liste de Courses** (`ShoppingList.tsx`) : Gestion des courses
- **Index des Listes** (`ShoppingListIndex.tsx`) : Historique des listes
- **Paramètres** (`Settings.tsx`) : Configuration utilisateur

## 🚀 Installation et Configuration

### Prérequis
- **PHP** 8.2 ou supérieur
- **Composer** pour la gestion des dépendances PHP
- **PostgreSQL** comme base de données
- **Node.js** 18+ et **npm** pour le frontend

### Installation Backend

```bash
cd backend

# Installation des dépendances
composer install

# Configuration de l'environnement
cp .env .env.local
# Éditer .env.local avec vos paramètres de base de données

# Création de la base de données
php bin/console doctrine:database:create

# Exécution des migrations
php bin/console doctrine:migrations:migrate

# Génération des clés JWT
php bin/console lexik:jwt:generate-keypair

# Démarrage du serveur de développement
symfony server:start
# Ou
php -S localhost:8000 -t public/
```

### Installation Frontend

```bash
cd frontend

# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# L'application sera accessible sur http://localhost:5173
```

### Configuration de l'environnement

#### Backend (.env.local)
```env
DATABASE_URL="postgresql://username:password@127.0.0.1:5432/meal_planner?serverVersion=16&charset=utf8"
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=your_passphrase
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
```

## 📱 Utilisation

### Premier lancement
1. **Créer un utilisateur** : Utiliser la commande Symfony ou s'inscrire via l'interface
2. **Se connecter** : Utiliser l'interface de connexion
3. **Créer vos premiers repas** : Aller dans "Gestion des Repas"
4. **Planifier votre semaine** : Assigner des repas aux créneaux
5. **Générer votre liste de courses** : Automatiquement créée à partir de votre planning

### Commandes utiles

```bash
# Créer un utilisateur via CLI (backend)
php bin/console app:create-user

# Tests de connexion
php bin/console app:test-login

# Vider le cache
php bin/console cache:clear

# Build de production (frontend)
npm run build
```

## 🔧 Développement

### Structure du projet
```
MealPlanner/
├── backend/           # API Symfony
│   ├── src/
│   │   ├── Entity/    # Entités Doctrine
│   │   ├── Controller/ # Contrôleurs API
│   │   ├── Repository/ # Repositories Doctrine
│   │   └── Service/   # Services métier
│   └── migrations/    # Migrations de base de données
└── frontend/          # Application React
    ├── src/
    │   ├── components/ # Composants réutilisables
    │   ├── pages/     # Pages de l'application
    │   ├── services/  # Services API
    │   └── types/     # Types TypeScript
    └── public/        # Assets statiques
```

### Contribution

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. **Commiter** vos changements (`git commit -m 'Add amazing feature'`)
4. **Pousser** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

## 🚧 Roadmap

### Phase 2 - Améliorations UX
- [ ] Application mobile (PWA)
- [ ] Notifications push
- [ ] Import/Export de plannings
- [ ] Templates de semaines récurrentes

### Phase 3 - Intelligence
- [ ] Suggestions automatiques de repas
- [ ] Analyse nutritionnelle
- [ ] Suggestions saisonnières
- [ ] Statistiques de consommation

### Phase 4 - Fonctionnalités avancées
- [ ] Gestion des stocks/réserves
- [ ] Intégration avec services de livraison
- [ ] Partage public de recettes
- [ ] Estimation des coûts

## 🐛 Problèmes Connus

- Les migrations de base de données doivent être exécutées manuellement
- La configuration CORS doit être adaptée pour la production
- Les clés JWT doivent être régénérées pour la production

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une [issue](https://github.com/votre-repo/MealPlanner/issues)
- Consulter la documentation API à `/api/docs` (backend démarré)

---

**MealPlanner** - Simplifiez votre quotidien culinaire ! 🍽️✨ 