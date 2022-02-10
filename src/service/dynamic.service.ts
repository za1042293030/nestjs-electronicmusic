import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IDInfoDTO, SendDynamicInfoDTO } from 'src/dto';
import { Dynamic, File } from 'src/entity';
import { AuditStatus } from 'src/enum';
import { IJwtPayload, IPayload } from 'src/typings';
import Util from 'src/util';
import { getConnection, In, Repository } from 'typeorm';

@Injectable()
export class DynamicService {
  constructor(
    @InjectRepository(Dynamic)
    private readonly dynamicRepository: Repository<Dynamic>,
    private readonly jwtService: JwtService,
  ) {
  }

  /**
   * 获取动态推荐列表
   * @param pageIndex 页码
   * @param pageSize 一页个数
   * @returns
   */
  async getRecommendDynamics(pageIndex: number, pageSize: number) {
    const dynamics = await this.dynamicRepository
      .createQueryBuilder('dy')
      .select(['dy.id', 'dy.createTime', 'dy.content', 'dy.likedCount', 'dy.commentedCount'])
      .leftJoin('dy.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['avatar.id', 'avatar.dir', 'avatar.name', 'avatar.type'])
      .leftJoin('dy.song', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id', 'song.file', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['scover.id', 'scover.dir', 'scover.name', 'scover.type'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('song.file', 'sfile', 'sfile.isDelete=0 and sfile.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['sfile.id', 'sfile.dir', 'sfile.name', 'sfile.type'])
      .leftJoin('dy.pictures', 'pic', 'pic.auditStatus=:status and pic.isDelete=0', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['pic.id', 'pic.dir', 'pic.name', 'pic.type'])
      .where('dy.isDelete=0')
      .andWhere('dy.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('dy.isPublish=:isPublish', { isPublish: 1 })
      .andWhere('CHAR_LENGTH(dy.content) > 50 OR pic.id is not null OR song.id is not null OR' +
        ' user.role=2')
      .orderBy('RAND()')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getMany();
    return this.handleDynamicsResponse(dynamics);
  }

  /**
   * 获取最新动态列表
   * @param pageIndex 页码
   * @param pageSize 一页个数
   * @returns
   */
  async getLatestDynamics(pageIndex: number, pageSize: number) {
    const dynamics = await this.dynamicRepository
      .createQueryBuilder('dy')
      .select(['dy.id', 'dy.createTime', 'dy.content', 'dy.likedCount', 'dy.commentedCount'])
      .leftJoin('dy.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['avatar.id', 'avatar.dir', 'avatar.name', 'avatar.type'])
      .leftJoin('dy.song', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id', 'song.file', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['scover.id', 'scover.dir', 'scover.name', 'scover.type'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('song.file', 'sfile', 'sfile.isDelete=0 and sfile.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['sfile.id', 'sfile.dir', 'sfile.name', 'sfile.type'])
      .leftJoin('dy.pictures', 'pic', 'pic.auditStatus=:status and pic.isDelete=0', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['pic.id', 'pic.dir', 'pic.name', 'pic.type'])
      .where('dy.isDelete=0')
      .andWhere('dy.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('dy.isPublish=:isPublish', { isPublish: 1 })
      .orderBy('dy.createTime', 'DESC')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getMany();
    return this.handleDynamicsResponse(dynamics);
  }

  /**
   * 发送动态
   * @param sendDynamicInfo 发送动态DTO
   * @param user 用户
   */
  async sendDynamic(sendDynamicInfo: SendDynamicInfoDTO, user: IPayload) {
    const { content, songId, pictureIds, isPrivate } = sendDynamicInfo;
    await getConnection().transaction(async tem => {
      const {
        identifiers: [{ id }],
      } = await tem
        .createQueryBuilder()
        .insert()
        .into(Dynamic)
        .values({
          content,
          song: () => (songId ? songId.toString() : null),
          createBy: () => user.id.toString(),
          createTime: new Date(),
          isPublish: isPrivate ? false : true,
          auditStatus: isPrivate ? AuditStatus.RESOLVE : AuditStatus.APPROVING,
        })
        .execute();
      pictureIds &&
      (await tem
        .createQueryBuilder()
        .update(File)
        .set({
          dynamic: {
            id,
          },
        })
        .where({ id: In(pictureIds) })
        .andWhere('audit_status=:status', { status: '0' })
        .andWhere('is_delete=0')
        .andWhere('dynamic_id is null')
        .andWhere('file_dir = :dir', { dir: 'img' })
        .execute());
    });
    return true;
  }

  async getDynamicById(id: number) {
    const dynamic = await this.dynamicRepository
      .createQueryBuilder('dy')
      .select(['dy.id', 'dy.createTime', 'dy.content', 'dy.likedCount', 'dy.commentedCount'])
      .leftJoin('dy.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['avatar.id', 'avatar.dir', 'avatar.name', 'avatar.type'])
      .leftJoin('dy.song', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id', 'song.file', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['scover.id', 'scover.dir', 'scover.name', 'scover.type'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('song.file', 'sfile', 'sfile.isDelete=0 and sfile.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['sfile.id', 'sfile.dir', 'sfile.name', 'sfile.type'])
      .leftJoin('dy.pictures', 'pic', 'pic.audit_status=:status and pic.is_delete=0', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['pic.id', 'pic.dir', 'pic.name', 'pic.type'])
      .where('dy.isDelete=0')
      .andWhere('dy.id=:id', { id })
      .andWhere('dy.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('dy.isPublish=:isPublish', { isPublish: 1 })
      .getOne();
    return this.handleDynamicResponse(dynamic);
  }

  async getDynamicByUserId(
    id: number,
    pageIndex: number,
    pageSize: number,
    token: string | undefined,
  ) {
    const userId = token ? (await this.jwtService.verifyAsync<IJwtPayload>(token)).id : undefined;
    const baseQuery = this.dynamicRepository
      .createQueryBuilder('dy')
      .select([
        'dy.id',
        'dy.createTime',
        'dy.content',
        'dy.likedCount',
        'dy.commentedCount',
        'dy.isPublish',
      ])
      .leftJoin('dy.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['avatar.id', 'avatar.dir', 'avatar.name', 'avatar.type'])
      .leftJoin('dy.song', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id', 'song.file', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['scover.id', 'scover.dir', 'scover.name', 'scover.type'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('song.file', 'sfile', 'sfile.isDelete=0 and sfile.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['sfile.id', 'sfile.dir', 'sfile.name', 'sfile.type'])
      .leftJoin('dy.pictures', 'pic', 'pic.auditStatus=:status and pic.isDelete=0', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['pic.id', 'pic.dir', 'pic.name', 'pic.type'])
      .where('dy.isDelete=0')
      .andWhere('dy.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('user.id=:id', { id });
    let dynamics: Dynamic[];
    if (id === userId) {
      dynamics = await baseQuery
        .orderBy('dy.createTime', 'DESC')
        .skip(pageSize * (pageIndex - 1))
        .take(pageSize)
        .getMany();
    } else {
      dynamics = await baseQuery
        .andWhere('dy.isPublish=:isPublish', { isPublish: 1 })
        .orderBy('dy.createTime', 'DESC')
        .skip(pageSize * (pageIndex - 1))
        .take(pageSize)
        .getMany();
    }
    return this.handleDynamicsResponse(dynamics);
  }

  async deleteDynamic(deleteDynamicInfo: IDInfoDTO, userId: number) {
    const { id } = deleteDynamicInfo;
    const {
      affected,
    }
      = await this.dynamicRepository.createQueryBuilder()
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
      throw new UnauthorizedException('动态已经删除或非法删除动态');
    else if (affected === 1)
      return true;
    else return false;
  }

  /**
   * 处理动态列表
   * @param dynamics 动态列表
   * @returns
   */
  handleDynamicsResponse(dynamics: Dynamic[]) {
    if (!dynamics) return;
    const res = [];
    for (const dynamic of dynamics) {
      res.push(this.handleDynamicResponse(dynamic));
    }
    return res;
  }

  handleDynamicResponse(dynamic: Dynamic) {
    if (!dynamic) return;
    const { createBy, song, pictures } = dynamic;
    const { avatar } = createBy;
    const url = song?.url;
    const coverUrl = song?.coverUrl;
    delete song?.url;
    delete song?.coverUrl;
    return {
      ...dynamic,
      createBy: {
        ...createBy,
        avatar:
          avatar &&
          Util.generateUrl(
            '/' + avatar.dir + '/' + avatar.name + '.' + avatar.type,
          ),
      },
      song: song && {
        ...song,
        file: song?.file
          ? Util.generateUrl(
            '/' + song.file.dir + '/' + song.file.name + '.' + song.file.type,
          )
          : url,
        cover: song?.cover
          ? Util.generateUrl(
            '/' + song.cover.dir + '/' + song.cover.name + '.' + song.cover.type,
          )
          : coverUrl,
      },
      pictures: pictures.map(picture => ({
        id: picture.id,
        src: Util.generateUrl(
          '/' + picture.dir + '/' + picture.name + '.' + picture.type,
        ),
      })),
    };
  }
}
