import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album } from 'src/entity';
import Util from 'src/util';
import { Repository } from 'typeorm';
import { SongService } from '.';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
  ) {}

  async getRecommendAlbums(size: number, protocol: string, host: string) {
    const albums = await this.albumRepository
      .createQueryBuilder('album')
      .select(['album.id', 'album.name', 'album.coverUrl', 'album.cover'])
      .leftJoin('album.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('album.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('album.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('album.is_delete=0')
      .andWhere('album.auditStatus=:status', { status: '1' })
      .andWhere('album.coverUrl <> :null', { null: 'null' })
      .orWhere('album.cover is not null')
      .orderBy('RAND()')
      .take(size)
      .getMany();
    return AlbumService.handleAlbumsResponse(albums, protocol, host, true);
  }

  async getAlbumById(id: number, protocol: string, host: string) {
    const album = await this.albumRepository
      .createQueryBuilder('album')
      .select([
        'album.id',
        'album.name',
        'album.coverUrl',
        'album.cover',
        'album.describe',
        'album.createTime',
      ])
      .leftJoin('album.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('album.comments', 'comment', 'comment.isDelete=0 and comment.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['comment.id'])
      .leftJoin('album.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('song.artists', 'sartist')
      .addSelect(['sartist.id', 'sartist.nickName'])
      .leftJoin('song.file', 'file', 'file.isDelete=0 and file.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['file.dir', 'file.name', 'file.type'])
      .leftJoin('song.cover', 'scover', 'scover.isDelete=0 and scover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['scover.dir', 'scover.name', 'scover.type'])
      .leftJoin('album.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .where('album.is_delete=0')
      .andWhere('album.auditStatus=:status', { status: '1' })
      .andWhere('album.id=:id', { id })
      .andWhere('album.coverUrl <> :null', { null: 'null' })
      .orWhere('album.cover is not null')
      .getOne();
    return AlbumService.handleAlbumResponse(album, protocol, host);
  }

  static handleAlbumsResponse(albums: Album[], protocol: string, host: string, delSongs = true) {
    if (!albums) return;
    const res = [];
    for (const album of albums) {
      res.push(this.handleAlbumResponse(album, protocol, host, delSongs));
    }
    return res;
  }

  static handleAlbumResponse(album: Album, protocol: string, host: string, delSongs = false) {
    if (!album) return;
    const { coverUrl, cover, songs, comments } = album;
    delete album.coverUrl;
    delete album.comments;
    delSongs && delete album.songs;
    return {
      ...album,
      cover: cover
        ? Util.generateUrl(protocol, host, '/' + cover.dir + '/' + cover.name + '.' + cover.type)
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
            ? Util.generateUrl(protocol, host, '/' + file.dir + '/' + file.name + '.' + file.type)
            : url,
          cover: cover
            ? Util.generateUrl(
                protocol,
                host,
                '/' + cover.dir + '/' + cover.name + '.' + cover.type,
              )
            : coverUrl,
        };
      }),
      commentCount: comments && comments.length,
    };
  }
}
