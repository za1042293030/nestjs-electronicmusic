import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File, PlayList } from 'src/entity';
import Util from 'src/util';
import { getConnection, Repository } from 'typeorm';
import { SongService } from '.';
import {
  AddSongToPlayListInfoDTO,
  CreatePlayListInfoDTO,
  IDInfoDTO,
  UpdatePlayListInfoDTO,
} from 'src/dto';
import { AuditStatus } from 'src/enum';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(PlayList)
    private readonly playListRepository: Repository<PlayList>,
    private readonly songService: SongService,
  ) {
  }

  async getRecommendPlayLists(size: number) {
    const playLists = await this.playListRepository
      .createQueryBuilder('playlist')
      .select(['playlist.id', 'playlist.name'])
      .leftJoin('playlist.createBy', 'user')
      .addSelect(['user.nickName', 'user.id'])
      .leftJoin('playlist.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('playlist.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('playlist.is_delete=0')
      .andWhere('playlist.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('song.id is not null')
      .andWhere('cover.id is not null')
      .orderBy('RAND()')
      .take(size)
      .getMany();
    return this.handlePlayListsResponse(playLists);
  }

  async getPlayListsByStyleId(
    id: number,
    pageIndex: number,
    pageSize: number,
  ) {
    const [playLists, totalCount] = await this.playListRepository
      .createQueryBuilder('playlist')
      .select(['playlist.id', 'playlist.name', 'playlist.describe'])
      .leftJoin('playlist.createBy', 'user')
      .addSelect(['user.nickName', 'user.id'])
      .leftJoin('playlist.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id', 'song.name'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('playlist.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('playlist.is_delete=0')
      .andWhere('playlist.audit_status=:status', { status: AuditStatus.RESOLVE })
      .andWhere(
        qb =>
          'playlist.id in ' +
          qb
            .subQuery()
            .select(['plsub.id'])
            .from(PlayList, 'plsub')
            .leftJoin(
              'plsub.songs',
              'songsub',
              'songsub.isDelete=0 and songsub.auditStatus=:status',
              {
                status: AuditStatus.RESOLVE,
              },
            )
            .leftJoin('songsub.styles', 'stylesub')
            .where('stylesub.id=:id', { id })
            .andWhere('plsub.is_delete=0')
            .andWhere('plsub.audit_status=:status', { status: AuditStatus.RESOLVE })
            .getQuery(),
      )
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      playLists: this.handlePlayListsResponse(playLists),
      totalCount,
    };
  }

  async getPlayListsById(id: number) {
    const playList = await this.playListRepository
      .createQueryBuilder('playlist')
      .select(['playlist.id', 'playlist.name', 'playlist.describe', 'playlist.commentedCount','playlist.createTime'])
      .leftJoin('playlist.createBy', 'user')
      .addSelect(['user.nickName', 'user.id'])
      .leftJoin('playlist.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('playlist.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('song.file', 'file', 'file.isDelete=0 and file.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['file.dir', 'file.name', 'file.type'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['scover.dir', 'scover.name', 'scover.type'])
      .where('playlist.is_delete=0')
      .andWhere('playlist.audit_status=:status', { status: AuditStatus.RESOLVE })
      .andWhere('playlist.id=:id', { id })
      .orderBy('song.createTime', 'ASC')
      .getOne();
    return this.handlePlayListResponse(playList);
  }

  async getPlayListsByUserId(
    id: number,
    pageIndex: number,
    pageSize: number,
  ) {
    const playLists = await this.playListRepository
      .createQueryBuilder('pl')
      .select(['pl.id', 'pl.name', 'pl.describe'])
      .leftJoin('pl.createBy', 'user')
      .addSelect(['user.nickName', 'user.id'])
      .leftJoin('pl.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id', 'song.name'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('pl.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('pl.is_delete=0')
      .andWhere('pl.audit_status=:status', { status: AuditStatus.RESOLVE })
      .andWhere('user.id=:id', { id })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getMany();
    return this.handlePlayListsResponse(playLists);
  }

  async createPlayList(createPlayListInfo: CreatePlayListInfoDTO, id: number) {
    const { name } = createPlayListInfo;
    const newDate = new Date();
    await this.playListRepository.createQueryBuilder()
      .insert()
      .values([
        {
          name,
          createBy: {
            id,
          },
          createTime: newDate,
          updateTime: newDate,
        },
      ])
      .execute();
    return true;
  }

  async updatePlayList(updatePlayListInfo: UpdatePlayListInfoDTO, userId: number) {
    const { name, describe, coverId, id } = updatePlayListInfo;
    if (!name && !coverId && !describe) throw new HttpException('??????????????????', HttpStatus.BAD_REQUEST);
    const newDate = new Date();
    const coverObj = coverId ? {
      cover: {
        id: coverId,
      },
    } : {}, nameObj = name ? {
      name,
    } : {}, describeObj = describe ? {
      describe,
    } : {};
    const {
      affected,
    }
      = await this.playListRepository.createQueryBuilder()
      .update()
      .set(
        {
          auditStatus: AuditStatus.APPROVING,
          updateTime: newDate,
          ...coverObj,
          ...nameObj,
          ...describeObj,
        },
      )
      .where('id=:id', { id })
      .andWhere('createBy=:userId', { userId })
      .execute();
    if (affected === 1)
      return true;
    else return false;
  }

  async deletePlayList(deletePlayListInfo: IDInfoDTO, userId: number) {
    const { id } = deletePlayListInfo;
    const {
      affected,
    }
      = await this.playListRepository.createQueryBuilder()
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
      throw new UnauthorizedException('???????????????????????????????????????');
    else if (affected === 1)
      return true;
    else return false;
  }

  async addSongToPlayList(addSongToPlayListInfo: AddSongToPlayListInfoDTO, userId: number) {
    const { songId, playListId } = addSongToPlayListInfo;
    const playList = await this.playListRepository.findOne({
      select: ['id'],
      where: {
        createBy: userId,
        id: playListId,
        isDelete: false,
        auditStatus: AuditStatus.RESOLVE,
      },
    });
    if (!playList) throw new UnauthorizedException('???????????????????????????????????????');
    try {
      await getConnection().query('INSERT INTO playlist_song VALUES (?,?)', [playListId, songId]);
    } catch (e) {
      if (e.sqlState === '23000')
        throw new HttpException('??????????????????????????????', HttpStatus.BAD_REQUEST);
    }
    await this.playListRepository.createQueryBuilder()
      .update()
      .set(
        {
          updateTime: new Date(),
        },
      )
      .where('id=:id', { id: playListId })
      .andWhere('createBy=:userId', { userId })
      .execute();
    return true;
  }

  async deletePlayListSong(deleteSongFromPlayListInfo: AddSongToPlayListInfoDTO, userId: number) {
    const { songId, playListId } = deleteSongFromPlayListInfo;
    const playList = await this.playListRepository.findOne({
      select: ['id'],
      where: {
        createBy: userId,
        id: playListId,
        isDelete: false,
        auditStatus: AuditStatus.RESOLVE,
      },
    });
    if (!playList) throw new UnauthorizedException('????????????????????????????????????');
    const { affectedRows } = await getConnection().query('DELETE FROM playlist_song WHERE playlist_id=? AND song_id=?', [playListId, songId]);
    if (affectedRows === 0)
      return false;
    else
      return true;
  }

  async getApprovingPlayLists(pageIndex: number, pageSize: number) {
    const [comments, totalCount] = await this.playListRepository
      .createQueryBuilder('pl')
      .select(['pl.id', 'pl.name', 'pl.createTime', 'pl.describe'])
      .leftJoin('pl.createBy', 'user')
      .addSelect(['user.nickName', 'user.id'])
      .leftJoin('pl.cover', 'cover', 'cover.isDelete=0')
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('pl.auditStatus=:status', { status: AuditStatus.APPROVING })
      .andWhere('pl.isDelete=0')
      .orderBy('pl.createTime', 'DESC')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      data: this.handlePlayListsResponse(comments),
      totalCount,
    };
  }

  async changePlayListsAuditStatus(id: number, auditStatus: AuditStatus) {
    await getConnection().transaction(async tem => {
      const playList = await this.playListRepository
        .createQueryBuilder('pl')
        .select(['pl.id'])
        .leftJoin('pl.cover', 'cover', 'cover.isDelete=0')
        .addSelect(['cover.id'])
        .where('pl.id=:id', { id })
        .getOne();
      await tem
        .createQueryBuilder()
        .update(PlayList)
        .set({
          auditStatus,
        })
        .where('id=:id', { id })
        .execute();
      const fileQuery = tem
        .createQueryBuilder()
        .update(File)
        .set({
          auditStatus,
        });
      if (playList?.cover) {
        await
          fileQuery
            .where('id=:id', { id: playList.cover.id })
            .execute();
      }
    });
    return true;
  }

  handlePlayListResponse(playList: PlayList, delSongs = false) {
    if (!playList) return;
    const { songs, cover } = playList;
    delSongs && delete playList.songs;
    return delSongs
      ? {
        ...playList,
        styles: Util.StyleSet(songs?.map(song => song.styles).flat()),
        cover:
          cover &&
          Util.generateUrl('/' + cover.dir + '/' + cover.name + '.' + cover.type),
      }
      : {
        ...playList,
        styles: Util.StyleSet(songs?.map(song => song.styles).flat()),
        songs: songs.map(song => {
          delete song.styles;
          return this.songService.handleSongResponse(song);
        }),
        cover:
          cover &&
          Util.generateUrl('/' + cover.dir + '/' + cover.name + '.' + cover.type),
      };
  }

  handlePlayListsResponse(playLists: PlayList[]) {
    if (!playLists) return;
    const res = [];
    for (const playList of playLists) {
      res.push(this.handlePlayListResponse(playList, true));
    }
    return res;
  }
}
