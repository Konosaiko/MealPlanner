# MealPlanner

Application web collaborative de planification de repas et de génération de listes de courses.

## 🚀 Technologies utilisées

### Backend (Symfony 7)
- API Platform pour l'API REST
- Doctrine ORM
- JWT Authentication
- PostgreSQL

### Frontend (React)
- TypeScript
- TailwindCSS
- Material-UI

## 📋 Fonctionnalités principales

- Gestion des repas et des ingrédients
- Planification hebdomadaire collaborative
- Génération automatique de listes de courses
- Système multi-utilisateurs avec authentification

## 🛠️ Installation

### Prérequis
- PHP 8.3+
- Composer
- PostgreSQL
- Node.js & npm

### Backend

```bash
cd backend
composer install
# Configurer le .env avec vos paramètres
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console lexik:jwt:generate-keypair
```

### Frontend (à venir)

```bash
cd frontend
npm install
npm run dev
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📝 License

Ce projet est sous licence MIT. 