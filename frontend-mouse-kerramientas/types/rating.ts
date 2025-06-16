export interface Rating {
  id: number;
  tool_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at?: string;
}

export interface RatingWithUser extends Rating {
  user_username: string;
  user_full_name?: string;
}

export interface RatingWithTool extends Rating {
  tool_name: string;
  tool_brand: string;
  tool_model: string;
}

export interface RatingCreate {
  tool_id: number;
  rating: number;
  comment?: string;
}

export interface RatingUpdate {
  rating?: number;
  comment?: string;
}

export interface RatingStats {
  total_ratings: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
