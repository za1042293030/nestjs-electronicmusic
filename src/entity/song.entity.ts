import { AuditStatus } from 'src/enum';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { PlayList, User, Style, File, Comment, Album, Dynamic } from '.';

@Entity('song')
export class Song {
  @PrimaryGeneratedColumn({ name: 'song_id' })
  id: number;

  @Column({ name: 'song_name', type: 'varchar', length: 63, nullable: false })
  name: string;

  @Column({ name: 'song_length', type: 'int', nullable: false })
  length: number;

  @Column({ name: 'song_describe', type: 'varchar', length: 255, nullable: true})
  describe: string;

  @Column({ name: 'play_count', type: 'int', nullable: false, default: 0 })
  playCount: number;

  @Column({ name: 'commented_count', type: 'int', nullable: false, default: 0 })
  commentedCount: number;

  @Column({ name: 'liked_count', type: 'int', nullable: false, default: 0 })
  likedCount: number;

  @Column({ name: 'song_lyric', type: 'varchar', length: 8191, nullable: true, default: null })
  lyric: string;

  @OneToOne(() => File, file => file.songCover)
  @JoinColumn({ name: 'song_cover_file_id' })
  cover: File;

  @OneToOne(() => File, file => file.songFile)
  @JoinColumn({ name: 'song_file_id' })
  file: File;

  @ManyToOne(() => Album, album => album.songs)
  @JoinColumn({ name: 'album_id' })
  album: Album;

  @Column({ name: 'song_file_url', type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column({ name: 'song_cover_file_url', type: 'varchar', length: 255, nullable: true })
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

  @ManyToOne(() => User, user => user.createdSongs)
  @JoinColumn({ name: 'create_by' })
  createBy: User;

  @ManyToMany(() => Style, style => style.songs)
  @JoinTable({
    name: 'song_style',
    joinColumn: { name: 'song_id' },
    inverseJoinColumn: { name: 'style_id' },
  })
  styles: Style[];

  @ManyToMany(() => PlayList, playList => playList.songs)
  playLists: PlayList[];

  @OneToMany(() => Dynamic, dynamic => dynamic.song)
  dynamics: Dynamic[];

  @ManyToMany(() => User, user => user.songs)
  artists: User[];

  @OneToMany(() => Comment, comment => comment.song)
  comments: Comment[];
}
