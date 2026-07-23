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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CommunityService } from './community.service';
import { CurrentUser } from '../common/current-user.decorator';
import { Public } from '../common/public.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Public()
  @Get('posts')
  @ApiOperation({ summary: 'Get all posts' })
  findAllPosts(@Query() query: QueryPostsDto, @CurrentUser() user?: User) {
    return this.communityService.findAllPosts(query, user?.id);
  }

  @Public()
  @Get('posts/:id')
  @ApiOperation({ summary: 'Get post by ID' })
  findOnePost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ) {
    return this.communityService.findOnePost(id, user?.id);
  }

  @ApiBearerAuth()
  @Post('posts')
  @ApiOperation({ summary: 'Create a new post' })
  createPost(@Body() dto: CreatePostDto, @CurrentUser() user: User) {
    return this.communityService.createPost(dto, user.id);
  }

  @ApiBearerAuth()
  @Patch('posts/:id')
  @ApiOperation({ summary: 'Update a post' })
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.communityService.updatePost(id, dto, user.id, user.role);
  }

  @HttpCode(204)
  @Delete('posts/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  deletePost(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.communityService.deletePost(id, user.id, user.role);
  }

  @ApiBearerAuth()
  @Post('posts/:id/like')
  @ApiOperation({ summary: 'Toggle like on a post' })
  toggleLike(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.communityService.toggleLike(id, user.id);
  }

  @ApiBearerAuth()
  @Post('comments')
  @ApiOperation({ summary: 'Create a new comment' })
  createComment(@Body() dto: CreateCommentDto, @CurrentUser() user: User) {
    return this.communityService.createComment(dto, user.id);
  }

  @ApiBearerAuth()
  @Patch('comments/:id')
  @ApiOperation({ summary: 'Update a comment' })
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.communityService.updateComment(id, dto, user.id, user.role);
  }

  @HttpCode(204)
  @Delete('comments/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.communityService.deleteComment(id, user.id, user.role);
  }
}
