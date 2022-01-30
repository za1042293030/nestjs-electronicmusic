import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role, User } from '.';

@Entity('role_apply')
export class RoleApply {
  @PrimaryGeneratedColumn({ name: 'apply_id' })
  id: number;

  @Column({ name: 'apply_is_handle', type: 'boolean', nullable: false, default: false })
  isHandle: boolean;

  @Column({ name: 'apply_status', nullable: false, default: false, type: 'boolean' })
  status: boolean;

  @ManyToOne(() => Role, role => role.applies)
  @JoinColumn({ name: 'apply_role_id' }) 
  role: Role;

  @Column({ name: 'is_delete', nullable: false, default: false, type: 'boolean' })
  isDelete: boolean;
 
  @Column({ name: 'create_time', type: 'datetime', nullable: true })
  createTime: Date;

  @ManyToOne(() => User, user => user.roleApplies)
  @JoinColumn({ name: 'create_by' })
  createBy: User;
}
