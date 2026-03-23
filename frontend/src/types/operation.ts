
export interface Operation {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  priority: 'critical' | 'high' | 'medium' | 'low';
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  assignedUsers?: string[];
  tags?: string[];
  color?: string;
  missions?: any[]; // Opcional: lista de misiones asociadas
  createdAt: Date;
  updatedAt: Date;
}