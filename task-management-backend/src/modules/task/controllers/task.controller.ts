import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorator/roles.decorator';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { RolesGuard } from 'src/modules/auth/guard/roles.guard';
import type { JwtUser } from 'src/common/interface/jwt-user.interface';
import { TaskService } from '../services/task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { QueryTaskDto } from '../dto/query-task.dto';


@ApiBearerAuth('bearer')
@UseGuards(AuthGuard, RolesGuard)
@Controller({path: 'tasks', version: '1'})
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

    @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Create a task — admin only',
    description: 'assignedToId must point to a USER role account, or be omitted.',
  })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: JwtUser) {
    return this.taskService.create(dto, user);
  }
  
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'report' })
  @ApiOperation({
    summary: 'List tasks',
    description:
      'Admins receive all tasks. Users receive only their assigned tasks. Results are paginated newest-first.',
  })
  findAll(@CurrentUser() user: JwtUser, @Query() query: QueryTaskDto) {
    return this.taskService.findAll(user, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a task by id',
    description: 'Users can only access tasks assigned to them.',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.taskService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a task',
    description:
      'Admins can update any field. Users can only update `status` on tasks assigned to them.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.taskService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Task soft-deleted successfully' })
  @ApiOperation({
    summary: 'Soft-delete a task — admin only',
    description: 'The task record is retained for audit purposes.',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ) {
    return this.taskService.remove(id, user);
  }
}