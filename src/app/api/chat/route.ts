import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationHistory } = await request.json();

    // Vérification de l'authentification
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Logique de réponse IA
    const response = await generateAIResponse(message, conversationHistory);

    // Sauvegarder la conversation dans la base de données
    await saveConversation(userId, message, response);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Erreur chat API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

async function generateAIResponse(message: string, conversationHistory: any[]) {
  try {
    // Configuration OpenAI
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      // Fallback vers la logique simple si pas de clé API
      return await generateSimpleResponse(message);
    }

    // Récupérer les données contextuelles depuis la base de données
    const contextData = await getContextData(message);

    // Préparer l'historique des conversations pour le contexte
    const messages = [
      {
        role: 'system',
        content: `Tu es un assistant IA spécialisé dans l'aide aux utilisateurs de la plateforme IAhome. 
        
        IAhome est une plateforme qui propose des modules d'intelligence artificielle :
        - Génération d'images avec Stable Diffusion
        - Traitement de texte et analyse
        - Outils de productivité IA
        - Modules personnalisés selon les abonnements
        
        Tu as accès aux informations suivantes sur la plateforme :
        
        ARTICLES DE BLOG DISPONIBLES :
        ${contextData.blogArticles}
        
        MODULES IA DISPONIBLES :
        ${contextData.modules}
        
        Tu dois :
        1. Aider les utilisateurs avec leurs questions sur les modules IA
        2. Fournir des informations précises sur les articles de blog
        3. Expliquer les fonctionnalités des modules disponibles
        4. Fournir un support technique de base
        5. Répondre en français de manière professionnelle et amicale
        6. Utiliser les données réelles de la plateforme pour tes réponses
        
        Réponds de manière concise et utile en te basant sur les vraies données de IAhome.`
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu traiter votre demande.';
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    // Fallback vers la logique simple en cas d'erreur
    return await generateSimpleResponse(message);
  }
}

async function getContextData(message: string) {
  const lowerMessage = message.toLowerCase();
  let blogArticles = '';
  let modules = '';

  try {
    // Récupérer les articles de blog si la question concerne le blog
    if (lowerMessage.includes('blog') || lowerMessage.includes('article') || lowerMessage.includes('publication') || 
        lowerMessage.includes('contenu') || lowerMessage.includes('lire') || lowerMessage.includes('tutoriel')) {
      
      const { data: articles, error: articlesError } = await supabase
        .from('blog_articles')
        .select('title, content, category, is_published')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!articlesError && articles && articles.length > 0) {
        blogArticles = articles.map(article => 
          `- ${article.title} (${article.category}): ${article.content.substring(0, 200)}...`
        ).join('\n');
      }
    }

    // Récupérer les modules si la question concerne les modules
    if (lowerMessage.includes('module') || lowerMessage.includes('application') || lowerMessage.includes('app') ||
        lowerMessage.includes('outil') || lowerMessage.includes('fonctionnalité') || lowerMessage.includes('ia') ||
        lowerMessage.includes('stable diffusion') || lowerMessage.includes('génération') || lowerMessage.includes('prix')) {
      
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('title, description, category, price')
        .order('title', { ascending: true });

      if (!modulesError && modulesData && modulesData.length > 0) {
        modules = modulesData.map(module => 
          `- ${module.title} (${module.category}, ${module.price}€): ${module.description}`
        ).join('\n');
      }
    }

         // Si aucune donnée spécifique n'est demandée, récupérer un aperçu général
     if (!blogArticles && !modules) {
       const { data: generalModules, error: generalModulesError } = await supabase
         .from('modules')
         .select('title, category, price');

      if (!generalModulesError && generalModules) {
        modules = generalModules.map(module => 
          `- ${module.title} (${module.category}, ${module.price}€)`
        ).join('\n');
      }
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des données contextuelles:', error);
  }

  return {
    blogArticles: blogArticles || 'Aucun article de blog disponible pour le moment.',
    modules: modules || 'Aucun module disponible pour le moment.'
  };
}

async function generateSimpleResponse(message: string) {
  // Logique de réponse simple basée sur les mots-clés (fallback)
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
    return "Bonjour ! Je suis votre assistant IA pour IAhome. Comment puis-je vous aider aujourd'hui ?";
  }
  
  if (lowerMessage.includes('aide') || lowerMessage.includes('support') || lowerMessage.includes('problème')) {
    return "Je suis là pour vous aider ! Pouvez-vous me décrire plus précisément votre problème ?";
  }
  
  if (lowerMessage.includes('module') || lowerMessage.includes('application') || lowerMessage.includes('app')) {
    try {
             const { data: modules, error } = await supabase
         .from('modules')
         .select('title, category, price');
      
      if (!error && modules && modules.length > 0) {
        const modulesList = modules.map(m => `${m.title} (${m.price}€)`).join(', ');
        return `Nos modules IA disponibles incluent : ${modulesList}. Vous pouvez les trouver dans la section 'Mes applis' de votre tableau de bord.`;
      }
    } catch (error) {
      console.error('Erreur récupération modules:', error);
    }
    return "Nos modules IA sont disponibles dans la section 'Mes applis' de votre tableau de bord.";
  }
  
  if (lowerMessage.includes('prix') || lowerMessage.includes('tarif') || lowerMessage.includes('coût')) {
    try {
             const { data: modules, error } = await supabase
         .from('modules')
         .select('title, price')
         .order('price', { ascending: true });
      
      if (!error && modules && modules.length > 0) {
        const priceRange = `de ${modules[0].price}€ à ${modules[modules.length - 1].price}€`;
        return `Nos tarifs varient ${priceRange} selon les modules. Vous pouvez consulter les détails dans votre espace personnel.`;
      }
    } catch (error) {
      console.error('Erreur récupération prix:', error);
    }
    return "Nos tarifs varient selon les modules. Vous pouvez consulter les détails dans votre espace personnel.";
  }
  
  if (lowerMessage.includes('blog') || lowerMessage.includes('article') || lowerMessage.includes('publication')) {
    try {
      const { data: articles, error } = await supabase
        .from('blog_articles')
        .select('title, category')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (!error && articles && articles.length > 0) {
        const articlesList = articles.map(a => a.title).join(', ');
        return `Nos derniers articles de blog incluent : ${articlesList}. Vous pouvez les consulter dans la section Blog du site.`;
      }
    } catch (error) {
      console.error('Erreur récupération articles:', error);
    }
    return "Nous avons des articles de blog intéressants sur l'IA et nos modules. Consultez la section Blog du site.";
  }
  
  if (lowerMessage.includes('technique') || lowerMessage.includes('bug') || lowerMessage.includes('erreur')) {
    return "Pour les problèmes techniques, vérifiez votre connexion et actualisez la page. Si le problème persiste, contactez notre support.";
  }
  
  return "Merci pour votre message. Je peux vous aider avec les modules IA, le support technique, les articles de blog, ou toute question sur IAhome.";
}

async function saveConversation(userId: string, userMessage: string, aiResponse: string) {
  try {
    const { error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        user_message: userMessage,
        ai_response: aiResponse,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur sauvegarde conversation:', error);
    }
  } catch (error) {
    console.error('Erreur sauvegarde conversation:', error);
  }
} 