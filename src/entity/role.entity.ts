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
import { Route, User } from '.';
import { RoleApply } from './roleapply.entity';

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

  @ManyToMany(() => Route, router => router.roles)
  @JoinTable({
    name: 'role_route',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'route_id' },
  })
  routes: Route[];

  @OneToMany(() => User, user => user.role)
  users: User[];

  @OneToMany(() => RoleApply, roleApply => roleApply.role)
  applies: RoleApply[];

/*   @ManyToMany(() => User, user => user.roles)
  users: User[]; */
}
