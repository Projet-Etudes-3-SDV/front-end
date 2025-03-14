# Cyna Frontend

## Description
Cyna Frontend est une application développée en **Angular** avec **Ionic**, permettant une expérience utilisateur fluide sur le web et mobile. Ce projet intègre des fonctionnalités avancées telles que la gestion d’état via des services Angular, la communication avec un backend Express et la prise en charge des fonctionnalités natives grâce à Capacitor.

Pour plus d'information sur les choix techniques: [Lien vers l'ADR](https://docs.google.com/document/d/1OJUJT8L6kMOkODMvTOcP804j4Fnr7aTYvJ7xJxkM40U/edit?usp=sharing)

## Fonctionnalités
- **Interface utilisateur dynamique et réactive**
- **Compatible web et mobile** grâce à Ionic
- **Gestion d’état avec les services Angular**
- **Intégration d’API REST avec HttpClient**
- **Support des fonctionnalités natives avec Capacitor**
- **Tests unitaires avec Karma et Jasmine**

## Installation

### Prérequis
- **Node.js** (>= 16)
- **Angular CLI** (>= 15)
- **Ionic CLI** (>= 7)
- **Capacitor**
- **Git**

### Clonage du projet
```bash
git clone https://github.com/ton-repo/Cyna-Frontend.git
cd Cyna-Frontend
```

### Installation des dépendances
```bash
npm install
```

## Configuration
Créer un fichier `.env` à la racine du projet et ajouter :
```env
API_URL=https://api.cyna.com
```

## Démarrage de l'application

### En mode développement (serveur local)
```bash
ionic serve
```

### Pour générer une application mobile (Android/iOS)
```bash
ionic build
npx cap add android  # Pour Android
npx cap add ios      # Pour iOS
npx cap sync         # Synchronisation Capacitor
```

## Structure du projet
```
/src
│── app/               # Composants et services principaux
│── assets/            # Fichiers statiques et images
│── environments/      # Fichiers de configuration selon l’environnement
│── theme/             # Styles globaux de l’application
│── main.ts            # Point d’entrée de l’application
│── index.html         # Fichier principal HTML
```

## Commandes utiles
- **Lancer les tests unitaires** :
```bash
ng test
```
- **Générer un composant** :
```bash
ng generate component nom-du-composant
```
- **Générer un service** :
```bash
ng generate service nom-du-service
```

## Contribuer
Les contributions sont les bienvenues !
1. **Fork** le projet
2. **Créer une branche** (`feature/ma-nouvelle-feature`)
3. **Commit** (`git commit -m 'Ajout d'une nouvelle feature'`)
4. **Push** (`git push origin feature/ma-nouvelle-feature`)
5. **Faire une Pull Request**

## Licence
Ce projet est sous licence MIT.
