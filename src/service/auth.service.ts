import { IPayload } from 'src/typings';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity';
import { RegisterInfoDTO, TokenDTO } from 'src/dto';
import { FindConditions, Repository } from 'typeorm';
import { createHash } from 'crypto';
import { ChangePasswordInfoDTO } from 'src/dto/auth/changePassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
  }

  /**
   * 登录成功，返回token
   * @param user 用户对象
   * @returns tokenDTO
   */
  async login(id: number, isAdmin: boolean): Promise<TokenDTO> {
    const payload: IPayload = { id, isAdmin };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  /**
   * 注册成功，返回token
   * @param registerInfo 注册信息
   * @returns tokenDTO
   */
  async register(registerInfo: RegisterInfoDTO) {
    const { nickname: nickName, username: userName, password, phone } = registerInfo;
    const {
      identifiers: [{ id }],
    } = await this.userRepository
      .createQueryBuilder()
      .insert()
      .values({
        nickName,
        userName,
        password: createHash('md5').update(password).digest('hex'),
        phone,
        role: {
          id: 3,
        },
        createTime: new Date(),
        updateTime: new Date(),
      })
      .execute();
    return this.login(id, false);
  }

  /**
   * 根据用户名获取用户信息，返回数据
   * @param userName 用户名
   * @param password 密码
   * @returns 用户id
   */
  async validateLogin(userName: string, password: string) {
    const user = await this.findUser({ userName });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    } else if (user.password === createHash('md5').update(password).digest('hex')) {
      const {
        id,
        role: { isAdmin },
      } = user;
      return {
        id,
        isAdmin,
      };
    } else throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
  }

  async validateLoginAdmin(userName: string, password: string) {
    const admin = await this.findAdmin({ userName });
    if (!admin) {
      throw new HttpException('管理员不存在', HttpStatus.BAD_REQUEST);
    } else if (admin.password === createHash('md5').update(password).digest('hex')) {
      const {
        id,
        role: { isAdmin },
      } = admin;
      return {
        id,
        isAdmin,
      };
    } else throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
  }

  /**
   * 检验注册是否合法
   * @param registerInfo 注册信息
   */
  async validateRegister(registerInfo: RegisterInfoDTO) {
    const { username, nickname, password } = registerInfo;
    if (!(await this.checkUserNameUnique(username)))
      throw new HttpException('账号已存在', HttpStatus.BAD_REQUEST);
    if (!(await this.checkNickNameUnique(nickname)))
      throw new HttpException('昵称已存在', HttpStatus.BAD_REQUEST);
    if (username === password)
      throw new HttpException('账号与密码不能相同', HttpStatus.BAD_REQUEST);
  }

  async changePassword(id: number, changePassword: ChangePasswordInfoDTO) {
    const md5OldPassword = createHash('md5').update(changePassword.oldpassword).digest('hex');
    const md5NewPassword = createHash('md5').update(changePassword.newpassword).digest('hex');
    if (!await this.checkOldPasswordisEqual(id, md5OldPassword))
      throw new HttpException('原密码不正确', HttpStatus.BAD_REQUEST);
    else if (changePassword.oldpassword === changePassword.newpassword)
      throw new HttpException('新密码不能与原密码相同', HttpStatus.BAD_REQUEST);
    else if ((await this.findUser({ id })).userName === changePassword.newpassword)
      throw new HttpException('账号与密码不能相同', HttpStatus.BAD_REQUEST);
    await this.userRepository.createQueryBuilder('user').update().set({
      password: md5NewPassword,
    }).where('user.user_id=:id', { id }).execute();
    return true;
  }

  async checkUserNameUnique(userName: string) {
    const user = await this.findUser({ userName });
    if (user) return false;
    return true;
  }

  async checkNickNameUnique(nickName: string) {
    const user = await this.findUser({ nickName });
    if (user) return false;
    return true;
  }

  /**
   * 检查原密码与新密码是否相等
   * @param id id
   * @param password 密码
   * @returns 原密码是否相等
   */
  async checkOldPasswordisEqual(id: number, password: string) {
    const user = await this.findUser({ id });
    if (user.password === password) return true;
    return false;
  }

  /**
   * 寻找管理员
   * @param where 条件
   * @returns 管理员信息
   */
  async findAdmin(where: FindConditions<User>) {
    const admin = await this.userRepository.findOne({
      select: ['id', 'password', 'role'],
      where: {
        ...where,
        isDelete: false,
        role: { isAdmin: true },
      },
      relations: ['role'],
    });
    if (admin) return admin;
    return null;
  }

  /**
   * 寻找用户
   * @param where 条件
   * @returns 用户信息
   */
  async findUser(where: FindConditions<User>) {
    const user = await this.userRepository.findOne({
      select: ['id', 'password', 'role', 'userName'],
      where: {
        ...where,
        isDelete: false,
        role: { isAdmin: false },
      },
      relations: ['role'],
    });
    if (user) return user;
    return null;
  }

  /**
   * 寻找所有使用者
   * @param where 条件
   * @returns 用户信息
   */
  async findAllUser(where: FindConditions<User>) {
    const user = await this.userRepository.findOne({
      select: ['id', 'password', 'role'],
      where: {
        ...where,
        isDelete: false,
      },
      relations: ['role'],
    });
    if (user) return user;
    return null;
  }
}
