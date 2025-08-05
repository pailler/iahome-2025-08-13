import { supabase } from './supabaseClient';

export interface Menu {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  menu_id: string;
  parent_id: string | null;
  title: string;
  url: string | null;
  page_id: string | null;
  icon: string | null;
  position: number;
  is_active: boolean;
  is_external: boolean;
  target: string;
  requires_auth: boolean;
  roles_allowed: string[] | null;
  created_at: string;
  updated_at: string;
  children?: MenuItem[];
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  is_published: boolean;
  is_homepage: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export class MenuService {
  // Récupérer tous les menus
  static async getMenus(): Promise<Menu[]> {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des menus:', error);
      throw error;
    }

    return data || [];
  }

  // Récupérer un menu par son nom
  static async getMenuByName(name: string): Promise<Menu | null> {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération du menu ${name}:`, error);
      return null;
    }

    return data;
  }

  // Récupérer les éléments d'un menu avec leurs enfants
  static async getMenuItems(menuName: string, userRole?: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        menus!inner(name)
      `)
      .eq('menus.name', menuName)
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) {
      console.error(`Erreur lors de la récupération des éléments du menu ${menuName}:`, error);
      return [];
    }

    if (!data) return [];

    // Filtrer par rôle si nécessaire
    let filteredItems = data;
    if (userRole) {
      filteredItems = data.filter(item => {
        if (!item.requires_auth) return true;
        if (!item.roles_allowed || item.roles_allowed.length === 0) return true;
        return item.roles_allowed.includes(userRole);
      });
    }

    // Organiser en hiérarchie (parents et enfants)
    const itemsMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // Créer un map de tous les éléments
    filteredItems.forEach(item => {
      itemsMap.set(item.id, { ...item, children: [] });
    });

    // Organiser la hiérarchie
    filteredItems.forEach(item => {
      const menuItem = itemsMap.get(item.id)!;
      if (item.parent_id) {
        const parent = itemsMap.get(item.parent_id);
        if (parent) {
          parent.children!.push(menuItem);
        }
      } else {
        rootItems.push(menuItem);
      }
    });

    return rootItems;
  }

  // Créer un nouveau menu
  static async createMenu(menu: Omit<Menu, 'id' | 'created_at' | 'updated_at'>): Promise<Menu> {
    const { data, error } = await supabase
      .from('menus')
      .insert(menu)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du menu:', error);
      throw error;
    }

    return data;
  }

  // Mettre à jour un menu
  static async updateMenu(id: string, updates: Partial<Menu>): Promise<Menu> {
    const { data, error } = await supabase
      .from('menus')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du menu:', error);
      throw error;
    }

    return data;
  }

  // Supprimer un menu
  static async deleteMenu(id: string): Promise<void> {
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression du menu:', error);
      throw error;
    }
  }

  // Créer un nouvel élément de menu
  static async createMenuItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de l\'élément de menu:', error);
      throw error;
    }

    return data;
  }

  // Mettre à jour un élément de menu
  static async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'élément de menu:', error);
      throw error;
    }

    return data;
  }

  // Supprimer un élément de menu
  static async deleteMenuItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de l\'élément de menu:', error);
      throw error;
    }
  }

  // Récupérer toutes les pages
  static async getPages(): Promise<Page[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des pages:', error);
      throw error;
    }

    return data || [];
  }

  // Récupérer une page par son slug
  static async getPageBySlug(slug: string): Promise<Page | null> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération de la page ${slug}:`, error);
      return null;
    }

    return data;
  }

  // Créer une nouvelle page
  static async createPage(page: Omit<Page, 'id' | 'created_at' | 'updated_at'>): Promise<Page> {
    const { data, error } = await supabase
      .from('pages')
      .insert(page)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la page:', error);
      throw error;
    }

    return data;
  }

  // Mettre à jour une page
  static async updatePage(id: string, updates: Partial<Page>): Promise<Page> {
    const { data, error } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la page:', error);
      throw error;
    }

    return data;
  }

  // Supprimer une page
  static async deletePage(id: string): Promise<void> {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de la page:', error);
      throw error;
    }
  }

  // Réorganiser les éléments d'un menu
  static async reorderMenuItems(menuId: string, itemIds: string[]): Promise<void> {
    const updates = itemIds.map((id, index) => ({
      id,
      position: index + 1
    }));

    const { error } = await supabase
      .from('menu_items')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('Erreur lors de la réorganisation des éléments de menu:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des menus
  static async getMenuStats(): Promise<{
    totalMenus: number;
    totalMenuItems: number;
    totalPages: number;
    publishedPages: number;
  }> {
    const [menusResult, menuItemsResult, pagesResult] = await Promise.all([
      supabase.from('menus').select('id', { count: 'exact' }),
      supabase.from('menu_items').select('id', { count: 'exact' }),
      supabase.from('pages').select('id, is_published', { count: 'exact' })
    ]);

    const totalMenus = menusResult.count || 0;
    const totalMenuItems = menuItemsResult.count || 0;
    const totalPages = pagesResult.count || 0;
    const publishedPages = pagesResult.data?.filter(p => p.is_published).length || 0;

    return {
      totalMenus,
      totalMenuItems,
      totalPages,
      publishedPages
    };
  }
} 