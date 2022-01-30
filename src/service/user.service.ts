import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/entity';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { getUserListDTO } from 'src/dto/user/getUserList.dto';
import Util from 'src/util';
import { RegisterInfoDTO } from 'src/dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}
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

  async getUserInfo(id: number, protocol: string, host: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.nickName', 'user.userName', 'user.phone'])
      .leftJoin('user.role', 'role')
      .addSelect(['role.isAdmin', 'role.id'])
      .leftJoin('user.avatar', 'avatar')
      .addSelect(['avatar.dir', 'avatar.name', 'avatar.type'])
      .where('user.isDelete=0')
      .andWhere('role.isAdmin=0')
      .andWhere('user.id=:id', { id })
      .orWhere('user.user_avatar_file_id is null')
      .andWhere('avatar.auditStatus=:status', { status: '1' })
      .getOne();
    if (user) {
      return this.handleUserInfo(user, protocol, host);
    } else throw new HttpException('没有该用户', HttpStatus.OK);
  }

  async getAdminInfo(id: number, protocol: string, host: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.nickName', 'user.userName', 'user.phone', 'user.avatar'])
      .leftJoin('user.role', 'role')
      .addSelect(['role.isAdmin', 'role.id'])
      .where('user.is_delete=0')
      .andWhere('role.isAdmin=1')
      .andWhere('user.id=:id', { id })
      .getOne();
    if (user) {
      return this.handleUserInfo(user, protocol, host);
    } else throw new HttpException('没有该用户', HttpStatus.OK);
  }

  handleUserInfo(user: User, protocol: string, host: string) {
    if (!user) return;
    const { password, ...userInfo } = user;
    const { avatar } = userInfo;
    return {
      ...userInfo,
      avatar:
        avatar &&
        Util.generateUrl(protocol, host, '/' + avatar.dir + '/' + avatar.name + '.' + avatar.type),
    };
  }

  handleUserInfos(users: User[], protocol: string, host: string) {
    if (!users) return;
    const res = [];
    for (const user of users) {
      res.push(this.handleUserInfo(user, protocol, host));
    }
    return res;
  }
}
