import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { postId, title, content, scheduledAt, publishNow } = await request.json();

    // Récupérer la configuration LinkedIn
    const { data: config, error: configError } = await supabase
      .from('linkedin_config')
      .select('*')
      .single();

    if (configError || !config?.access_token) {
      return NextResponse.json(
        { error: 'Configuration LinkedIn manquante' },
        { status: 400 }
      );
    }

    // Préparer le post LinkedIn
    const linkedinPost = {
      author: `urn:li:organization:${config.company_id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // Publier sur LinkedIn
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(linkedinPost)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur LinkedIn API:', errorData);
      
      // Mettre à jour le statut du post
      await supabase
        .from('linkedin_posts')
        .update({ status: 'failed' })
        .eq('id', postId);

      return NextResponse.json(
        { error: 'Erreur lors de la publication sur LinkedIn' },
        { status: 500 }
      );
    }

    const result = await response.json();
    const linkedinPostId = result.id;

    // Mettre à jour le post dans la base de données
    const updateData: any = {
      linkedin_post_id: linkedinPostId,
      status: publishNow ? 'published' : 'scheduled'
    };

    if (publishNow) {
      updateData.published_at = new Date().toISOString();
    }

    await supabase
      .from('linkedin_posts')
      .update(updateData)
      .eq('id', postId);

    return NextResponse.json({
      success: true,
      linkedinPostId,
      message: publishNow ? 'Post publié avec succès' : 'Post programmé avec succès'
    });

  } catch (error) {
    console.error('Erreur publication LinkedIn:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
