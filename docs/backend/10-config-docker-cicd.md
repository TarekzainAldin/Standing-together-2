# Backend — Configuration, Docker et CI/CD

## Variables d'environnement et fichiers sensibles

| Fichier | Dans le dépôt | Danger | Action requise |
|---|---|---|---|
| `backend/.env.example` | ✅ Oui | 🟢 Aucun | Sert de modèle |
| `.env` (racine) | ✅ Oui | 🔴 CRITIQUE | Devrait être dans `.gitignore` |
| `backend/env.production` | ✅ Oui | 🔴 CRITIQUE | Secrets production exposés |
| `backend/usernameandpassdb` | ✅ Oui | 🔴 CRITIQUE | Credentials MongoDB Atlas en clair |
| `frontend/.env` | ✅ Oui | 🟠 Risque | VITE_API_BASE_URL exposée |
| `frontend/.env.example` | ✅ Oui | 🟢 Aucun | Sert de modèle |

---

## Docker Compose — Développement (`docker-compose.dev.yml`)

**Statut : ✅ FONCTIONNEL**

```yaml
services:
  mongo:
    image: mongo:7                          # ✅ Version épinglée
    container_name: mongo_db
    restart: unless-stopped
    command: ["mongod","--replSet","rs0","--bind_ip_all"]  # ✅ ReplicaSet pour transactions
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db                 # ✅ Persistance des données

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev            # Node 20, npm install, npm run dev
    container_name: backend_dev
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file: .env                          # ✅ Variables depuis racine
    depends_on: [mongo]
    volumes:
      - ./backend:/app                      # ✅ Hot reload
      - /app/node_modules                   # ✅ Préserve node_modules du conteneur

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: frontend_dev
    restart: unless-stopped
    ports:
      - "5173:5173"
    env_file: .env
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on: [backend]

volumes:
  mongo_data:

networks:
  app-network:
    driver: bridge
```

**`docker-compose.override.yml` (variables réseau interne) :**
```yaml
services:
  frontend:
    environment:
      VITE_API_URL: "http://backend:8000"
  backend:
    environment:
      NODE_ENV: development
```

---

## Docker Compose — Production (`docker-compose.prod.yml`)

**Statut : ❌ 100% COMMENTÉ — Non fonctionnel**

Le fichier existe mais contient uniquement des commentaires. Deux configurations différentes sont commentées (version minimale sans MongoDB, version complète avec MongoDB), montrant une évolution non finalisée.

**Recommandation :** Décommenter et adapter :
```yaml
# À décommenter et adapter :
version: "3.9"
services:
  mongo:
    image: mongo:7
    restart: always
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASS}

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    env_file: ./backend/.env.production
    depends_on: [mongo]
    expose: ["8000"]

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "80:80"
    depends_on: [backend]
```

---

## Dockerfiles

### `backend/Dockerfile.dev` — ✅ Fonctionnel

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm","run","dev"]
```

Issues : Pas d'image Alpine (surface d'attaque plus large), pas d'utilisateur non-root.

### `backend/Dockerfile.prod` — ❌ Vide

Le fichier est listé mais son contenu est vide ou absent.

**Recommandation :**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER appuser
EXPOSE 8000
CMD ["node", "dist/index.js"]
```

### `frontend/Dockerfile.prod` — ❌ 100% Commenté

```dockerfile
# FROM node:22-alpine AS build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build
# FROM nginx:stable-alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
```

---

## Nginx

### `nginx/conf.d/frontend.conf` — ✅ Fonctionnel

```nginx
server {
    listen 80;
    server_name basaltsolutions.org www.basaltsolutions.org;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri /index.html;  # ✅ SPA support (React Router)
    }
}
```

### `nginx/conf.d/backend.conf` — ❌ 100% Commenté

La configuration proxy pour `api.basaltsolutions.org → localhost:8000` est commentée. Sans cela, l'API n'est pas accessible depuis l'extérieur via Nginx.

### `frontend/nginx/frontend.conf` (dans le container frontend)

```nginx
server {
    listen 80;
    server_name basaltsolutions.org www.basaltsolutions.org;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri /index.html;
    }
}
```

---

## Pipeline CI/CD (`.github/workflows/deploy.yml`)

**Statut : ✅ FONCTIONNEL** — Se déclenche sur push vers `master`

```yaml
name: Deploy Standing Together Project
on:
  push:
    branches: [master]

jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      # 1. Récupération du code
      - uses: actions/checkout@v3

      # 2. Configuration Node.js 20
      - uses: actions/setup-node@v3
        with: { node-version: 20 }

      # --- BACKEND ---
      # 3. Installation
      - run: npm install
        working-directory: backend

      # 4. Tests (bloquants — si les tests échouent, le déploiement est annulé)
      - run: npm test
        working-directory: backend

      # 5. Build TypeScript → JavaScript
      - run: npm run build
        working-directory: backend

      # --- FRONTEND ---
      # 6. Installation
      - run: npm install
        working-directory: frontend

      # 7. Build Vite
      - run: npm run build
        working-directory: frontend

      # --- DÉPLOIEMENT ---
      # 8. Copie SCP vers VPS
      - uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "."
          target: "/var/www/Standing-together-2"
```

### Secrets GitHub requis
| Secret | Description |
|---|---|
| `VPS_HOST` | IP ou domaine du VPS |
| `VPS_USER` | Utilisateur SSH |
| `VPS_SSH_KEY` | Clé privée SSH |

### Issues du pipeline
1. **Pas de `docker-compose up` sur le VPS** : Les fichiers sont copiés mais les conteneurs ne redémarrent pas automatiquement. Il manque une étape SSH post-déploiement :
```yaml
- name: Restart containers via SSH
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    key: ${{ secrets.VPS_SSH_KEY }}
    script: |
      cd /var/www/Standing-together-2
      docker-compose -f docker-compose.prod.yml down
      docker-compose -f docker-compose.prod.yml up -d --build
```

2. **Pas de tests frontend** dans le pipeline

3. **`no/1deploy.yml`** : Ancien pipeline FTP complètement commenté, vestige à supprimer du dépôt

---

## Flux de déploiement complet (actuel)

```
Developer → git push origin master
                    ↓
        GitHub Actions (ubuntu-latest)
                    ↓
        npm install backend → npm test → npm build
                    ↓
        npm install frontend → npm build
                    ↓
        scp tout le projet → VPS:/var/www/Standing-together-2/
                    ↓
        [MANQUANT] docker-compose up --build
                    ↓
        [MANQUANT] Nginx reload
```
