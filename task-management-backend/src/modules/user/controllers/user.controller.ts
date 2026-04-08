import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/modules/auth/guard/auth.guard';
import { RolesGuard } from 'src/modules/auth/guard/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UserService } from '../services/user.service';
import { QueryUserDto } from '../dto/query-user.dto';


@ApiBearerAuth('bearer')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller({path: 'users', version: '1'})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'john' })
  @ApiOperation({
    summary: 'List all users',
    description:
      'Admin only. Returns paginated non-deleted users (passwords excluded).',
  })
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by id — admin only' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }
}