import { AuditStatus } from 'src/enum';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User, Song, Comment, File, Like } from '.';

@Entity('playlist')
export class PlayList {
  @PrimaryGeneratedColumn({ name: 'playlist_id' })
  id: number;

  @Column({ name: 'playlist_name', type: 'varchar', length: 63, nullable: false })
  name: string;

  @Column({ name: 'playlist_describe', type: 'varchar', length: 255, nullable: true })
  describe: string;

  @OneToOne(() => File, file => file.playListCover)
  @JoinColumn({ name: 'playlist_cover_file_id' })
  cover: File;

  @Column({ name: 'play_count', type: 'int', nullable: false, default: 0 })
  playCount: number;

  @Column({ name: 'commented_count', type: 'int', nullable: false, default: 0 })
  commentedCount: number;

  @Column({ name: 'liked_count', type: 'int', nullable: false, default: 0 })
  likedCount: number;

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

  @ManyToOne(() => User, user => user.playLists)
  @JoinColumn({ name: 'create_by' })
  createBy: User;

  @ManyToMany(() => Song, song => song.playLists)
  @JoinTable({
    name: 'playlist_song',
    joinColumn: { name: 'playlist_id' },
    inverseJoinColumn: { name: 'song_id' },
  })
  songs: Song[];

  @OneToMany(() => Comment, comment => comment.playlist)
  comments: Comment[];

  @OneToMany(() => Like, like => like.playlist)
  likes: Like[];
}
