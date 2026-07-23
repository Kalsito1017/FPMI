import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { Roles } from '../common/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user role' })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @Req() req: Request,
  ) {
    const requestingUserId = (req as { user?: { id: number; role: Role } }).user
      ?.id;
    if (!requestingUserId) {
      throw new ForbiddenException('Not authenticated');
    }
    return this.usersService.updateRole(id, dto, requestingUserId);
  }
}
