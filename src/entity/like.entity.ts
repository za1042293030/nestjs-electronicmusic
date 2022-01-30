import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dynamic, PlayList, Song, User, Comment } from '.';

@Entity('like')
export class Like {
  @PrimaryGeneratedColumn({ name: 'like_id' })
  id: number;

  @Column({ name: 'is_delete', nullable: false, default: false, type: 'boolean' })
  isDelete: boolean;

  @Column({ name: 'create_time', type: 'datetime', nullable: true })
  createTime: Date;

  @ManyToOne(() => User, user => user.likes)
  @JoinColumn({ name: 'create_by' })
  createBy: User;

  @ManyToOne(() => Song, song => song.likes)
  @JoinColumn({ name: 'song_id' })
  song: Song;

  @ManyToOne(() => Comment, comment => comment.likes)
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @ManyToOne(() => Dynamic, dynamic => dynamic.likes)
  @JoinColumn({ name: 'dynamic_id' })
  dynamic: Dynamic;

  @ManyToOne(() => PlayList, playlist => playlist.likes)
  @JoinColumn({ name: 'playlist_id' })
  playlist: PlayList;
}
