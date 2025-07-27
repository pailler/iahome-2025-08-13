# Guide de Configuration Resend pour les Notifications Stripe

## 🚀 Configuration Resend

### 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre domaine ou utilisez le domaine par défaut de Resend

### 2. Obtenir votre clé API

1. Dans le dashboard Resend, allez dans "API Keys"
2. Créez une nouvelle clé API
3. Copiez la clé qui commence par `re_`

### 3. Configurer les variables d'environnement

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Email Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_votre_cle_api_resend
RESEND_FROM_EMAIL=noreply@votre-domaine.com
NEXT_PUBLIC_APP_URL=http://localhost:8021

# Stripe Webhook (si pas déjà configuré)
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
```

### 4. Vérifier votre domaine (optionnel mais recommandé)

1. Dans Resend, allez dans "Domains"
2. Ajoutez votre domaine (ex: `iahome.com`)
3. Suivez les instructions DNS pour vérifier le domaine
4. Une fois vérifié, utilisez `noreply@votre-domaine.com` comme `RESEND_FROM_EMAIL`

## 📧 Types d'emails configurés

### ✅ Confirmation de paiement
- **Déclencheur** : `checkout.session.completed`, `payment_intent.succeeded`
- **Contenu** : Détails de la transaction, montant, articles achetés
- **Design** : Template moderne avec gradient bleu

### ✅ Confirmation d'abonnement
- **Déclencheur** : `invoice.payment_succeeded`
- **Contenu** : Détails de l'abonnement, période, fonctionnalités premium
- **Design** : Template vert avec liste des avantages premium

### ❌ Échec de paiement
- **Déclencheur** : `payment_intent.payment_failed`, `invoice.payment_failed`
- **Contenu** : Détails de l'erreur, conseils de résolution
- **Design** : Template rouge avec suggestions d'aide

### 📋 Annulation d'abonnement
- **Déclencheur** : `customer.subscription.deleted`
- **Contenu** : Information sur la fin d'abonnement, lien de réactivation
- **Design** : Template orange avec options de réactivation

## 🔧 Configuration Stripe Webhook

### 1. Créer le webhook dans Stripe

1. Allez dans le dashboard Stripe
2. Webhooks > Add endpoint
3. URL : `https://votre-domaine.com/api/webhooks/stripe`
4. Événements à écouter :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

### 2. Récupérer le secret webhook

1. Après création, copiez le "Signing secret"
2. Ajoutez-le à `STRIPE_WEBHOOK_SECRET` dans vos variables d'environnement

## 🧪 Test de la configuration

### 1. Test local avec Stripe CLI

```bash
# Installer Stripe CLI
# Puis lancer :
stripe listen --forward-to localhost:8021/api/webhooks/stripe
```

### 2. Test des emails

Créez une page de test temporaire :

```typescript
// pages/test-email.tsx
export default function TestEmail() {
  const testEmail = async () => {
    await fetch('/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
  };

  return (
    <div>
      <button onClick={testEmail}>Test Email</button>
    </div>
  );
}
```

## 📊 Monitoring et logs

### Logs automatiques

Le système log automatiquement :
- ✅ Envoi réussi d'emails
- ❌ Erreurs d'envoi
- 📧 Détails des emails envoyés (destinataire, ID Resend)

### Dashboard Resend

Consultez le dashboard Resend pour :
- 📈 Statistiques d'envoi
- 📊 Taux de livraison
- 🚫 Emails rejetés
- 📋 Logs détaillés

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais exposer les clés API** dans le code client
2. **Utiliser des variables d'environnement** pour toutes les clés
3. **Vérifier les signatures Stripe** (déjà implémenté)
4. **Limiter les permissions** des clés API
5. **Monitorer les logs** pour détecter les abus

### Variables sensibles

```env
# À ne jamais commiter dans Git
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🚨 Dépannage

### Problèmes courants

1. **Email non reçu**
   - Vérifiez les logs Resend
   - Contrôlez le spam
   - Vérifiez l'adresse d'expédition

2. **Erreur d'authentification**
   - Vérifiez `RESEND_API_KEY`
   - Assurez-vous que la clé est valide

3. **Webhook non reçu**
   - Vérifiez `STRIPE_WEBHOOK_SECRET`
   - Testez avec Stripe CLI
   - Vérifiez l'URL du webhook

4. **Template d'email cassé**
   - Vérifiez la syntaxe HTML
   - Testez avec un email simple d'abord

### Commandes utiles

```bash
# Vérifier les variables d'environnement
echo $RESEND_API_KEY

# Tester la connexion Resend
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@example.com","to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

## 📈 Optimisation

### Performance

1. **Envoi asynchrone** : Les emails sont envoyés de manière asynchrone
2. **Gestion d'erreurs** : Retry automatique en cas d'échec
3. **Logs détaillés** : Suivi complet des envois

### Coûts

- **Resend** : 100 emails/jour gratuit, puis $0.80/1000 emails
- **Stripe** : Pas de coût supplémentaire pour les webhooks

## 🎯 Prochaines étapes

1. **Configurer Resend** avec vos vraies clés
2. **Tester les webhooks** avec Stripe CLI
3. **Vérifier les emails** dans différents clients
4. **Monitorer les performances** dans le dashboard Resend
5. **Personnaliser les templates** selon votre branding 

---

## ** Option 1 : API Externe (Recommandée)**

### **Avantages :**
- **Sécurité maximale** : L'API de validation reste sur ton serveur principal
- **Pas de modification** de l'application Docker
- **Facilité de maintenance** : Un seul point de validation
- **Scalabilité** : Fonctionne pour tous tes modules

### **Architecture :**
```
Application Docker → API externe (home.regispailler.fr) → Supabase → Réponse
```

### **Implémentation :**

**1. Créer l'API de validation sur ton serveur principal :**

```typescript
// src/app/api/validate-magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const userId = searchParams.get('user');
    const moduleName = searchParams.get('module');

    if (!token || !userId || !moduleName) {
      return NextResponse.json(
        { valid: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Vérifier le magic link dans Supabase
    const { data, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .eq('user_id', userId)
      .eq('module_name', moduleName)
      .eq('is_used', false)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { valid: false, error: 'Lien invalide ou expiré' },
        { status: 400 }
      );
    }

    // Vérifier l'expiration
    const expiresAt = new Date(data.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Lien expiré' },
        { status: 400 }
      );
    }

    // Marquer comme utilisé
    await supabase
      .from('magic_links')
      .update({ is_used: true })
      .eq('token', token);

    return NextResponse.json({
      valid: true,
      message: 'Accès validé',
      user: userId,
      module: moduleName
    });

  } catch (error) {
    console.error('Erreur validation magic link:', error);
    return NextResponse.json(
      { valid: false, error: 'Erreur interne' },
      { status: 500 }
    );
  }
}
```

**2. Dans ton application Docker, ajouter la validation :**

```javascript
// Dans ton app Docker (Node.js, Python, PHP, etc.)
async function validateAccess(token, userId, moduleName) {
  try {
    const response = await fetch('https://home.regispailler.fr/api/validate-magic-link', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Ajouter les paramètres dans l'URL
    });

    const data = await response.json();
    
    if (data.valid) {
      // Accès accordé
      return { success: true, user: data.user, module: data.module };
    } else {
      // Accès refusé
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Erreur validation:', error);
    return { success: false, error: 'Erreur de connexion' };
  }
}

// Utilisation dans ton app
app.get('/access', async (req, res) => {
  const { token, user } = req.query;
  
  const validation = await validateAccess(token, user, 'IAmetube');
  
  if (validation.success) {
    // Afficher le contenu du module
    res.render('module', { user: validation.user });
  } else {
    // Afficher page d'erreur
    res.render('error', { error: validation.error });
  }
});
```

---

## ** Option 2 : Base de Données Partagée**

### **Si tu veux que l'app Docker accède directement à Supabase :**

**1. Ajouter les variables d'environnement dans ton Docker :**

```yaml
# docker-compose.yml
version: '3.8'
services:
  metube:
    image: ton-app-image
    environment:
      - SUPABASE_URL=https://ton-projet.supabase.co
      - SUPABASE_ANON_KEY=ton-clé-anon
      - SUPABASE_SERVICE_KEY=ton-clé-service  # Pour les opérations admin
    ports:
      - "3000:3000"
```

**2. Code de validation dans l'app Docker :**

```javascript
// Dans ton app Docker
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function validateMagicLink(token, userId, moduleName) {
  try {
    const { data, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .eq('user_id', userId)
      .eq('module_name', moduleName)
      .eq('is_used', false)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Lien invalide' };
    }

    // Vérifier expiration
    if (new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'Lien expiré' };
    }

    // Marquer comme utilisé
    await supabase
      .from('magic_links')
      .update({ is_used: true })
      .eq('token', token);

    return { valid: true, user: userId, module: moduleName };
  } catch (error) {
    return { valid: false, error: 'Erreur interne' };
  }
}
```

---

## ** Option 3 : Stack Docker Compose (Si tu veux tout containeriser)**

### **Architecture complète :**

```yaml
# docker-compose.yml
version: '3.8'
services:
  # Ton app principale (home.regispailler.fr)
  iahome:
    build: .
    ports:
      - "8021:8021"
    environment:
      - DATABASE_URL=postgresql://...
      - SUPABASE_URL=...
      - SUPABASE_ANON_KEY=...
    volumes:
      - .:/app
      - /app/node_modules

  # Ton app Docker (metube.regispailler.fr)
  metube:
    image: ton-app-metube
    ports:
      - "3000:3000"
    environment:
      - API_VALIDATION_URL=http://iahome:8021/api/validate-magic-link
    depends_on:
      - iahome

  # Base de données partagée (optionnel)
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=iahome
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## ** Recommandation : Option 1 (API Externe)**

### **Pourquoi c'est la meilleure approche :**

1. **Sécurité** : L'API de validation reste centralisée
2. **Simplicité** : Pas besoin de modifier ton app Docker existante
3. **Flexibilité** : Fonctionne avec n'importe quelle technologie
4. **Maintenance** : Un seul point de gestion des accès

### **Flux complet :**

1. **Utilisateur achète "IAmetube"** → Webhook Stripe
2. **Magic link généré** → Email envoyé avec lien vers `https://metube.regispailler.fr?token=...&user=...`
3. **Utilisateur clique** → Ton app Docker appelle `https://home.regispailler.fr/api/validate-magic-link`
4. **Validation** → Accès accordé ou refusé

---

## ** Test Rapide :**

**1. Créer un magic link de test :**
```bash
<code_block_to_apply_changes_from>
```

**2. Tester la validation :**
```bash
curl "https://home.regispailler.fr/api/validate-magic-link?token=TOKEN&user=test-user&module=IAmetube"
```

---

**Quelle option préfères-tu ?** 
- **Option 1** (API externe) : Plus simple, plus sécurisée
- **Option 2** (DB partagée) : Plus rapide, mais nécessite plus de config
- **Option 3** (Stack complète) : Si tu veux tout containeriser

Dis-moi ta préférence et je te fournis le code complet !