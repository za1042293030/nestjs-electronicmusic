import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User, Song } from '.';

@Entity('style')
export class Style {
  @PrimaryGeneratedColumn({ name: 'style_id' })
  id: number;

  @Column({ name: 'style_name', type: 'varchar', length: 63, nullable: false })
  name: string;

  @Column({ name: 'style_code', type: 'varchar', length: 63, nullable: false })
  code: string;

  @Column({ name: 'style_describe', type: 'varchar', length: 255, nullable: true })
  describe: string;

  @Column({ name: 'create_time', type: 'datetime', nullable: true })
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime', nullable: true })
  updateTime: Date;

  @ManyToOne(() => User, user => user.updates)
  @JoinColumn({ name: 'update_by' })
  updateBy: User;

  @ManyToOne(() => User, user => user.creates)
  @JoinColumn({ name: 'create_by' })
  createBy: User;

  @ManyToMany(() => Song, song => song.styles)
  songs: Song[];

  @ManyToOne(() => Style, style => style.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Style;

  @OneToMany(() => Style, style => style.parent)
  children: Style[];
}
