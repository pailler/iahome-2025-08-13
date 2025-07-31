# 🎨 Guide : Ajout de la colonne image_url dans Supabase

## ✅ État actuel
- ✅ **YouTube URL supprimée** de la carte SDNext
- ⏳ **Colonne image_url** à ajouter manuellement
- ⏳ **Image SVG** à configurer

## 🔧 Étapes pour ajouter la colonne image_url

### 1. Accéder à Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Ouvrez votre projet : `xemtoyzcihmncbrlsmhr`

### 2. Ouvrir la table cartes
1. Dans le menu de gauche, cliquez sur **"Table Editor"**
2. Sélectionnez la table **"cartes"**
3. Cliquez sur l'onglet **"Schema"**

### 3. Ajouter la colonne image_url
1. Cliquez sur **"Add column"** ou **"+"**
2. Configurez la nouvelle colonne :
   - **Name** : `image_url`
   - **Type** : `text`
   - **Default value** : `null`
   - **Is nullable** : ✅ (coché)
3. Cliquez sur **"Save"**

### 4. Vérifier l'ajout
1. Retournez à l'onglet **"Data"**
2. Vérifiez que la colonne `image_url` apparaît
3. Elle devrait être vide pour toutes les cartes

## 🎨 Configuration de l'image SVG SDNext

### 1. Mettre à jour la carte SDNext
1. Trouvez la carte **"SDnext"** dans la table
2. Cliquez sur **"Edit"** (icône crayon)
3. Dans la colonne `image_url`, entrez : `/images/sdnext-interface.svg`
4. Vérifiez que `youtube_url` est bien `null`
5. Cliquez sur **"Save"**

### 2. Vérifier la configuration
1. La carte SDNext devrait maintenant avoir :
   - `image_url` : `/images/sdnext-interface.svg`
   - `youtube_url` : `null`

## 🚀 Test de l'affichage

### 1. Vérifier l'image SVG
1. Ouvrez votre navigateur
2. Allez sur : `http://localhost:8021/images/sdnext-interface.svg`
3. L'image SVG devrait s'afficher correctement

### 2. Tester sur le site
1. Allez sur : `http://localhost:8021`
2. Trouvez la carte **"SDNext"**
3. Vérifiez que l'image SVG s'affiche au lieu de l'embed YouTube
4. Survolez l'image pour voir l'effet hover

## 📋 Résumé des modifications

### ✅ Fait
- [x] Image SVG créée : `/images/sdnext-interface.svg`
- [x] YouTube URL supprimée de la carte SDNext
- [x] Code modifié pour afficher `image_url` en priorité

### ⏳ À faire manuellement
- [ ] Ajouter la colonne `image_url` dans Supabase
- [ ] Configurer `/images/sdnext-interface.svg` pour la carte SDNext
- [ ] Tester l'affichage sur le site

### 🎯 Résultat attendu
- **Avant** : Embed YouTube dans la carte SDNext
- **Après** : Image SVG moderne avec effet hover

## 🔗 URLs utiles

- **Interface Supabase** : https://supabase.com/dashboard/project/xemtoyzcihmncbrlsmhr
- **Image SVG** : http://localhost:8021/images/sdnext-interface.svg
- **Site principal** : http://localhost:8021

## 💡 Notes importantes

1. **Colonne image_url** : Doit être de type `text` et nullable
2. **Chemin image** : `/images/sdnext-interface.svg` (chemin relatif)
3. **Priorité** : Le code affiche `image_url` en priorité sur `youtube_url`
4. **Effet hover** : Un bouton play rouge apparaît au survol si `youtube_url` existe

## 🆘 En cas de problème

1. **Image ne s'affiche pas** : Vérifiez le chemin `/images/sdnext-interface.svg`
2. **Colonne non trouvée** : Vérifiez que `image_url` est bien ajoutée
3. **Erreur de base de données** : Vérifiez les permissions Supabase
4. **Code non mis à jour** : Redémarrez le serveur Next.js

---

**🎉 Une fois terminé, la carte SDNext affichera une interface moderne au lieu de l'embed YouTube !** 