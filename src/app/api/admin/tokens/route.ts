import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@iahome/utils/supabaseClient';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production';

interface TokenConfig {
  id?: string;
  name: string;
  description: string;
  moduleId: string;
  moduleName: string;
  userId?: string;
  userEmail?: string;
  accessLevel: 'basic' | 'premium' | 'admin';
  expirationHours: number;
  permissions: string[];
  isActive: boolean;
  maxUsage?: number;
  currentUsage?: number;
  createdAt?: string;
  expiresAt?: string;
}

// GET - Récupérer tous les tokens
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - Droits administrateur requis' },
        { status: 403 }
      );
    }

    // Récupérer les tokens depuis la base de données
    const { data: tokens, error: tokensError } = await supabase
      .from('access_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (tokensError) {
      console.error('Erreur récupération tokens:', tokensError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tokens' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tokens: tokens || []
    });

  } catch (error) {
    console.error('Erreur GET tokens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau token
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - Droits administrateur requis' },
        { status: 403 }
      );
    }

    const tokenData: TokenConfig = await request.json();
    
    // Validation des données
    if (!tokenData.name || !tokenData.moduleId) {
      return NextResponse.json(
        { error: 'Nom et moduleId requis' },
        { status: 400 }
      );
    }

    // Vérifier que le module existe
    const { data: module } = await supabase
      .from('modules')
      .select('title')
      .eq('id', tokenData.moduleId)
      .single();

    if (!module) {
      return NextResponse.json(
        { error: 'Module non trouvé' },
        { status: 404 }
      );
    }

    // Générer le token JWT
    const payload = {
      tokenId: `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      name: tokenData.name,
      description: tokenData.description,
      moduleId: tokenData.moduleId,
      moduleName: module.title,
      accessLevel: tokenData.accessLevel || 'premium',
      permissions: tokenData.permissions || ['read', 'access'],
      maxUsage: tokenData.maxUsage,
      issuedAt: Date.now(),
      expiresAt: Date.now() + (tokenData.expirationHours * 60 * 60 * 1000)
    };

    const jwtToken = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: `${tokenData.expirationHours}h` 
    });

    // Sauvegarder le token dans la base de données
    const tokenRecord = {
      id: payload.tokenId,
      name: tokenData.name,
      description: tokenData.description,
      module_id: tokenData.moduleId,
      module_name: module.title,
      access_level: tokenData.accessLevel,
      permissions: tokenData.permissions,
      max_usage: tokenData.maxUsage,
      current_usage: 0,
      is_active: tokenData.isActive !== false,
      created_by: user.id,
      created_at: new Date().toISOString(),
      expires_at: new Date(payload.expiresAt).toISOString(),
      jwt_token: jwtToken
    };

    const { data: savedToken, error: saveError } = await supabase
      .from('access_tokens')
      .insert([tokenRecord])
      .select()
      .single();

    if (saveError) {
      console.error('Erreur sauvegarde token:', saveError);
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde du token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      token: {
        id: savedToken.id,
        name: savedToken.name,
        description: savedToken.description,
        moduleId: savedToken.module_id,
        moduleName: savedToken.module_name,
        accessLevel: savedToken.access_level,
        permissions: savedToken.permissions,
        maxUsage: savedToken.max_usage,
        currentUsage: savedToken.current_usage,
        isActive: savedToken.is_active,
        createdAt: savedToken.created_at,
        expiresAt: savedToken.expires_at,
        jwtToken: savedToken.jwt_token
      }
    });

  } catch (error) {
    console.error('Erreur POST token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un token
export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - Droits administrateur requis' },
        { status: 403 }
      );
    }

    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du token requis' },
        { status: 400 }
      );
    }

    // Vérifier que le token existe
    const { data: existingToken } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingToken) {
      return NextResponse.json(
        { error: 'Token non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateFields: any = {};
    
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.accessLevel !== undefined) updateFields.access_level = updateData.accessLevel;
    if (updateData.permissions !== undefined) updateFields.permissions = updateData.permissions;
    if (updateData.maxUsage !== undefined) updateFields.max_usage = updateData.maxUsage;
    if (updateData.isActive !== undefined) updateFields.is_active = updateData.isActive;
    
    // Si la durée d'expiration a changé, recalculer
    if (updateData.expirationHours !== undefined) {
      const newExpiresAt = new Date(Date.now() + (updateData.expirationHours * 60 * 60 * 1000));
      updateFields.expires_at = newExpiresAt.toISOString();
      
      // Régénérer le JWT avec la nouvelle expiration
      const payload = {
        tokenId: existingToken.id,
        name: updateData.name || existingToken.name,
        description: updateData.description || existingToken.description,
        moduleId: existingToken.module_id,
        moduleName: existingToken.module_name,
        accessLevel: updateData.accessLevel || existingToken.access_level,
        permissions: updateData.permissions || existingToken.permissions,
        maxUsage: updateData.maxUsage || existingToken.max_usage,
        issuedAt: Date.now(),
        expiresAt: newExpiresAt.getTime()
      };

      const newJwtToken = jwt.sign(payload, JWT_SECRET, { 
        expiresIn: `${updateData.expirationHours}h` 
      });
      
      updateFields.jwt_token = newJwtToken;
    }

    // Mettre à jour le token
    const { data: updatedToken, error: updateError } = await supabase
      .from('access_tokens')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur mise à jour token:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      token: {
        id: updatedToken.id,
        name: updatedToken.name,
        description: updatedToken.description,
        moduleId: updatedToken.module_id,
        moduleName: updatedToken.module_name,
        accessLevel: updatedToken.access_level,
        permissions: updatedToken.permissions,
        maxUsage: updatedToken.max_usage,
        currentUsage: updatedToken.current_usage,
        isActive: updatedToken.is_active,
        createdAt: updatedToken.created_at,
        expiresAt: updatedToken.expires_at
      }
    });

  } catch (error) {
    console.error('Erreur PUT token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un token
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le rôle admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - Droits administrateur requis' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('id');
    
    if (!tokenId) {
      return NextResponse.json(
        { error: 'ID du token requis' },
        { status: 400 }
      );
    }

    // Supprimer le token
    const { error: deleteError } = await supabase
      .from('access_tokens')
      .delete()
      .eq('id', tokenId);

    if (deleteError) {
      console.error('Erreur suppression token:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur DELETE token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 