export interface UserSummaryDto {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

export interface ConnectionDto {
  id: string;
  user: UserSummaryDto;
  connectedUser: UserSummaryDto;
  status: 'pending' | 'accepted' | 'rejected';
  sessionCount: number;
  levelsUnlocked: number;
  isBlocked: boolean;
  isRemoved: boolean;
  createdAt: string;
  updatedAt: string;
}
