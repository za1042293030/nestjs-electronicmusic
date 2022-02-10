import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album, User } from 'src/entity';
import Util from 'src/util';
import { Repository } from 'typeorm';
import { AuditStatus } from 'src/enum';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
  ) {
  }

  /**
   * 获取推荐专辑
   * @param size 数量
   * @returns 专辑列表
   */
  async getRecommendAlbums(size: number) {
    const albums = await this.albumRepository
      .createQueryBuilder('album')
      .select(['album.id', 'album.name', 'album.coverUrl', 'album.cover'])
      .leftJoin('album.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('album.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('album.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('album.is_delete=0')
      .andWhere('album.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('album.coverUrl <> :null', { null: 'null' })
      .orWhere('album.cover is not null')
      .orderBy('RAND()')
      .take(size)
      .getMany();
    return AlbumService.handleAlbumsResponse(albums, true);
  }

  /**
   * 根据id获取专辑
   * @param id 专辑id
   * @returns 专辑信息
   */
  async getAlbumById(id: number) {
    const album = await this.albumRepository
      .createQueryBuilder('album')
      .select([
        'album.id',
        'album.name',
        'album.coverUrl',
        'album.cover',
        'album.describe',
        'album.createTime',
        'album.commentedCount',
      ])
      .leftJoin('album.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('album.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('song.artists', 'sartist')
      .addSelect(['sartist.id', 'sartist.nickName'])
      .leftJoin('song.file', 'file', 'file.isDelete=0 and file.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['file.dir', 'file.name', 'file.type'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['scover.dir', 'scover.name', 'scover.type'])
      .leftJoin('album.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('album.is_delete=0')
      .andWhere('album.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('album.id=:id', { id })
      .andWhere('album.coverUrl <> :null', { null: 'null' })
      .orWhere('album.cover is not null')
      .getOne();
    return AlbumService.handleAlbumResponse(album);
  }

  async getAlbumByUserId(id: number, pageIndex: number, pageSize: number) {
    const albums = await this.albumRepository
      .createQueryBuilder('album')
      .select(['album.id', 'album.name', 'album.coverUrl', 'album.cover'])
      .leftJoin('album.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('album.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('album.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('album.is_delete=0')
      .andWhere('album.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere(qb => 'album.id in ' +
        qb.subQuery()
          .select(['album.id'])
          .from(Album, 'album')
          .leftJoin('album.artists', 'art')
          .where('art.id=:id', { id })
          .getQuery(),
      )
      .andWhere('album.coverUrl <> :null', { null: 'null' })
      .orWhere('album.cover is not null')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getMany();
    return AlbumService.handleAlbumsResponse(albums);
  }

  /**
   * 处理专辑列表信息
   * @param albums 专辑列表
   * @param delSongs 是否删除歌曲信息
   * @returns
   */
  static handleAlbumsResponse(albums: Album[], delSongs = true) {
    if (!albums) return [];
    const res = [];
    for (const album of albums) {
      res.push(this.handleAlbumResponse(album, delSongs));
    }
    return res;
  }

  /**
   * 处理专辑信息
   * @param album 专辑
   * @param delSongs 是否删除歌曲信息
   * @returns
   */
  static handleAlbumResponse(album: Album, delSongs = false) {
    if (!album) return;
    const { coverUrl, cover, songs } = album;
    delete album.coverUrl;
    delSongs && delete album.songs;
    return {
      ...album,
      cover: cover
        ? Util.generateUrl('/' + cover.dir + '/' + cover.name + '.' + cover.type)
        : coverUrl,
      styles: Util.StyleSet(songs.map(song => song.styles).flat()),
      songs: songs.map(song => {
        const { file, cover, coverUrl, url } = song;
        delete song.styles;
        delete song.coverUrl;
        delete song.url;
        return {
          ...song,
          file: file
            ? Util.generateUrl('/' + file.dir + '/' + file.name + '.' + file.type)
            : url,
          cover: cover
            ? Util.generateUrl(
              '/' + cover.dir + '/' + cover.name + '.' + cover.type,
            )
            : coverUrl,
        };
      }),
    };
  }
}
