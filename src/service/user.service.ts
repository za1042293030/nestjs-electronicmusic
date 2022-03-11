import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/entity';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import Util from 'src/util';
import { RegisterInfoDTO, getUserListDTO } from 'src/dto';
import { AuditStatus } from 'src/enum';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {
  }

  async getUserList(orderby: string, pageIndex: number, pageSize: number) {
    let result: getUserListDTO;
    try {
      const [userList, totalCount] = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('role.routes', 'router')
        .leftJoinAndSelect('router.children', 'rou')
        .where('rou.parent_id is not null')
        .andWhere('role.is_admin = :isAdmin', { isAdmin: true })
        .skip(pageSize * (pageIndex - 1))
        .take(pageSize)
        .getManyAndCount();
      result = { userList, totalCount };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result;
  }

  async addUser(user: RegisterInfoDTO) {
    const { password } = user;
    user.password = createHash('md5').update(password).digest('hex');
    const data = await this.userRepository.createQueryBuilder().insert().values([user]).execute();
    return data.identifiers[0].id;
  }

  async getUserInfo(id: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.nickName', 'user.userName'])
      .leftJoin('user.role', 'role')
      .addSelect(['role.isAdmin', 'role.id'])
      .leftJoin('user.avatar', 'avatar')
      .addSelect(['avatar.dir', 'avatar.name', 'avatar.type'])
      .where('user.isDelete=0')
      .andWhere('role.isAdmin=0')
      .andWhere('user.id=:id', { id })
      .orWhere('user.user_avatar_file_id is null')
      .andWhere('avatar.auditStatus=:status', { status: AuditStatus.RESOLVE })
      .getOne();
    if (user) {
      return this.handleUserInfo(user);
    } else return {};
  }

  async getAdminInfo(id: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.nickName', 'user.userName', 'user.avatar'])
      .leftJoin('user.role', 'role')
      .addSelect(['role.isAdmin', 'role.id'])
      .where('user.is_delete=0')
      .andWhere('role.isAdmin=1')
      .andWhere('user.id=:id', { id })
      .getOne();
    if (user) {
      return this.handleUserInfo(user);
    } else return {};
  }

  async getSelectArtists(key: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.nickName'])
      .where('user.isDelete=0')
      .andWhere('user.nickName like :name', { name: '%' + key + '%' })
      .andWhere('user.role = :roleId', { roleId: 2 })
      .take(20)
      .getMany();
  }

  handleUserInfo(user: User) {
    if (!user) return;
    const { password, ...userInfo } = user;
    const { avatar } = userInfo;
    return {
      ...userInfo,
      avatar:
        avatar &&
        Util.generateUrl('/' + avatar.dir + '/' + avatar.name + '.' + avatar.type),
    };
  }

  handleUserInfos(users: User[]) {
    if (!users) return;
    const res = [];
    for (const user of users) {
      res.push(this.handleUserInfo(user));
    }
    return res;
  }
}
