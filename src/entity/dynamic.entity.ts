import { AuditStatus } from 'src/enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Song, User, File, Comment } from '.';

@Entity('dynamic')
export class Dynamic {
  @PrimaryGeneratedColumn({ name: 'dynamic_id' })
  id: number;

  @Column({ name: 'dynamic_content', type: 'varchar', length: 1023, nullable: false })
  content: string;

  @Column({ name: 'liked_count', type: 'int', nullable: false, default: 0 })
  likedCount: number;

  @Column({ name: 'commented_count', type: 'int', nullable: false, default: 0 })
  commentedCount: number;

  @Column({ name: 'click_count', type: 'int', nullable: false, default: 0 })
  clickCount: number;

  @Column({ name: 'dynamic_is_publish', type: 'boolean', nullable: false, default: true })
  isPublish: boolean;

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

  @ManyToOne(() => User, user => user.dynamics)
  @JoinColumn({ name: 'create_by' })
  createBy: User;

  @ManyToOne(() => Song, song => song.dynamics)
  @JoinColumn({ name: 'song_id' })
  song: Song;

  @OneToMany(() => File, file => file.dynamic)
  pictures: File[];

  @OneToMany(() => Comment, comment => comment.dynamic)
  comments: Comment[];
}
