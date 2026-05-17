# Backend

Ce backend expose un endpoint HTTP pour telecharger le modpack Minecraft au format `.zip`.

## Prerequis

- Node.js 18 ou plus recent
- npm

## Fichiers utilises

Le script principal est :

- [modpack.js](C:\laragon\www\test\backend\modpack.js)

Le zip genere inclut automatiquement les dossiers suivants s'ils existent dans le dossier `backend` :

- `mods`
- `config`
- `defaultconfigs`

## Installation

Depuis le dossier `backend`, installe les dependances necessaires :

```bash
npm install express archiver
```

## Lancement

Depuis le dossier `backend`, lance le serveur avec :

```bash
node modpack.js
```

Le serveur demarre sur :

```text
http://localhost:3001
```

## Endpoint disponible

- `GET /modpack`

Exemple complet :

```text
http://localhost:3001/modpack
```

Quand tu appelles cette URL, le backend genere et telecharge une archive `modpack.zip`.

La reponse HTTP inclut aussi un header SHA-256 :

```text
X-Modpack-SHA256: <hash>
```

## Verification rapide

1. Ouvre un terminal dans `backend`.
2. Lance `node modpack.js`.
3. Ouvre [http://localhost:3001/modpack](http://localhost:3001/modpack) dans le navigateur.
4. Verifie que le fichier `modpack.zip` se telecharge.

## Remarques

- Le script utilise `process.cwd()`, donc il faut le lancer depuis le dossier `backend`.
- Si un des dossiers `mods`, `config` ou `defaultconfigs` est absent, il est simplement ignore.
