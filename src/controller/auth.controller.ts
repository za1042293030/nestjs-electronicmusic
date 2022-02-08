import {
  Controller,
  Post,
  ValidationPipe,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginInfoDTO, RegisterInfoDTO, TokenDTO } from 'src/dto';
import { AuthService } from 'src/service/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IUserRequest } from 'src/typings';
import { ChangePasswordInfoDTO } from 'src/dto';
import { JWT } from 'src/enum';

@ApiTags('认证')
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  /**
   * 登录验证，成功后下发token
   * @param user 用户
   * @returns tokenDTO
   */
  @Post('/login')
  async login(@Body(ValidationPipe) { username, password }: LoginInfoDTO): Promise<TokenDTO> {
    const { id, isAdmin } = await this.authService.validateLogin(username, password);
    return this.authService.login(id, isAdmin);
  }

  @Post('/loginAdmin')
  async loginAdmin(@Body(ValidationPipe) { username, password }: LoginInfoDTO): Promise<TokenDTO> {
    const { id, isAdmin } = await this.authService.validateLoginAdmin(username, password);
    return this.authService.login(id, isAdmin);
  }

  @Post('/register')
  async register(@Body(ValidationPipe) registerInfo: RegisterInfoDTO) /* : Promise<TokenDTO> */ {
    await this.authService.validateRegister(registerInfo);
    return this.authService.register(registerInfo);
  }

  @Get('/checkUserNameUnique')
  async checkUserNameUnique(@Query('username') userName: string) {
    return await this.authService.checkUserNameUnique(userName);
  }

  @Get('/checkNickNameUnique')
  async checkNickNameUnique(@Query('nickname') nickName: string) {
    return await this.authService.checkNickNameUnique(nickName);
  }

  @Post('/changePassword')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async changePassword(@Req() { user }: IUserRequest, @Body(ValidationPipe) changePasswordInfo: ChangePasswordInfoDTO) {
    return await this.authService.changePassword(user.id, changePasswordInfo);
  }
}
