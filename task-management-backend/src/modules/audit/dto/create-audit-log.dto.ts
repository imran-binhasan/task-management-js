import { AuditAction } from 'src/common/enums/audit-action.enum';
import { TaskSnapshot } from 'src/common/interface/task-snapshot.interface';

export class CreateAuditLogDto {
  actorId!: number;
  actorName?: string | null;
  action!: AuditAction;
  taskId!: number;
  before?: TaskSnapshot | null;
  after?: TaskSnapshot | null;
  summary!: string;
}
