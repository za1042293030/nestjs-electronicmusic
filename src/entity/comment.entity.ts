import { AuditStatus } from 'src/enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Album, Dynamic, PlayList, Song, User } from '.';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn({ name: 'comment_id' })
  id: number;

  @Column({ name: 'comment_content', type: 'varchar', length: 255, nullable: false })
  content: string;
  
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

  @ManyToOne(() => Dynamic, dynamic => dynamic.comments)
  @JoinColumn({ name: 'dynamic_id' })
  dynamic: Dynamic;

  @ManyToOne(() => PlayList, playlist => playlist.comments)
  @JoinColumn({ name: 'playlist_id' })
  playlist: PlayList;

  @ManyToOne(() => Album, album => album.comments)
  @JoinColumn({ name: 'album_id' })
  album: Album;

  @ManyToOne(() => Song, song => song.comments)
  @JoinColumn({ name: 'song_id' })
  song: Song;

  @ManyToOne(() => User, user => user.replieds)
  @JoinColumn({ name: 'reply_to_user_id' })
  replyTo: User;

  @ManyToOne(() => Comment, comment => comment.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @OneToMany(() => Comment, comment => comment.parent)
  children: Comment[];

  @Column({ name: 'is_delete', nullable: false, default: false, type: 'boolean' })
  isDelete: boolean;

  @Column({ name: 'create_time', type: 'datetime', nullable: true })
  createTime: Date;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'create_by' })
  createBy: User;
}
