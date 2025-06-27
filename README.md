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
- **Android Studio**

### Clonage du projet
```bash
git clone https://github.com/ton-repo/Cyna-Frontend.git
cd Cyna-Frontend
```

### Installation des dépendances
```bash
npm install
npm install -g @ionic/cli
```

## Configuration
Créer un fichier `.env` à la racine du projet et ajouter :
```env
API_URL=http://localhost:3000/api
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

### En mode développement (local sur mobile)
```bash
ionic cap open android
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

## Licence
Ce projet est sous licence MIT.
