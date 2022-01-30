import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/service/user.service';
import { RegisterInfoDTO } from 'src/dto';
import { JWT } from 'src/enum';
import { Request } from 'express';

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard(JWT.ADMIN))
  @Get('/getUserList')
  async getUserList(
    @Query('orderby') orderby: string,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return this.userService.getUserList(orderby, pageIndex, pageSize);
  }

  @Post('/addUser')
  addUser(@Body(ValidationPipe) user: RegisterInfoDTO): Promise<number> {
    return this.userService.addUser(user);
  }

  @Get('/getUserInfo')
  @UseGuards(AuthGuard(JWT.LOGIN))
  getUserInfo(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    return this.userService.getUserInfo(id, protocol, host);
  }

  @Get('/getAdminInfo')
  @UseGuards(AuthGuard(JWT.ADMIN))
  getUserInfoById(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    return this.userService.getAdminInfo(id, protocol, host);
  }
}
