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
npm run build

echo "Deploy done."
