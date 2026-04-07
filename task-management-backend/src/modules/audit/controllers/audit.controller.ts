import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator/roles.decorator';
import { AuditAction } from 'src/common/enums/audit-action.enum';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { RolesGuard } from 'src/modules/auth/guard/roles.guard';
import { AuditService } from '../services/audit.service';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';


@ApiBearerAuth('bearer')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller({path: 'audit-logs', version: '1'})
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiQuery({ name: 'taskId', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'actorId', required: false, type: Number, example: 2 })
  @ApiQuery({
    name: 'action',
    required: false,
    enum: AuditAction,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiOperation({
    summary: 'Query audit logs — admin only',
    description:
      'Filterable by `taskId`, `actorId`, and `action`. Results are paginated newest-first.',
  })
  findMany(@Query() query: QueryAuditLogDto) {
    return this.auditService.findMany(query);
  }
}