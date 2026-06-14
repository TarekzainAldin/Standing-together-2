# Backend — Vue d'ensemble

## Informations générales

| Propriété | Valeur |
|---|---|
| Nom du projet | Standing Together |
| Type | API REST SaaS — Gestion collaborative de projets et tâches |
| Runtime | Node.js 20 |
| Framework | Express.js 4.21 |
| Langage | TypeScript 5.9 (strict mode) |
| Base de données | MongoDB 7 via Mongoose 8.17 |
| Authentification | Passport.js (JWT HS256 + Google OAuth 2.0 + Local) |
| Port par défaut | 8000 |
| Chemin de base API | `/api` |

---

## Arborescence du projet

```
backend/
├── src/
│   ├── index.ts                    # Point d'entrée — bootstrap Express
│   ├── @types/
│   │   └── index.d.ts              # Extensions TypeScript globales (req.jwt, Express.User)
│   ├── config/
│   │   ├── app.config.ts           # Centralise toutes les variables d'environnement
│   │   ├── database.config.ts      # Connexion MongoDB via Mongoose
│   │   ├── http.config.ts          # Constantes HTTP (codes de statut)
│   │   └── passport.config.ts      # Stratégies Passport (JWT, Local, Google OAuth)
│   ├── controllers/
│   │   ├── auth.controller.ts      # Register, Login, Google callback, Logout
│   │   ├── member.controller.ts    # Join workspace via invite
│   │   ├── project.controller.ts   # CRUD projets
│   │   ├── report.controller.ts    # Génération rapport Excel
│   │   ├── task.controller.ts      # CRUD tâches
│   │   ├── user.controller.ts      # Profil utilisateur courant
│   │   └── workspace.controller.ts # CRUD workspaces + membres + analytics
│   ├── enums/
│   │   ├── account-provider.enum.ts # GOOGLE, GITHUB, FACEBOOK, EMAIL
│   │   ├── error-code.enum.ts       # Codes d'erreur applicatifs
│   │   ├── role.enum.ts             # Roles (OWNER/ADMIN/MEMBER) + Permissions
│   │   └── task.enum.ts             # TaskStatus + TaskPriority
│   ├── middlewares/
│   │   ├── asyncHandler.middleware.ts    # Wrapper try/catch pour controllers async
│   │   ├── authorize.middleware.ts       # RBAC spécifique aux rapports
│   │   ├── errorHandler.middleware.ts    # Handler d'erreurs global Express
│   │   └── isAuthenticated.middleware.ts # Vérifie req.user._id (non utilisé sur les routes)
│   ├── models/
│   │   ├── account.model.ts        # Fournisseur d'authentification (OAuth/Local)
│   │   ├── member.model.ts         # Appartenance User ↔ Workspace avec rôle
│   │   ├── project.model.ts        # Projets dans un workspace
│   │   ├── roles-permission.model.ts # Rôles RBAC avec permissions
│   │   ├── task.model.ts           # Tâches d'un projet
│   │   ├── user.model.ts           # Utilisateurs avec bcrypt
│   │   └── workspace.model.ts      # Espaces de travail avec code d'invitation
│   ├── routes/
│   │   ├── auth.route.ts           # /api/auth/*
│   │   ├── member.route.ts         # /api/member/*
│   │   ├── project.route.ts        # /api/project/*
│   │   ├── report.route.ts         # /api/reports/*
│   │   ├── task.route.ts           # /api/task/*
│   │   ├── user.route.ts           # /api/user/*
│   │   └── workspace.route.ts      # /api/workspace/*
│   ├── seeders/
│   │   └── role.seeder.ts          # Script de seed des rôles OWNER/ADMIN/MEMBER
│   ├── services/
│   │   ├── auth.service.ts         # Logique métier auth (register, login, OAuth)
│   │   ├── member.service.ts       # Rôle dans workspace, rejoindre via invite
│   │   ├── project.service.ts      # Logique CRUD projets + analytics
│   │   ├── report.service.ts       # Génération Excel (ExcelJS)
│   │   ├── task.service.ts         # Logique CRUD tâches + filtres + pagination
│   │   ├── user.service.ts         # Profil utilisateur courant
│   │   └── workspace.service.ts    # Logique CRUD workspaces + membres + analytics
│   ├── tests/
│   │   ├── auth/
│   │   │   ├── loginOrCreateAccountService.test.ts
│   │   │   └── registerUserService.test.ts
│   │   ├── member/member.service.test.ts
│   │   ├── project/projectService.test.ts
│   │   ├── task/taskService.test.ts
│   │   ├── user/user.service.test.ts
│   │   └── workspace/workspaceService.test.ts
│   ├── utils/
│   │   ├── appError.ts             # Hiérarchie de classes d'erreurs
│   │   ├── bcrypt.ts               # Wrappers hashValue / compareValue
│   │   ├── get-env.ts              # Lecture sécurisée des variables d'environnement
│   │   ├── jwt.ts                  # signJwtToken
│   │   ├── role-permission.ts      # Matrice RBAC RolePermissions
│   │   ├── roleGuard.ts            # Vérification des permissions
│   │   └── uuid.ts                 # Génération codes d'invitation et codes de tâche
│   └── validation/
│       ├── auth.validation.ts       # Zod : registerSchema, loginSchema
│       ├── project.validation.ts    # Zod : createProjectSchema, updateProjectSchema
│       ├── task.validation.ts       # Zod : createTaskSchema, updateTaskSchema
│       └── workspace.valdation.ts   # Zod : createWorkspaceSchema, updateWorkspaceSchema
├── Dockerfile.dev                   # Image Node 20 dev
├── Dockerfile.prod                  # (vide)
├── jest.config.js                   # Configuration Jest + ts-jest
├── package.json
└── tsconfig.json                    # TypeScript strict mode
```

---

## Point d'entrée : `src/index.ts`

```typescript
import "dotenv/config";              // 1. Charge les variables .env
import express from "express";       // 2. Crée l'application Express
import cors from "cors";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import "./config/passport.config";   // 3. Enregistre les stratégies Passport (side effect)
import passport from "passport";
// ... imports des routes

const app = express();
const BASE_PATH = config.BASE_PATH;   // "/api"

app.use(express.json());              // 4. Parse le body JSON
app.use(express.urlencoded({ extended: true })); // 5. Parse les form data
app.use(passport.initialize());       // 6. Init Passport (sans session)
app.use(cors({ origin: config.FRONTEND_ORIGIN, credentials: true, ... })); // 7. CORS restrictif

// 8. Route de santé
app.get("/", (req, res) => res.json({ message: "Hello..." }));

// 9. Montage des routes (toutes sous /api/*)
app.use(`${BASE_PATH}/auth`, authRoutes);           // PUBLIC
app.use(`${BASE_PATH}/user`, passportAuthenticateJWT, userRoutes);
app.use(`${BASE_PATH}/workspace`, passportAuthenticateJWT, workspaceRoutes);
app.use(`${BASE_PATH}/member`, passportAuthenticateJWT, memberRoutes);
app.use(`${BASE_PATH}/project`, passportAuthenticateJWT, projectRoutes);
app.use(`${BASE_PATH}/task`, passportAuthenticateJWT, taskRoutes);
app.use(`${BASE_PATH}/reports`, reportRoutes);      // JWT géré dans la route elle-même

app.use(errorHandler);                // 10. Handler d'erreurs global (toujours en dernier)

// 11. Démarrage du serveur
app.listen(config.PORT, async () => {
  await connectDatabase();            // 12. Connexion MongoDB après listen
});
```

---

## Variables d'environnement (`.env.example`)

| Variable | Description | Requis | Défaut |
|---|---|---|---|
| `NODE_ENV` | Environnement (`development`/`production`) | Non | `development` |
| `PORT` | Port d'écoute du serveur | Non | `8000` |
| `BASE_PATH` | Préfixe de toutes les routes API | Non | `/api` |
| `MONGO_URI` | Chaîne de connexion MongoDB | **Oui** | — |
| `JWT_SECRET` | Clé secrète pour signer les JWT | **Oui** | — |
| `JWT_EXPIRES_IN` | Durée de vie du JWT (ex: `1d`) | Non | `1d` |
| `SESSION_SECRET` | Secret pour cookie-session | **Oui** | — |
| `SESSION_EXPIRES_IN` | Durée de la session | Non | — |
| `GOOGLE_CLIENT_ID` | ID client Google OAuth | **Oui** | — |
| `GOOGLE_CLIENT_SECRET` | Secret client Google OAuth | **Oui** | — |
| `GOOGLE_CALLBACK_URL` | URL de callback Google OAuth | **Oui** | — |
| `GOOGLE_CLIENT_URI` | URI du client Google | **Oui** | — |
| `FRONTEND_ORIGIN` | Origine autorisée par CORS | Non | `http://localhost:5173` |
| `FRONTEND_GOOGLE_CALLBACK_URL` | URL de redirection post-OAuth frontend | **Oui** | — |

---

## Scripts `package.json`

| Script | Commande | Description |
|---|---|---|
| `dev` | `ts-node-dev src/index.ts` | Démarre en mode développement avec hot-reload |
| `build` | `tsc` | Compile TypeScript → JavaScript dans `dist/` |
| `start` | `node dist/index.js` | Démarre la version compilée |
| `test` | `jest` | Lance tous les tests (`**/*.test.ts`) |
| `seed` | `ts-node src/seeders/role.seeder.ts` | Initialise les rôles en base de données |
