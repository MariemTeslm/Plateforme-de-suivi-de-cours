# PIS3 - Nouvelle Structure du Projet

## Aperçu de la Structure

La nouvelle structure du projet est organisée comme suit :

```
public/
│
├─ app.js                # Point d'entrée du serveur Node.js
├─ package.json          # Dépendances et scripts
├─ .env                  # Variables d'environnement
│
├─ config/
│   └─ db.js             # Configuration MySQL
│
├─ controllers/          # Logique métier
│   ├─ groupControllers.js
│   ├─ studentControllers.js
│   ├─ profControllers.js
│   ├─ authControllers.js
│   └─ ... (autres controllers)
│
├─ models/               # Accès à la base de données
│   ├─ groupModels.js
│   ├─ studentModels.js
│   ├─ profModels.js
│   └─ ... (autres modèles)
│
├─ routes/               # Définition des endpoints API
│   ├─ groupRoutes.js
│   ├─ studentRoutes.js
│   ├─ authRoutes.js
│   └─ ... (autres routes)
│
├─ middleware/           # Middlewares (CORS, validation, auth...)
│   ├─ corsMiddleware.js
│   ├─ validateData.js
│   └─ responseHandler.js
│
└─ views/                # Frontend (HTML/CSS/JS)
    ├─ admin/            # Pages d'administration
    ├─ profs/            # Pages professeurs
    ├─ etudiants/        # Pages étudiants
    └─ assets/
        ├─ css/          # Fichiers CSS
        ├─ js/           # Fichiers JavaScript
        │   ├─ api.js
        │   └─ config.js
        └─ images/       # Images
```

## Étapes de Migration

### 1. **Mettre à jour les imports dans les Controllers**

Les contrôleurs utilisant `../database/db` doivent être mis à jour :

```javascript
// Ancien
const db = require("../database/db");

// Nouveau
const db = require("../config/db");
```

### 2. **Mettre à jour les imports dans les Routes**

```javascript
// Ancien
const controller = require("../controllers/groupControllers");

// Nouveau
const controller = require("../controllers/groupControllers");
// (Reste identique, juste vérifier les chemins relatifs)
```

### 3. **Mettre à jour les imports dans Models**

```javascript
// Ancien
const db = require("../database/db");

// Nouveau
const db = require("../config/db");
```

### 4. **Configuration de l'Environnement**

Assurez-vous que le fichier `.env` contient :

```env
PORT=4000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Session Configuration
SESSION_SECRET=your_session_secret_here
```

## Installation et Démarrage

### Installer les dépendances

```bash
cd public
npm install
```

### Démarrer le serveur

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur sera accessible sur `http://localhost:4000`

## Organisation des Routes

- `/groupes` - Gestion des groupes
- `/profs` - Gestion des professeurs
- `/students` - Gestion des étudiants
- `/auth` - Authentification
- `/semaines` - Gestion des semaines
- `/emploi` - Gestion de l'emploi du temps
- `/seance` - Gestion des séances
- `/api` - Endpoints d'évaluation
- `/etudient-emploi` - Emploi du temps étudiant

## Points Importants

1. **Base de données** : Assurez-vous que MySQL est en cours d'exécution et que la base de données `school_db` est créée.

2. **Fichiers .env** : Configurez les variables d'environnement selon votre système.

3. **CORS** : Les paramètres CORS sont configurés dans `app.js`. Modifiez-les si nécessaire.

4. **Mode développement** : Utilisez `npm run dev` pour bénéficier du rechargement automatique avec nodemon.

## Fichiers à Mettre à Jour dans le Contrôle de Versions

Avant de commiter, assurez-vous de :

1. Mettre à jour tous les chemins d'importation
2. Vérifier que `.env` n'est pas commité (ajouter à `.gitignore`)
3. Tester toutes les routes API
4. Vérifier les appels Frontend vers les routes Backend

## Support des Routes Frontend

Le dossier `views/` est organisé par rôle utilisateur :
- **admin/** : Toutes les pages d'administration
- **profs/** : Tableaux de bord et pages professeurs
- **etudiants/** : Tableaux de bord et pages étudiants
- **assets/** : Fichiers partagés (CSS, JS, images)

## Notes de Sécurité

⚠️ **Avant la production** :
- Changez les secrets JWT et SESSION
- Configurez des mots de passe MySQL forts
- Configurez CORS pour les domaines autorisés
- Utilisez HTTPS en production
- Validez et sanitarisez toutes les entrées utilisateur
