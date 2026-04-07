import { AuditAction } from 'src/common/enums/audit-action.enum';
import { TaskSnapshot } from 'src/common/interface/task-snapshot.interface';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
@Index('idx_audit_task_created_at', ['taskId', 'createdAt'])
@Index('idx_audit_actor_created_at', ['actorId', 'createdAt'])
@Index('idx_audit_action_created_at', ['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actor!: User | null;

  @Column({ name: 'actor_id', type: 'int', nullable: true })
  actorId!: number | null;

  @Column({ name: 'actor_name', type: 'varchar', nullable: true })
  actorName!: string | null;

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ name: 'task_id', type: 'int' })
  taskId!: number;

  @Column({ type: 'jsonb', nullable: true })
  before!: TaskSnapshot | null;

  @Column({ type: 'jsonb', nullable: true })
  after!: TaskSnapshot | null;

  @Column({ type: 'varchar', nullable: true })
  summary!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
