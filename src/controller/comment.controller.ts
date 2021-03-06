import {
  Body,
  Controller,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AddSongToPlayListInfoDTO, IDInfoDTO, SendCommentInfoDTO } from 'src/dto';
import { AuditStatus, CommentType, JWT } from 'src/enum';
import { CommentService } from 'src/service';
import { IUserRequest } from 'src/typings';
import { NumberMaxPipe } from '../pipe/numberMax.pipe';

@ApiTags('评论')
@Controller('/api/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {
  }

  @Post('/sendComment')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async sendComment(
    @Body(ValidationPipe) sendCommentInfo: SendCommentInfoDTO,
    @Req() { user }: IUserRequest,
  ) {
    return await this.commentService.sendComment(sendCommentInfo, user);
  }

  @Get('/getCommentsById')
  async getCommentsById(
    @Query('id', ParseIntPipe) id: number,
    @Query('type', new ParseEnumPipe(CommentType)) type: CommentType,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(10)) pageSize: number,
  ) {
    return await this.commentService.getCommentsById(type, id, pageIndex, pageSize);
  }

  @Get('/getSubCommentsById')
  async getSubCommentsById(
    @Query('id', ParseIntPipe) id: number,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(10)) pageSize: number,
  ) {
    return await this.commentService.getSubCommentsById(id, pageIndex, pageSize);
  }

  @Post('/deleteComment')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async deleteComment(
    @Req() { user }: IUserRequest,
    @Body(ValidationPipe) deleteCommentInfo: IDInfoDTO,
  ) {
    return await this.commentService.deleteComment(deleteCommentInfo, user.id);
  }

  @Get('/getApprovingComments')
  @UseGuards(AuthGuard(JWT.ADMIN))
  async getApprovingComments(
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(100)) pageSize: number,
  ) {
    return await this.commentService.getApprovingComments(pageIndex, pageSize);
  }

  @Post('/changeCommentsAuditStatus')
  @UseGuards(AuthGuard(JWT.ADMIN))
  async changeDynamicsAuditStatus(
    @Query('id', ParseIntPipe) id: number,
    @Query('status', new ParseEnumPipe(AuditStatus)) status: AuditStatus,
  ) {
    return await this.commentService.changeCommentsAuditStatus(id, status);
  }
}
