import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album, PlayList, Song, User } from 'src/entity';
import { Repository } from 'typeorm';
import { AlbumService, PlaylistService, SongService, UserService } from '.';
import { AuditStatus } from 'src/enum';

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
  ) {
    const [songs, totalCount] = await this.songRepository
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
      .leftJoin('song.album', 'album', 'album.isDelete=0 and album.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['album.id', 'album.name'])
      .leftJoin('song.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .where('song.is_delete=0')
      .andWhere('song.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('song.name like :name', { name: '%' + key + '%' })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      data: this.songService.handleSongsResponse(songs),
      totalCount: totalCount >= 20 * pageSize ? 20 * pageSize : totalCount,
    };
  }

  async searchAlbums(
    key: string,
    pageIndex: number,
    pageSize: number,
  ) {
    const [albums, totalCount] = await this.albumRepository
      .createQueryBuilder('album')
      .select(['album.id', 'album.name', 'album.coverUrl', 'album.cover'])
      .leftJoin('album.artists', 'artist')
      .addSelect(['artist.nickName', 'artist.id'])
      .leftJoin('album.cover', 'cover', 'cover.isDelete=0 and cover.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['cover.dir', 'cover.name', 'cover.type'])
      .leftJoin('album.songs', 'song', 'song.isDelete=0 and song.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['song.id'])
      .leftJoin('song.styles', 'style')
      .addSelect(['style.id', 'style.name'])
      .where('album.is_delete=0')
      .andWhere('album.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .andWhere('album.name like :name', { name: '%' + key + '%' })
      .andWhere('(album.coverUrl <> :null or album.cover is not null)', { null: 'null' })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      data: AlbumService.handleAlbumsResponse(albums),
      totalCount: totalCount >= 20 * pageSize ? 20 * pageSize : totalCount,
    };
  }

  async searchUsers(
    key: string,
    pageIndex: number,
    pageSize: number,
    roleId = 3,
  ) {
    const baseQuery = this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.nickName'])
      .leftJoin('user.avatar', 'avatar', 'avatar.isDelete=0 and avatar.auditStatus=:status', {
        status: AuditStatus.RESOLVE,
      })
      .addSelect(['avatar.dir', 'avatar.name', 'avatar.type'])
      .where('user.isDelete=0')
      .andWhere('user.nickName like :name', { name: '%' + key + '%' })
      .andWhere('user.role = :roleId', { roleId })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize);
    const count = this.userRepository
      .createQueryBuilder('user')
      .select(AuditStatus.RESOLVE)
      .where('user.isDelete=0')
      .andWhere('user.nickName like :name', { name: '%' + key + '%' })
      .andWhere('user.role = :roleId', { roleId })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize);
    const [users, totalCount] = [await baseQuery.getMany(), await count.getCount()];
    return {
      data: this.userSerivce.handleUserInfos(users),
      totalCount: totalCount >= 20 * pageSize ? 20 * pageSize : totalCount,
    };
  }

  async searchPlayLists(
    key: string,
    pageIndex: number,
    pageSize: number,
  ) {
    const [playLists, totalCount] = await this.playListRepository
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
      .andWhere('playlist.name like :name', { name: '%' + key + '%' })
      .skip(pageSize * (pageIndex - 1))
      .take(pageSize)
      .getManyAndCount();
    return {
      data: this.playListSerivce.handlePlayListsResponse(playLists),
      totalCount: totalCount >= 20 * pageSize ? 20 * pageSize : totalCount,
    };
  }
}
