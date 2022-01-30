import { AuditStatus } from 'src/enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Album, Song, User, Dynamic, PlayList } from '.';

@Entity('file')
export class File {
  @PrimaryGeneratedColumn({ name: 'file_id' })
  id: number;

  @Column({ name: 'file_name', type: 'varchar', length: 63, nullable: false, unique: true })
  name: string;

  @Column({ name: 'file_original', type: 'varchar', length: 127, nullable: false })
  original: string;

  @Column({ name: 'file_type', type: 'varchar', length: 31, nullable: true })
  type: string;

  @Column({ name: 'file_size', type: 'int', nullable: false })
  size: number;

  @Column({ name: 'file_dir', type: 'varchar', length: 31, nullable: true })
  dir: string;

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

  @ManyToOne(() => User, user => user.files)
  @JoinColumn({ name: 'create_by' })
  createBy: User;

  @OneToOne(() => Song, song => song.cover)
  songCover: Song;

  @OneToOne(() => Song, song => song.file)
  songFile: Song;

  @OneToOne(() => Album, album => album.cover)
  albumCover: Album;

  @OneToOne(() => PlayList, palulist => palulist.cover)
  playListCover: Album;

  @OneToOne(() => User, user => user.avatar)
  avatar: User;

  @ManyToOne(() => Dynamic, dynamic => dynamic.pictures)
  @JoinColumn({ name: 'dynamic_id' })
  dynamic: Dynamic;
}
