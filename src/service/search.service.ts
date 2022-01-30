import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album, PlayList, Song, User } from 'src/entity';
import { Repository } from 'typeorm';
import { AlbumService, PlaylistService, SongService, UserService } from '.';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PlayList)
    private readonly playListRepository: Repository<PlayList>,
    private readonly songService: SongService,
    private readonly userSerivce: UserService,
    @Inject(forwardRef(() => PlaylistService))
    private readonly playListSerivce: PlaylistService,
  ) {}

  async searchSongs(
    key: string,
    pageIndex: number,
    pageSize: number,
    protocol: string,
    host: string,
  ) {
    const [songs, totalCount] = await this.songRepository
      .createQueryBuilder('song')
      .select(['song.id', 'song.name', 'song.coverUrl', 'song.url'])
      .leftJoin('song.file', 'file', 'file.isDelete=0 and file.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['file.dir', 'file.name', 'file.type'])
      .leftJoin('song.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .leftJoin('song.album', 'album', 'album.isDelete=0 and album.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['album.id', 'album.name'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .where('song.is_delete=0')
      .andWhere('song.auditStatus=:status', { status: '1' })
      .andWhere('song.name like :name', { name: '%' + key + '%' })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      data: this.songService.handleSongsResponse(songs, protocol, host),
      totalCount: totalCount >= 20 * pageSize ? 20 * pageSize : totalCount,
    };
  }

  async searchAlbums(
    key: string,
    pageIndex: number,
    pageSize: number,
    protocol: string,
    host: string,
  ) {
    const [albums, totalCount] = await this.albumRepository
      .createQueryBuilder('album')
      .select(['album.id', 'album.name', 'album.coverUrl', 'album.cover'])
      .leftJoin('album.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('album.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .leftJoin('album.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['song.id'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .where('album.is_delete=0')
      .andWhere('album.auditStatus=:status', { status: '1' })
      .andWhere('album.name like :name', { name: '%' + key + '%' })
      .andWhere('album.coverUrl <> :null', { null: 'null' })
      .orWhere('album.cover is not null')
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      data: AlbumService.handleAlbumsResponse(albums, protocol, host),
      totalCount: totalCount >= 20 * pageSize ? 20 * pageSize : totalCount,
    };
  }

  async searchUsers(
    key: string,
    pageIndex: number,
    pageSize: number,
    protocol: string,
    host: string,
    roleId = 3,
  ) {
    const baseQuery = this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: '1',
      })
      .addSelect(['avatar.dir', 'avatar.name', 'avatar.type'])
      .where('user.isDelete=0')
      .andWhere('user.nickName like :name', { name: '%' + key + '%' })
      .andWhere('user.role = :roleId', { roleId })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize);
    const count = this.userRepository
      .createQueryBuilder('user')
      .select('1')
      .where('user.isDelete=0')
      .andWhere('user.nickName like :name', { name: '%' + key + '%' })
      .andWhere('user.role = :roleId', { roleId })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize);
    const [users, totalCount] = [await baseQuery.getMany(), await count.getCount()];
    return {
      data: this.userSerivce.handleUserInfos(users, protocol, host),
      totalCount: totalCount >= 20 * pageSize ? 20 * pageSize : totalCount,
    };
  }

  async searchPlayLists(
    key: string,
    pageIndex: number,
    pageSize: number,
    protocol: string,
    host: string,
  ) {
    const [playLists, totalCount] = await this.playListRepository
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
      .andWhere('playlist.name like :name', { name: '%' + key + '%' })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      data: this.playListSerivce.handlePlayListsResponse(playLists, protocol, host),
      totalCount: totalCount >= 20 * pageSize ? 20 * pageSize : totalCount,
    };
  }
}
