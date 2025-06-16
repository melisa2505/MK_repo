export interface Tool {
  id: number;
  name: string;
  description: string;
  brand: string;
  model: string;
  category: string;
  daily_price: number;
  condition: ToolCondition;
  is_available: boolean;
  image_url?: string;
}

export enum ToolCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export interface SearchFilters {
  q?: string;
  category?: string;
  brand?: string;
  condition?: ToolCondition;
  min_price?: number;
  max_price?: number;
  available?: boolean;
}

export interface FilterOptions {
  categories: string[];
  brands: string[];
  conditions: string[];
  price_range: {
    min: number;
    max: number;
  };
}

export interface SearchParams extends SearchFilters {
  skip?: number;
  limit?: number;
}
