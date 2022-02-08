import { Album, PlayList, Role, Song, File, Dynamic, Comment, Message, Like } from '.';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({
    name: 'nickname',
    length: 63,
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  nickName: string;

  @Column({ name: 'username', length: 63, type: 'varchar', nullable: false, unique: true })
  userName: string;

  @Column({ name: 'password', length: 255, type: 'varchar', nullable: false })
  password: string;

  @Column({ name: 'user_phone', length: 11, type: 'char', nullable: true, default: null })
  phone: string;

  @OneToOne(() => File, file => file.avatar)
  @JoinColumn({ name: 'user_avatar_file_id' })
  avatar: File;

  @Column({ name: 'is_delete', nullable: false, default: false, type: 'boolean' })
  isDelete: boolean;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'create_time', type: 'datetime', nullable: true, default: null })
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime', nullable: true, default: null })
  updateTime: Date;

  @ManyToOne(() => User, user => user.updates)
  @JoinColumn({ name: 'update_by' })
  updateBy: User;

  @ManyToOne(() => User, user => user.creates)
  @JoinColumn({ name: 'create_by' })
  createBy: User;

  @OneToMany(() => User, user => user.updateBy)
  updates: User[];

  @OneToMany(() => User, user => user.updateBy)
  creates: User[];

  @OneToMany(() => PlayList, playList => playList.createBy)
  playLists: PlayList[];

  @ManyToMany(() => Album, album => album.artists)
  @JoinTable({
    name: 'user_album',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'album_id' },
  })
  albums: Album[];

  @ManyToMany(() => Song, song => song.artists)
  @JoinTable({
    name: 'user_song',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'song_id' },
  })
  songs: Song[];

  @OneToMany(() => Dynamic, dynamic => dynamic.createBy)
  dynamics: Dynamic[];

  @OneToMany(() => Comment, comment => comment.createBy)
  comments: Comment[];

  @OneToMany(() => Comment, comment => comment.replyTo)
  replieds: Comment[];

  @OneToMany(() => File, file => file.createBy)
  files: File[];

  @OneToMany(() => Message, message => message.toUser)
  messages: Message[];

  @OneToMany(() => Message, message => message.createBy)
  sendMessages: Message[];

  @OneToMany(() => Album, album => album.createBy)
  createdAlbums: Album[];

  @OneToMany(() => Song, song => song.createBy)
  createdSongs: Song[];

  @OneToMany(() => Like, like => like.createBy)
  likes: Like[];

  @ManyToMany(() => User, user => user.followings)
  @JoinTable({
    name: 'following_followed',
    joinColumn: { name: 'following_user_id' },
    inverseJoinColumn: { name: 'followed_user_id' },
  })
  followeds: User[];

  @ManyToMany(() => User, user => user.followeds)
  followings: User[];
}
