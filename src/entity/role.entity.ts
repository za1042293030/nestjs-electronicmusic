import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '.';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn({ name: 'role_id' })
  id: number;

  @Column({ name: 'role_name', type: 'varchar', length: 63, nullable: false })
  name: string;

  @Column({ name: 'role_code', type: 'varchar', length: 63, nullable: false })
  code: string;

  @Column({ name: 'role_describe', type: 'varchar', length: 255, nullable: true })
  describe: string;

  @Column({ name: 'is_admin', nullable: false, type: 'boolean' })
  isAdmin: boolean;

  @Column({ name: 'is_delete', nullable: false, default: false, type: 'boolean' })
  isDelete: boolean;

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

  @OneToMany(() => User, user => user.role)
  users: User[];
}
