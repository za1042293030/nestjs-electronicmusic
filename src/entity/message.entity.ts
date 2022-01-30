import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '.';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn({ name: 'msg_id' })
  id: number;

  @Column({ name: 'msg_name', type: 'varchar', length: 63, nullable: false })
  name: string;

  @Column({ name: 'msg_content', type: 'varchar', length: 511, nullable: false })
  content: string;

  @Column({ name: 'msg_is_handle', type: 'boolean', nullable: false, default: false })
  isHandle: boolean;

  @ManyToOne(() => User, user => user.messages)
  @JoinColumn({ name: 'msg_to_user_id' })
  toUser: User;

  @Column({ name: 'is_delete', nullable: false, default: false, type: 'boolean' })
  isDelete: boolean;

  @Column({ name: 'create_time', type: 'datetime', nullable: true })
  createTime: Date;

  @ManyToOne(() => User, user => user.sendMessages)
  @JoinColumn({ name: 'create_by' })
  createBy: User;
}
