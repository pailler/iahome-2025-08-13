# Bascule entre Stripe et Page de Validation

## 🎯 Objectif

Permettre aux utilisateurs d'être automatiquement redirigés vers la page de validation après un paiement Stripe réussi, créant ainsi un flux unifié entre l'activation gratuite et le paiement.

## 🔄 Flux Unifié

### 1. **Activation Gratuite**
- Utilisateur clique sur "🚀 Activer mes modules"
- Modules ajoutés à `user_applications`
- Tokens créés dans `access_tokens`
- **Redirection** → `/validation?success=true`

### 2. **Paiement Stripe**
- Utilisateur clique sur "💳 Payer avec Stripe"
- Redirection vers Stripe Checkout
- Paiement traité par webhook
- Modules ajoutés à `user_applications`
- Tokens créés dans `access_tokens`
- **Redirection** → `/validation?success=true`

## 🔧 Modifications Apportées

### 1. **Page de Sélections : `/selections`**

**Boutons Disponibles :**
```typescript
// Bouton principal : Activation gratuite
<button onClick={async () => {
  // Activation des modules
  // Redirection vers /validation?success=true
}}>
  🚀 Activer mes modules
</button>

// Bouton secondaire : Paiement Stripe
<StripeCheckout
  items={modules}
  customerEmail={user?.email}
  onSuccess={() => {
    // Nettoyage localStorage
    // Redirection vers /validation?success=true
    router.push('/validation?success=true');
  }}
  onError={(error) => {
    alert(`Erreur de paiement: ${error}`);
  }}
/>
```

### 2. **Webhook Stripe : `/api/webhooks/stripe`**

**Corrections Apportées :**
```typescript
// Avant : Utilisait module_access (table inexistante)
.from('module_access')

// Après : Utilise user_applications (table correcte)
.from('user_applications')

// Création d'accès module
const { data: accessData, error: accessError } = await supabase
  .from('user_applications')
  .insert({
    user_id: user.id,
    module_id: parseInt(moduleId),
    module_title: moduleData.title,
    access_level: 'basic',
    is_active: true,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString()
  })

// Création de token d'accès
const { data: tokenData, error: tokenError } = await supabase
  .from('access_tokens')
  .insert({
    name: `Token ${moduleData.title}`,
    description: `Accès automatique à ${moduleData.title}`,
    module_id: parseInt(moduleId),
    module_name: moduleData.title,
    created_by: user.id,
    access_level: 'basic',
    permissions: ['access'],
    max_usage: 1000,
    current_usage: 0,
    is_active: true,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString()
  })
```

### 3. **Page de Validation : `/validation`**

**Gestion des Paramètres URL :**
```typescript
useEffect(() => {
  // Vérifier le statut depuis les paramètres URL
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  
  if (success) {
    setActivationStatus('success');
  } else if (canceled) {
    setActivationStatus('canceled');
  }
}, [searchParams]);
```

## 📊 Flux Complet

### **Option 1 : Activation Gratuite**
1. **Sélection** → Modules choisis sur la page d'accueil
2. **Sélections** → Page `/selections` avec liste des modules
3. **Activation** → Clic sur "🚀 Activer mes modules"
4. **Traitement** → API `/api/activate-module`
5. **Base de données** → Entrées dans `user_applications` et `access_tokens`
6. **Redirection** → `/validation?success=true`
7. **Confirmation** → Page de validation avec succès

### **Option 2 : Paiement Stripe**
1. **Sélection** → Modules choisis sur la page d'accueil
2. **Sélections** → Page `/selections` avec liste des modules
3. **Paiement** → Clic sur "💳 Payer avec Stripe"
4. **Stripe** → Redirection vers Stripe Checkout
5. **Webhook** → Traitement automatique par `/api/webhooks/stripe`
6. **Base de données** → Entrées dans `user_applications` et `access_tokens`
7. **Redirection** → `/validation?success=true`
8. **Confirmation** → Page de validation avec succès

## 🎨 Interface Utilisateur

### **Page de Sélections**
- **Bouton principal** : "🚀 Activer mes modules" (vert)
- **Bouton secondaire** : "💳 Payer avec Stripe" (bleu)
- **Même résultat** : Redirection vers `/validation`

### **Page de Validation**
- **Design unifié** : Même interface pour les deux options
- **Confirmation** : Message de succès identique
- **Actions** : Liens vers `/encours` et `/`

## 🔒 Sécurité et Cohérence

### **Base de Données Unifiée**
- **Table unique** : `user_applications` pour tous les accès
- **Tokens cohérents** : `access_tokens` pour tous les tokens
- **Durée uniforme** : 1 an pour tous les accès

### **Validation**
- **Vérifications identiques** : Utilisateur, module, doublons
- **Gestion d'erreurs** : Même logique pour les deux options
- **Logs détaillés** : Traçabilité complète

## 📈 Avantages

### **Pour l'Utilisateur**
- ✅ **Expérience unifiée** : Même résultat final
- ✅ **Flexibilité** : Choix entre gratuit et payant
- ✅ **Simplicité** : Une seule page de confirmation

### **Pour l'Administrateur**
- ✅ **Gestion centralisée** : Une seule table pour les accès
- ✅ **Monitoring unifié** : Logs cohérents
- ✅ **Maintenance simplifiée** : Code unifié

### **Pour le Système**
- ✅ **Performance** : Requêtes optimisées
- ✅ **Cohérence** : Données uniformes
- ✅ **Évolutivité** : Facile d'ajouter de nouvelles options

## 🧪 Test de Validation

### **Test Activation Gratuite**
1. Choisir des modules sur la page d'accueil
2. Aller sur `/selections`
3. Cliquer sur "🚀 Activer mes modules"
4. Vérifier la redirection vers `/validation?success=true`
5. Aller sur `/encours` pour voir les modules

### **Test Paiement Stripe**
1. Choisir des modules sur la page d'accueil
2. Aller sur `/selections`
3. Cliquer sur "💳 Payer avec Stripe"
4. Compléter le paiement sur Stripe
5. Vérifier la redirection vers `/validation?success=true`
6. Aller sur `/encours` pour voir les modules

## 📝 Notes Techniques

### **URLs de Redirection**
- **Succès** : `/validation?success=true`
- **Annulation** : `/validation?canceled=true`
- **Erreur** : Reste sur `/selections` avec message d'erreur

### **Gestion des États**
- **localStorage** : Nettoyé après activation/paiement
- **Session** : Maintien de l'authentification
- **Cache** : Pas d'impact sur les performances

### **Compatibilité**
- **Navigateurs** : Support complet
- **Mobiles** : Interface responsive
- **Accessibilité** : Standards respectés
