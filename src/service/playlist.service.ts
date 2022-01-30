import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayList, Song, Style } from 'src/entity';
import Util from 'src/util';
import { Repository } from 'typeorm';
import { SongService } from '.';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(PlayList)
    private readonly playListRepository: Repository<PlayList>,
    private readonly songService: SongService,
  ) {}
  async getRecommendPlayLists(size: number, protocol: string, host: string) {
    const playLists = await this.playListRepository
      .createQueryBuilder('playlist')
      .select(['playlist.id', 'playlist.name'])
      .leftJoin('playlist.createBy', 'user')
      .addSelect(['user.nickName', 'user.id'])
      .leftJoin('playlist.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('playlist.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('playlist.is_delete=0')
      .andWhere('playlist.auditStatus=:status', { status: '1' })
      .orderBy('RAND()')
      .take(size)
      .getMany();
    return this.handlePlayListsResponse(playLists, protocol, host);
  }

  async getPlayListsByStyleId(
    id: number,
    pageIndex: number,
    pageSize: number,
    protocol: string,
    host: string,
  ) {
    const [playLists, totalCount] = await this.playListRepository
      .createQueryBuilder('playlist')
      .select(['playlist.id', 'playlist.name', 'playlist.describe'])
      .leftJoin('playlist.createBy', 'user')
      .addSelect(['user.nickName', 'user.id'])
      .leftJoin('playlist.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id', 'song.name'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('playlist.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('playlist.is_delete=0')
      .andWhere('playlist.audit_status=:status', { status: '1' })
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
                status: '1',
              },
            )
            .leftJoin('songsub.styles', 'stylesub')
            .where('stylesub.id=:id', { id })
            .andWhere('plsub.is_delete=0')
            .andWhere('plsub.audit_status=:status', { status: '1' })
            .getQuery(),
      )
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      playLists: this.handlePlayListsResponse(playLists, protocol, host),
      totalCount,
    };
  }

  async getPlayListsById(id: number, protocol: string, host: string) {
    const playList = await this.playListRepository
      .createQueryBuilder('playlist')
      .select(['playlist.id', 'playlist.name', 'playlist.describe'])
      .leftJoin('playlist.createBy', 'user')
      .addSelect(['user.nickName', 'user.id'])
      .leftJoin('playlist.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin(
        'playlist.comments',
        'comment',
        'comment.isDelete=0 and comment.auditStatus=:status',
        {
          status: '1',
        },
      )
      .addSelect(['comment.id'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('playlist.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('song.file', 'file', 'file.isDelete=0 and file.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['file.dir', 'file.name', 'file.type'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['scover.dir', 'scover.name', 'scover.type'])
      .where('playlist.is_delete=0')
      .andWhere('playlist.audit_status=:status', { status: '1' })
      .andWhere('playlist.id=:id', { id })
      .getOne();
    return this.handlePlayListResponse(playList, protocol, host);
  }

  async getPlayListsByUserId(
    id: number,
    pageIndex: number,
    pageSize: number,
    protocol: string,
    host: string,
  ) {
    const playLists = await this.playListRepository
      .createQueryBuilder('pl')
      .select(['pl.id', 'pl.name', 'pl.describe'])
      .leftJoin('pl.createBy', 'user')
      .addSelect(['user.nickName', 'user.id'])
      .leftJoin('pl.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id', 'song.name'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('pl.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('pl.is_delete=0')
      .andWhere('pl.audit_status=:status', { status: '1' })
      .andWhere('user.id=:id', { id })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getMany();
    return this.handlePlayListsResponse(playLists, protocol, host);
  }

  handlePlayListResponse(playList: PlayList, protocol: string, host: string, delSongs = false) {
    if (!playList) return;
    const { songs, comments, cover } = playList;
    delSongs && delete playList.songs;
    delete playList.comments;
    return delSongs
      ? {
          ...playList,
          styles: Util.StyleSet(songs?.map(song => song.styles).flat()),
          cover:
            cover &&
            Util.generateUrl(protocol, host, '/' + cover.dir + '/' + cover.name + '.' + cover.type),
        }
      : {
          ...playList,
          styles: Util.StyleSet(songs?.map(song => song.styles).flat()),
          songs: songs.map(song => {
            delete song.styles;
            return this.songService.handleSongResponse(song, protocol, host);
          }),
          commentCount: comments && comments.length,
          cover:
            cover &&
            Util.generateUrl(protocol, host, '/' + cover.dir + '/' + cover.name + '.' + cover.type),
        };
  }
  handlePlayListsResponse(playLists: PlayList[], protocol: string, host: string) {
    if (!playLists) return;
    const res = [];
    for (const playList of playLists) {
      res.push(this.handlePlayListResponse(playList, protocol, host, true));
    }
    return res;
  }
}
