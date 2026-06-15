#!/bin/bash
set -e

cd /var/www/Standing-together-2

git pull origin master

cd backend
npm install
npm run build
pm2 restart standing-together-backend || pm2 start dist/index.js --name standing-together-backend

cd ../frontend
npm install
VITE_API_BASE_URL=https://basalt-tech.org/api npm run build

echo "Deploy done."
