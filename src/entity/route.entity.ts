import { Role } from '.';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('route')
export class Route {
  @PrimaryGeneratedColumn({ name: 'route_id' })
  id: number;

  @Column({ name: 'route_name', type: 'varchar', length: 31, nullable: false })
  name: string;

  @Column({ name: 'route_path', type: 'varchar', length: 127, nullable: false })
  path: string;

  @Column({ name: 'route_component', type: 'varchar', length: 63, nullable: false })
  component: string;

  @Column({ name: 'route_describe', type: 'varchar', length: 255, nullable: true })
  describe: string;

  @ManyToOne(() => Route, router => router.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Route;

  @OneToMany(() => Route, router => router.parent)
  children: Route[];

  @ManyToMany(() => Role, role => role.routes)
  roles: Role[];
}
