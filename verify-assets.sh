#!/bin/bash
# Vérification des liens d'assets CSS, JS et images
# Ce script vérifie que tous les chemins vers les ressources sont corrects

echo "🔍 Vérification des liens d'assets..."
echo ""

# Vérifier les fichiers CSS
echo "📄 Vérification des liens CSS :"
grep -r "href.*assets/css" public/views --include="*.html" | head -20
echo ""

# Vérifier les fichiers JS
echo "📄 Vérification des liens JS :"
grep -r "src.*assets/js" public/views --include="*.html" | head -20
echo ""

# Vérifier les logos
echo "📄 Vérification des logos :"
grep -r "src.*assets/images/logo" public/views --include="*.html" | head -20
echo ""

# Vérifier les chemins incorrects (../../assets)
echo "⚠️  Vérification des chemins INCORRECTS (../../assets) :"
grep -r "\.\./\.\./assets" public/views --include="*.html"

if [ $? -eq 0 ]; then
    echo "❌ Des chemins incorrects ont été trouvés. Ils doivent être corrigés."
else
    echo "✅ Aucun chemin incorrect trouvé."
fi

echo ""
echo "✅ Vérification terminée."
