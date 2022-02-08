import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Song } from 'src/entity';
import Util from 'src/util';
import { Repository } from 'typeorm';
import { AuditStatus } from 'src/enum';

@Injectable()
export class SongService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
  ) {
  }

  /**
   * 根据风格id查询歌曲
   * @param id 风格id
   * @param pageIndex 页码
   * @param pageSize 一页个数
   * @returns
   */
  async getSongsByStyleId(
    id: number,
    pageIndex: number,
    pageSize: number,
  ) {
    const [songs, totalCount] = await this.songRepository
      .createQueryBuilder('song')
      .select(['song.id', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName'])
      .leftJoin('song.file', 'file', 'file.isDelete=0 and file.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['file.dir', 'file.name', 'file.type'])
      .leftJoin('song.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where(
        qb =>
          `song.id in ${qb
            .subQuery()
            .select('songsub.id')
            .from(Song, 'songsub')
            .leftJoin('songsub.styles', 'substyle')
            .where('songsub.is_delete=0')
            .andWhere('substyle.style_id=:id', { id })
            .andWhere('songsub.is_delete=0')
            .andWhere('songsub.audit_status=:status', { status: AuditStatus.RESOLVE })
            .skip(pageSize * (pageIndex - 1))
            .take(pageSize)
            .getQuery()}`,
      )
      .andWhere('song.is_delete=0')
      .andWhere('song.audit_status=:status', { status: AuditStatus.RESOLVE })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      songs: this.handleSongsResponse(songs),
      totalCount,
    };
  }

  /**
   * 获取推荐歌曲
   * @param id 风格id
   * @param size 个数
   * @returns
   */
  async getRecommendSongs(size: number, style: boolean) {
    const baseQuery = this.songRepository
      .createQueryBuilder('song')
      .select(['song.id', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.file', 'file', 'file.isDelete=0 and file.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['file.dir', 'file.name', 'file.type'])
      .leftJoin('song.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type']);
    const songs = style
      ? await baseQuery
        .leftJoin('song.styles', 'style')
        .addSelect(['style.id', 'style.name'])
        .leftJoin('song.artists', 'artist')
        .addSelect(['artist.nickName', 'artist.id'])
        .where('song.is_delete=0')
        .andWhere('song.audit_status=:status', { status: AuditStatus.RESOLVE })
        .andWhere('song.url <> :null', { null: 'null' })
        .orWhere('song.file is not null')
        .orderBy('RAND()')
        .take(size)
        .getMany()
      : await baseQuery
        .leftJoin('song.artists', 'artist')
        .addSelect(['artist.nickName', 'artist.id'])
        .where('song.is_delete=0')
        .andWhere('song.audit_status=:status', { status: AuditStatus.RESOLVE })
        .andWhere('song.url <> :null', { null: 'null' })
        .orWhere('song.file is not null')
        .orderBy('RAND()')
        .take(size)
        .getMany();
    return this.handleSongsResponse(songs);
  }

  async getSongsByNameOrProducer(key: string, size = 5) {
    const songs = await this.songRepository
      .createQueryBuilder('song')
      .select(['song.id', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.file', 'file', 'file.isDelete=0 and file.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['file.dir', 'file.name', 'file.type'])
      .leftJoin('song.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .where('song.is_delete=0')
      .andWhere('song.audit_status=:status', { status: AuditStatus.RESOLVE })
      .andWhere(
        qb =>
          'song.id in ' +
          qb
            .subQuery()
            .select('songsub.song_id')
            .from(Song, 'songsub')
            .leftJoin('songsub.artists', 'artistsub')
            .where('artistsub.nickName like :name', { name: '%' + key + '%' })
            .orWhere('songsub.name like :name', { name: '%' + key + '%' })
            .andWhere('songsub.is_delete=0')
            .andWhere('songsub.audit_status=:status', { status: AuditStatus.RESOLVE })
            .getQuery(),
      )
      .take(size)
      .getMany();
    return this.handleSongsResponse(songs);
  }

  async getSongById(id: number) {
    const songs = await this.songRepository
      .createQueryBuilder('song')
      .select([
        'song.id',
        'song.name',
        'song.coverUrl',
        'song.url',
        'song.describe',
        'song.createTime',
        'song.commentedCount',
      ])
      .leftJoin('song.file', 'file', 'file.isDelete=0 and file.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['file.dir', 'file.name', 'file.type'])
      .leftJoin('song.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .where('song.is_delete=0')
      .andWhere('song.id=:id', { id })
      .andWhere('song.audit_status=:status', { status: AuditStatus.RESOLVE })
      .orderBy('RAND()')
      .getOne();
    return this.handleSongResponse(songs);
  }

  handleSongsResponse(songs: Song[]): Song[] {
    if (!songs) return;
    const res = [];
    for (const song of songs) {
      res.push(this.handleSongResponse(song));
    }
    return res;
  }

  handleSongResponse(song: Song) {
    if (!song) return;
    const { file, cover, coverUrl, url, comments } = song;
    delete song.coverUrl;
    delete song.url;
    return {
      ...song,
      file: file
        ? Util.generateUrl('/' + file.dir + '/' + file.name + '.' + file.type)
        : url,
      cover: cover
        ? Util.generateUrl('/' + cover.dir + '/' + cover.name + '.' + cover.type)
        : coverUrl,
    };
  }
}
