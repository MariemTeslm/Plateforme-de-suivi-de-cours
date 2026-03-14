# PIS3 - Nouvelle Structure du Projet

## Aperçu de la Structure

La structure du projet est organisée comme suit :

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

 
Le dossier `views/` est organisé par rôle utilisateur :
- **admin/** : Toutes les pages d'administration
- **profs/** : Tableaux de bord et pages professeurs
- **etudiants/** : Tableaux de bord et pages étudiants
- **assets/** : Fichiers partagés (CSS, JS, images)

 