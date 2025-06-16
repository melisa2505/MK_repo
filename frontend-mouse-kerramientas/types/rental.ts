export enum RentalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export interface RentalBase {
  start_date: string;
  end_date: string;
  notes?: string;
}

export interface RentalCreate extends RentalBase {
  tool_id: number;
}

export interface RentalUpdate {
  end_date?: string;
  status?: RentalStatus;
  notes?: string;
}

export interface RentalReturn {
  actual_return_date: string;
  notes?: string;
}

export interface Rental extends RentalBase {
  id: number;
  tool_id: number;
  user_id: number;
  actual_return_date?: string;
  total_price: number;
  status: RentalStatus;
  created_at: string;
  updated_at?: string;
}

export interface RentalWithDetails extends Rental {
  tool_name: string;
  tool_brand: string;
  tool_model: string;
  tool_daily_price: number;
  user_username: string;
  user_full_name?: string;
}

export interface RentalStats {
  total_rentals: number;
  active_rentals: number;
  overdue_rentals: number;
  completed_rentals: number;
  total_revenue: number;
}
