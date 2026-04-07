import { TaskStatus } from '../enums/task-status.enum';

export interface TaskSnapshot {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignedToId?: number | null;
}
