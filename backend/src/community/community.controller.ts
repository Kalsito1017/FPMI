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
import type { User } from '@prisma/client';
import { CommunityService } from './community.service';
import { CurrentUser } from '../common/current-user.decorator';
import { Public } from '../common/public.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Public()
  @Get('posts')
  findAllPosts(@Query() query: QueryPostsDto, @CurrentUser() user?: User) {
    return this.communityService.findAllPosts(query, user?.id);
  }

  @Public()
  @Get('posts/:id')
  findOnePost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ) {
    return this.communityService.findOnePost(id, user?.id);
  }

  @Post('posts')
  createPost(@Body() dto: CreatePostDto, @CurrentUser() user: User) {
    return this.communityService.createPost(dto, user.id);
  }

  @Patch('posts/:id')
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.communityService.updatePost(id, dto, user.id, user.role);
  }

  @HttpCode(204)
  @Delete('posts/:id')
  deletePost(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.communityService.deletePost(id, user.id, user.role);
  }

  @Post('posts/:id/like')
  toggleLike(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.communityService.toggleLike(id, user.id);
  }

  @Post('comments')
  createComment(@Body() dto: CreateCommentDto, @CurrentUser() user: User) {
    return this.communityService.createComment(dto, user.id);
  }

  @Patch('comments/:id')
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.communityService.updateComment(id, dto, user.id, user.role);
  }

  @HttpCode(204)
  @Delete('comments/:id')
  deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.communityService.deleteComment(id, user.id, user.role);
  }
}
