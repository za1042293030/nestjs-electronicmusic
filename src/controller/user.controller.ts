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
import { ApiTags } from '@nestjs/swagger';
import { NumberMaxPipe } from '../pipe/numberMax.pipe';

@ApiTags('用户')
@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @UseGuards(AuthGuard(JWT.ADMIN))
  @Get('/getUserList')
  async getUserList(
    @Query('orderby') orderby: string,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(20)) pageSize: number,
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
    @Query('id', ParseIntPipe) id: number,
  ) {
    return this.userService.getUserInfo(id);
  }

  @Get('/getAdminInfo')
  @UseGuards(AuthGuard(JWT.ADMIN))
  getUserInfoById(
    @Query('id', ParseIntPipe) id: number,
  ) {
    return this.userService.getAdminInfo(id);
  }
}
