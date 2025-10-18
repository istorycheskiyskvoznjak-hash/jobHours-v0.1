
export interface WorkLog {
  id: string; // uuid
  date: string; // Stored as 'YYYY-MM-DD'
  hours: number;
  comment?: string;
  user_id: string; // uuid, foreign key to profiles
}

export type UserRole = 'Worker' | 'Supervisor' | 'Administrator';

export interface User {
  id: string; // uuid from auth.users
  username: string;
  firstName?: string;
  lastName?: string;
  hourlyRate: number;
  companyName: string;
  monthlyGoal?: number;
  role: UserRole;
}
