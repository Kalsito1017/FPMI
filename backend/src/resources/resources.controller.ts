import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { ResourcesService } from './resources.service';
import { CurrentUser } from '../common/current-user.decorator';
import { Public } from '../common/public.decorator';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@ApiTags('Resources')
@Controller()
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  @Public()
  @Get('courses/:courseSlug/resources')
  @ApiOperation({ summary: 'Get all resources for a course' })
  findAll(@Param('courseSlug') courseSlug: string) {
    return this.resourcesService.findAllByCourse(courseSlug);
  }

  @ApiBearerAuth()
  @Post('courses/:courseSlug/resources')
  @ApiOperation({ summary: 'Add a resource to a course' })
  create(
    @Param('courseSlug') courseSlug: string,
    @Body() dto: CreateResourceDto,
    @CurrentUser() user: User,
  ) {
    return this.resourcesService.create(courseSlug, dto, user.id);
  }

  @ApiBearerAuth()
  @Patch('resources/:id')
  @ApiOperation({ summary: 'Update a resource (author or moderator/admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResourceDto,
    @CurrentUser() user: User,
  ) {
    return this.resourcesService.update(id, dto, user.id, user.role);
  }

  @HttpCode(204)
  @Delete('resources/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a resource (author or moderator/admin)' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.resourcesService.remove(id, user.id, user.role);
  }
}
