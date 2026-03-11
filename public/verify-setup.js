#!/usr/bin/env node

/**
 * Script de vérification de la configuration PIS3
 * Exécutez ceci pour vérifier que tout est corretement configuré
 */

console.log('\n🔍 Vérification de la Configuration PIS3...\n');

// Vérifier les fichiers essentiels
const fs = require('fs');
const path = require('path');

const essentialFiles = [
    'app.js',
    'package.json',
    '.env',
    'config/db.js',
    'controllers/groupControllers.js',
    'models/groupModels.js',
    'routes/groupRoutes.js'
];

let allFilesExist = true;

console.log('📋 Vérification des fichiers essentiels:');
essentialFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${file}`);
    if (!exists) allFilesExist = false;
});

// Vérifier les répertoires
const directories = [
    'config',
    'controllers',
    'models',
    'routes',
    'middleware',
    'views',
    'views/admin',
    'views/profs',
    'views/etudiants',
    'views/assets'
];

console.log('\n📁 Vérification des répertoires:');
directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    const exists = fs.existsSync(dirPath);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${dir}/`);
});

// Vérifier Node modules
console.log('\n📦 Vérification des dépendances:');
try {
    require('express');
    console.log('✅ Express installé');
} catch (err) {
    console.log('❌ Express non trouvé - Exécutez: npm install');
}

try {
    require('mysql2');
    console.log('✅ MySQL2 installé');
} catch (err) {
    console.log('❌ MySQL2 non trouvé - Exécutez: npm install');
}

try {
    require('dotenv');
    console.log('✅ Dotenv installé');
} catch (err) {
    console.log('❌ Dotenv non trouvé - Exécutez: npm install');
}

// Vérifier .env
console.log('\n⚙️  Vérification de .env:');
try {
    require('dotenv').config();
    console.log('✅ Fichier .env chargé');
    console.log(`   - PORT: ${process.env.PORT || '4000'}`);
    console.log(`   - DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   - DB_NAME: ${process.env.DB_NAME || 'school_db'}`);
} catch (err) {
    console.log('⚠️  Fichier .env introuvable - Créez-le à partir de .env.example');
}

console.log('\n' + '='.repeat(50));
if (allFilesExist) {
    console.log('✅ Tout semble être en ordre!');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Exécutez: npm install');
    console.log('   2. Vérifiez votre .env (configuration MySQL)');
    console.log('   3. Démarrez le serveur: npm run dev');
} else {
    console.log('⚠️  Certains fichiers ou répertoires sont manquants!');
    console.log('\n   Veuillez vérifier que la migration est complète.');
}
console.log('='.repeat(50) + '\n');

process.exit(allFilesExist ? 0 : 1);
