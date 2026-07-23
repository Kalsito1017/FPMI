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
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Role } from '@prisma/client';
import { ProfessorsService } from './professors.service';
import { Roles } from '../common/roles.decorator';
import { Public } from '../common/public.decorator';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { QueryProfessorsDto } from './dto/query-professors.dto';

@ApiTags('Professors')
@Controller('professors')
export class ProfessorsController {
  constructor(private professorsService: ProfessorsService) {}

  @Public()
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @ApiOperation({ summary: 'Get all professors' })
  findAll(@Query() query: QueryProfessorsDto) {
    return this.professorsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Get professor by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.professorsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new professor' })
  create(@Body() dto: CreateProfessorDto) {
    return this.professorsService.create(dto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a professor' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfessorDto,
  ) {
    return this.professorsService.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @HttpCode(204)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a professor' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.professorsService.remove(id);
  }
}
