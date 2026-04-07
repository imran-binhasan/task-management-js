import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from 'src/common/enums/task-status.enum';
import { CreateTaskDto } from './create-task.dto';

/**
 * All fields from CreateTaskDto are optional here (via PartialType),
 * including assignedToId. We only add the `status` field that doesn't
 * exist on the create DTO.
 *
 * Note: assignedToId is NOT re-declared here to avoid Swagger/validation
 * duplication — it is inherited from CreateTaskDto via PartialType.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.PROCESSING,
    description: 'New status for the task',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}