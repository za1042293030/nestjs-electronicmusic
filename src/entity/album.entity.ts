import { AuditStatus } from 'src/enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User, Song, File, Comment } from '.';

@Entity('album')
export class Album {
  @PrimaryGeneratedColumn({ name: 'album_id' })
  id: number;

  @Column({ name: 'album_name', type: 'varchar', length: 63, nullable: false })
  name: string;

  @Column({ name: 'album_code', type: 'varchar', length: 63, nullable: true })
  code: string;

  @Column({ name: 'album_describe', type: 'varchar', length: 1023, nullable: true })
  describe: string;

  @Column({ name: 'commented_count', type: 'int', nullable: false, default: 0 })
  commentedCount: number;

  @Column({ name: 'liked_count', type: 'int', nullable: false, default: 0 })
  likedCount: number;

  @OneToOne(() => File, file => file.albumCover)
  @JoinColumn({ name: 'album_cover_file_id' })
  cover: File;

  @Column({ name: 'album_cover_file_url', type: 'varchar', length: 255, nullable: true })
  coverUrl: string;

  @Column({
    name: 'audit_status',
    type: 'enum',
    enum: AuditStatus,
    nullable: true,
    default: AuditStatus.APPROVING,
  })
  auditStatus: AuditStatus;

  @Column({ name: 'is_delete', nullable: false, default: false, type: 'boolean' })
  isDelete: boolean;

  @Column({ name: 'create_time', type: 'datetime', nullable: true })
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime', nullable: true })
  updateTime: Date;

  @ManyToOne(() => User, user => user.updates)
  @JoinColumn({ name: 'update_by' })
  updateBy: User;

  @ManyToOne(() => User, user => user.createdAlbums)
  @JoinColumn({ name: 'create_by' })
  createBy: User;

  @OneToMany(() => Song, song => song.album)
  songs: Song[];

  @ManyToMany(() => User, user => user.albums)
  artists: User[];

  @OneToMany(() => Comment, comment => comment.album)
  comments: Comment[];
}
