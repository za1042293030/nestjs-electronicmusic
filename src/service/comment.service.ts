import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IDInfoDTO, SendCommentInfoDTO } from 'src/dto';
import { Comment, Dynamic, File } from 'src/entity';
import { AuditStatus, CommentType } from 'src/enum';
import { IPayload } from 'src/typings';
import Util from 'src/util';
import { getConnection, Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {
  }

  async getCommentsById(
    type: CommentType,
    id: number,
    pageIndex: number,
    pageSize: number,
  ) {
    const entity = this.getType(type);
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .select(['comment.id', 'comment.createTime', 'comment.content', 'comment.likedCount'])
      .leftJoin('comment.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['avatar.id', 'avatar.dir', 'avatar.name', 'avatar.type'])
      .leftJoin(
        'comment.children',
        'children',
        'children.isDelete=0 and children.auditStatus=:status',
        {
          status: AuditStatus.RESOLVE,
        },
      )
      .addSelect('children.id')
      .where('comment.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('comment.isDelete=0')
      .andWhere(`comment.${entity}=:id`, { id })
      .andWhere('comment.parent is null')
      .orderBy('comment.createTime', 'DESC')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getMany();
    return this.handleCommentsResponse(comments);
  }

  async getSubCommentsById(
    id: number,
    pageIndex: number,
    pageSize: number,
  ) {
    const [comments, totalCount] = await this.commentRepository
      .createQueryBuilder('comment')
      .select(['comment.id', 'comment.createTime', 'comment.content', 'comment.likedCount'])
      .leftJoin('comment.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['avatar.id', 'avatar.dir', 'avatar.name', 'avatar.type'])
      .leftJoin('comment.replyTo', 'replyuser')
      .addSelect(['replyuser.id', 'replyuser.nickName'])
      .where('comment.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('comment.isDelete=0')
      .andWhere('comment.parent=:id', { id })
      .orderBy('comment.createTime', 'ASC')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      data: this.handleSubCommentsResponse(comments),
      totalCount,
    };
  }

  async sendComment(info: SendCommentInfoDTO, user: IPayload) {
    const { content, type, id, replyToId } = info;
    const entity = this.getType(type);
    await getConnection().transaction(async tem => {
      const res = replyToId ? await tem
        .createQueryBuilder()
        .select(['comment.id'])
        .from(Comment, 'comment')
        .leftJoin('comment.createBy', 'user')
        .addSelect(['user.id'])
        .leftJoin('comment.parent', 'parent')
        .addSelect(['parent.id'])
        .where('comment.id=:id', { id: replyToId })
        .andWhere('comment.isDelete=0')
        .andWhere('comment.auditStatus=:status', { status: AuditStatus.RESOLVE })
        .getOne() : null;
      await tem
        .createQueryBuilder()
        .insert()
        .into(Comment)
        .values({
          content,
          song: type === CommentType.SONG ? { id } : null,
          album: type === CommentType.ALBUM ? { id } : null,
          dynamic: type === CommentType.DYNAMIC ? { id } : null,
          playlist: type === CommentType.PLAYLIST ? { id } : null,
          createBy: {
            id: user.id,
          },
          createTime: new Date(),
          replyTo: {
            id: res?.parent?.id ? res?.createBy?.id : null ?? null,
          },
          parent: replyToId
            ? {
              id: res?.parent?.id ?? replyToId,
            }
            : null,
        })
        .execute();
      await tem
        .createQueryBuilder()
        .update(entity)
        .set({
          commentedCount: () => 'commented_count+1',
        })
        .where('id=:id', { id })
        .execute();
    });
    return true;
  }

  async deleteComment(deleteCommentInfo: IDInfoDTO, userId: number) {
    const { id } = deleteCommentInfo;
    const {
      affected,
    }
      = await this.commentRepository.createQueryBuilder()
      .update()
      .set(
        {
          isDelete: true,
        },
      )
      .where('id=:id', { id })
      .andWhere('createBy=:userId', { userId })
      .andWhere('auditStatus=:status', { status: AuditStatus.RESOLVE })
      .execute();
    if (affected === 0)
      throw new UnauthorizedException('评论已经删除或非法删除评论');
    else if (affected === 1)
      return true;
    else return false;
  }

  async getApprovingComments(pageIndex: number, pageSize: number) {
    const [comments, totalCount] = await this.commentRepository
      .createQueryBuilder('comment')
      .select(['comment.id', 'comment.createTime', 'comment.content'])
      .leftJoin('comment.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('comment.replyTo', 'replyUser')
      .addSelect(['replyUser.id', 'replyUser.nickName'])
      .leftJoin('comment.parent', 'parent')
      .addSelect(['parent.id'])
      .leftJoin('parent.createBy', 'parentuser')
      .addSelect(['parentuser.id', 'parentuser.nickName'])
      .where('comment.auditStatus=:status', { status: AuditStatus.APPROVING })
      .andWhere('comment.isDelete=0')
      .orderBy('comment.createTime', 'DESC')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      data: this.handleSubCommentsResponse(comments),
      totalCount,
    };
  }

  async changeCommentsAuditStatus(id: number, auditStatus: AuditStatus) {
    await this.commentRepository
      .createQueryBuilder()
      .update()
      .set({
        auditStatus,
      })
      .where('id=:id', { id })
      .execute();
    return true;
  }

  getType(type: CommentType) {
    let entity: string;
    switch (type) {
      case CommentType.SONG:
        entity = 'song';
        break;
      case CommentType.ALBUM:
        entity = 'album';
        break;
      case CommentType.DYNAMIC:
        entity = 'dynamic';
        break;
      case CommentType.PLAYLIST:
        entity = 'playlist';
        break;
      default:
        break;
    }
    return entity;
  }

  handleCommentsResponse(comments: Comment[]) {
    const res = [];
    for (const comment of comments) {
      const { createBy, children } = comment;
      delete comment.children;
      res.push({
        ...comment,
        createBy: {
          ...createBy,
          avatar:
            createBy?.avatar &&
            Util.generateUrl(
              '/' + createBy.avatar.dir + '/' + createBy.avatar.name + '.' + createBy.avatar.type,
            ),
        },
        replyCount: children.length,
      });
    }
    return res;
  }

  handleSubCommentsResponse(comments: Comment[]) {
    const res = [];
    for (const comment of comments) {
      res.push({
        ...comment,
        createBy: {
          ...comment.createBy,
          avatar:
            comment.createBy?.avatar &&
            Util.generateUrl(
              '/' +
              comment.createBy?.avatar.dir +
              '/' +
              comment.createBy?.avatar.name +
              '.' +
              comment.createBy?.avatar.type,
            ),
        },
      });
    }
    return res;
  }
}
