export type Role = "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> extends PaginationMeta {
  items: T[];
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResult {
  user: UserDTO;
  token: string;
}

export interface ChartPoint {
  name: string;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface StatsResult {
  totalResponses: number;
  averageAge: number;
  responsesToday: number;
  topUniversity: string;
  educationLevel: ChartPoint[];
  gender: ChartPoint[];
  skillLevel: ChartPoint[];
  submissionsPerDay: TrendPoint[];
  interestedFields: ChartPoint[];
}
