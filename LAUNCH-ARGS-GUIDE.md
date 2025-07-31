# 🔧 Guide d'Authentification via Launch Args

## 📋 Vue d'ensemble

La méthode **`launch-args`** est une nouvelle approche d'authentification qui récupère automatiquement les credentials depuis les arguments de lancement de l'application StableDiffusion. Cette méthode est particulièrement utile quand les identifiants sont configurés dans le champ "Extra Launch Arguments" de l'application.

## 🎯 Problème résolu

- **Authentification automatique** : Plus besoin de saisir manuellement les credentials
- **Configuration centralisée** : Les identifiants sont gérés dans l'application elle-même
- **Compatibilité Gradio** : Fonctionne spécifiquement avec les applications Gradio comme StableDiffusion

## 🚀 Méthodes implémentées

### 1. Méthode `launch-args`

Cette méthode :
1. **Analyse la page** pour détecter la configuration Gradio
2. **Récupère les arguments** de lancement depuis le HTML
3. **Extrait les credentials** depuis la configuration
4. **Applique l'authentification** avec les credentials récupérés

## 📡 Utilisation

### Via API

```bash
# Test direct de la méthode launch-args
curl "http://localhost:8021/api/module-access?module=stablediffusion&method=launch-args"

# Test via PUT avec paramètres
curl -X PUT "http://localhost:8021/api/module-access" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "stablediffusion",
    "method": "launch-args",
    "debug": true
  }'
```

### Via Interface Web

1. Ouvrez : `http://localhost:8021/test-form-injection`
2. Sélectionnez le module "StableDiffusion"
3. Cliquez sur le bouton **"⚙️ Test Launch Args"**

### Via Script Node.js

```bash
# Test complet de la méthode launch-args
node test-launch-args.js
```

## 🔧 Configuration

### Configuration des modules

```typescript
stablediffusion: {
  url: 'https://stablediffusion.regispailler.fr',
  credentials: { username: 'admin', password: 'Rasulova75' },
  type: 'gradio',
  authMethods: ['launch-args', 'gradio-auth', 'gradio-injection', ...],
  launchArgs: {
    usernameArg: '--gradio-auth',
    passwordArg: '--gradio-auth-path',
    authArg: '--auth'
  }
}
```

### Arguments de lancement supportés

- `--gradio-auth` : Spécifie les credentials d'authentification
- `--gradio-auth-path` : Chemin vers le fichier d'authentification
- `--auth` : Argument d'authentification général

## 🧪 Tests et validation

### Test de diagnostic

Le script `test-launch-args.js` effectue :

1. **Analyse de la page** : Recherche des arguments de lancement
2. **Détection Gradio** : Identification de la configuration
3. **Test d'authentification** : Validation avec credentials par défaut
4. **Vérification d'accès** : Confirmation du contenu accessible

### Résultats attendus

```
✅ Page principale accessible (4.5MB)
✅ Configuration Gradio trouvée
🔐 Authentification requise détectée
✅ Authentification avec credentials par défaut réussie
✅ Contenu principal accessible après authentification
```

## 🔍 Détection automatique

### Patterns recherchés

La méthode recherche automatiquement :

```javascript
const launchArgsPatterns = [
  /--gradio-auth\s+([^\s]+)/g,
  /--gradio-auth-path\s+([^\s]+)/g,
  /--auth\s+([^\s]+)/g,
  /gradio_auth\s*=\s*["']([^"']+)["']/g,
  /auth_required\s*:\s*true/g,
  /window\.gradio_config\s*=\s*({[^}]+})/g
];
```

### Configuration Gradio détectée

```json
{
  "auth_required": true,
  "auth_message": null,
  "space_id": null,
  "root": "https://stablediffusion.regispailler.fr"
}
```

## 🛠️ Implémentation technique

### Fonction `getCredentialsFromLaunchArgs`

```typescript
async function getCredentialsFromLaunchArgs(config: any): Promise<{ username: string; password: string } | null> {
  // 1. Tentative de récupération depuis l'API Gradio
  // 2. Analyse du HTML pour les arguments de lancement
  // 3. Fallback vers les credentials par défaut
}
```

### Intégration dans le système

La méthode `launch-args` est intégrée comme **première méthode** dans la chaîne d'authentification :

```typescript
// Méthode 1: Authentification via Launch Arguments
if (method === 'launch-args' || method === 'auto') {
  const launchCredentials = await getCredentialsFromLaunchArgs(config);
  // ... logique d'authentification
}
```

## 🔒 Sécurité

### Gestion des credentials

- **Pas de stockage** : Les credentials ne sont pas persistés
- **Récupération à la demande** : Extraction au moment de l'authentification
- **Fallback sécurisé** : Utilisation des credentials par défaut si nécessaire

### Validation

- **Vérification de la configuration** : Validation de la structure Gradio
- **Test d'authentification** : Confirmation de l'accès
- **Logs de diagnostic** : Traçabilité complète des opérations

## 🚨 Dépannage

### Problèmes courants

1. **Configuration non détectée**
   ```
   ❌ Configuration Gradio non trouvée
   ```
   **Solution** : Vérifier que l'application utilise Gradio

2. **Arguments non trouvés**
   ```
   ❌ Aucun argument de lancement trouvé
   ```
   **Solution** : Vérifier la configuration des arguments de lancement

3. **Authentification échouée**
   ```
   ❌ Authentification échouée: 401
   ```
   **Solution** : Vérifier les credentials dans la configuration

### Logs de debug

Activez le mode debug pour voir les détails :

```bash
curl -X PUT "http://localhost:8021/api/module-access" \
  -H "Content-Type: application/json" \
  -d '{
    "module": "stablediffusion",
    "method": "launch-args",
    "debug": true
  }'
```

## 📈 Améliorations futures

### Fonctionnalités prévues

1. **Lecture de fichiers d'auth** : Support des fichiers de configuration
2. **Cache des credentials** : Optimisation des performances
3. **Support multi-format** : Autres formats de configuration
4. **Validation avancée** : Vérification de la validité des credentials

### Extensions possibles

- Support d'autres frameworks que Gradio
- Intégration avec des systèmes de gestion de secrets
- Support des tokens d'authentification
- Interface de configuration graphique

## 📚 Ressources

- [Guide Gradio Auth](GRADIO-AUTH-GUIDE.md)
- [Guide Bypass Auth](BYPASS-AUTH-GUIDE.md)
- [Script de test](test-launch-args.js)
- [Interface de test](http://localhost:8021/test-form-injection)

---

**Note** : Cette méthode est particulièrement efficace pour les applications StableDiffusion configurées avec des arguments de lancement personnalisés. 