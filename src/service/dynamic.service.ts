import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SendDynamicInfoDTO } from 'src/dto';
import { Dynamic, File, Comment } from 'src/entity';
import { IPayload } from 'src/typings';
import Util from 'src/util';
import { getConnection, In, Repository } from 'typeorm';

@Injectable()
export class DynamicService {
  constructor(
    @InjectRepository(Dynamic)
    private readonly dynamicRepository: Repository<Dynamic>,
  ) {}

  /**
   * 获取动态推荐列表
   * @param pageIndex 页码
   * @param pageSize 一页个数
   * @param protocol 协议
   * @param host 主机
   * @returns
   */
  async getRecommendDynamics(pageIndex: number, pageSize: number, protocol: string, host: string) {
    const dynamics = await this.dynamicRepository
      .createQueryBuilder('dy')
      .select(['dy.id', 'dy.createTime', 'dy.content', 'dy.likedCount', 'dy.commentedCount'])
      .leftJoin('dy.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['avatar.id', 'avatar.dir', 'avatar.name', 'avatar.type'])
      .leftJoin('dy.song', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id', 'song.file', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['scover.id', 'scover.dir', 'scover.name', 'scover.type'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('song.file', 'sfile', 'sfile.isDelete=0 and sfile.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['sfile.id', 'sfile.dir', 'sfile.name', 'sfile.type'])
      .leftJoin('dy.pictures', 'pic', 'pic.auditStatus=:status and pic.isDelete=0', {
        status: '1',
      })
      .addSelect(['pic.id', 'pic.dir', 'pic.name', 'pic.type'])
      .where('dy.isDelete=0')
      .andWhere('dy.auditStatus=:status', { status: '1' })
      .orderBy('RAND()')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getMany();
    return this.handleDynamicsResponse(dynamics, protocol, host);
  }

  /**
   * 获取最新动态列表
   * @param pageIndex 页码
   * @param pageSize 一页个数
   * @param protocol 协议
   * @param host 主机
   * @returns
   */
  async getLatestDynamics(pageIndex: number, pageSize: number, protocol: string, host: string) {
    const dynamics = await this.dynamicRepository
      .createQueryBuilder('dy')
      .select(['dy.id', 'dy.createTime', 'dy.content', 'dy.likedCount', 'dy.commentedCount'])
      .leftJoin('dy.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['avatar.id', 'avatar.dir', 'avatar.name', 'avatar.type'])
      .leftJoin('dy.song', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id', 'song.file', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['scover.id', 'scover.dir', 'scover.name', 'scover.type'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('song.file', 'sfile', 'sfile.isDelete=0 and sfile.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['sfile.id', 'sfile.dir', 'sfile.name', 'sfile.type'])
      .leftJoin('dy.pictures', 'pic', 'pic.auditStatus=:status and pic.isDelete=0', {
        status: '1',
      })
      .addSelect(['pic.id', 'pic.dir', 'pic.name', 'pic.type'])
      .where('dy.isDelete=0')
      .andWhere('dy.auditStatus=:status', { status: '1' })
      .orderBy('dy.createTime', 'DESC')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getMany();
    return this.handleDynamicsResponse(dynamics, protocol, host);
  }

  /**
   * 发送动态
   * @param sendDynamicInfo 发送动态DTO
   * @param user 用户
   */
  async sendDynamic(sendDynamicInfo: SendDynamicInfoDTO, user: IPayload) {
    const { content, songId, pictureIds } = sendDynamicInfo;
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

  async getDynamicById(id: number, protocol: string, host: string) {
    const dynamic = await this.dynamicRepository
      .createQueryBuilder('dy')
      .select(['dy.id', 'dy.createTime', 'dy.content', 'dy.likedCount', 'dy.commentedCount'])
      .leftJoin('dy.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['avatar.id', 'avatar.dir', 'avatar.name', 'avatar.type'])
      .leftJoin('dy.song', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id', 'song.file', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['scover.id', 'scover.dir', 'scover.name', 'scover.type'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('song.file', 'sfile', 'sfile.isDelete=0 and sfile.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['sfile.id', 'sfile.dir', 'sfile.name', 'sfile.type'])
      .leftJoin('dy.pictures', 'pic', 'pic.audit_status=:status and pic.is_delete=0', {
        status: '1',
      })
      .addSelect(['pic.id', 'pic.dir', 'pic.name', 'pic.type'])
      .where('dy.isDelete=0')
      .andWhere('dy.id=:id', { id })
      .andWhere('dy.auditStatus=:status', { status: '1' })
      .getOne();
    return this.handleDynamicResponse(dynamic, protocol, host);
  }

  async getDynamicByUserId(
    id: number,
    pageIndex: number,
    pageSize: number,
    protocol: string,
    host: string,
  ) {
    const dynamics = await this.dynamicRepository
      .createQueryBuilder('dy')
      .select(['dy.id', 'dy.createTime', 'dy.content', 'dy.likedCount', 'dy.commentedCount'])
      .leftJoin('dy.createBy', 'user')
      .addSelect(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['avatar.id', 'avatar.dir', 'avatar.name', 'avatar.type'])
      .leftJoin('dy.song', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id', 'song.file', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['scover.id', 'scover.dir', 'scover.name', 'scover.type'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('song.file', 'sfile', 'sfile.isDelete=0 and sfile.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['sfile.id', 'sfile.dir', 'sfile.name', 'sfile.type'])
      .leftJoin('dy.pictures', 'pic', 'pic.auditStatus=:status and pic.isDelete=0', {
        status: '1',
      })
      .addSelect(['pic.id', 'pic.dir', 'pic.name', 'pic.type'])
      .where('dy.isDelete=0')
      .andWhere('dy.auditStatus=:status', { status: '1' })
      .andWhere('user.id=:id', { id })
      .orderBy('dy.createTime', 'DESC')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getMany();
    return this.handleDynamicsResponse(dynamics, protocol, host);
  }

  /**
   * 处理动态列表
   * @param dynamics 动态列表
   * @param protocol 协议
   * @param host 主机
   * @returns
   */
  handleDynamicsResponse(dynamics: Dynamic[], protocol: string, host: string) {
    if (!dynamics) return;
    const res = [];
    for (const dynamic of dynamics) {
      res.push(this.handleDynamicResponse(dynamic, protocol, host));
    }
    return res;
  }

  handleDynamicResponse(dynamic: Dynamic, protocol: string, host: string) {
    if (!dynamic) return;
    const { createBy, song, pictures, comments } = dynamic;
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
            protocol,
            host,
            '/' + avatar.dir + '/' + avatar.name + '.' + avatar.type,
          ),
      },
      song: song && {
        ...song,
        file: song?.file
          ? Util.generateUrl(
              protocol,
              host,
              '/' + song.file.dir + '/' + song.file.name + '.' + song.file.type,
            )
          : url,
        cover: song?.cover
          ? Util.generateUrl(
              protocol,
              host,
              '/' + song.cover.dir + '/' + song.cover.name + '.' + song.cover.type,
            )
          : coverUrl,
      },
      pictures: pictures.map(picture => ({
        id: picture.id,
        src: Util.generateUrl(
          protocol,
          host,
          '/' + picture.dir + '/' + picture.name + '.' + picture.type,
        ),
      })),
    };
  }
}
