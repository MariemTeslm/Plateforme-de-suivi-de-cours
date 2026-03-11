# utiliser Node.js
FROM node:18

# dossier de travail dans le container
WORKDIR /app

# copier package.json
COPY package*.json ./

# installer les dependances
RUN npm install

# copier tout le projet
COPY . .

# port du serveur
EXPOSE 4000

# lancer l'application
CMD ["node", "app.js"]