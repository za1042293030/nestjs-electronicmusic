import {
  Controller,
  Get,
  Req,
  Headers,
  Query,
  ParseIntPipe,
  Post,
  UseGuards,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { DynamicService } from 'src/service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JWT } from 'src/enum';
import { IUserRequest } from 'src/typings';
import { SendDynamicInfoDTO } from 'src/dto';

@Controller('/api/dynamic')
export class DynamicController {
  constructor(private readonly dynamicService: DynamicService) {}

  @Get('/getRecommendDynamics')
  async getRecommendDynamics(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.dynamicService.getRecommendDynamics(pageIndex, pageSize, protocol, host);
  }

  @Get('/getLatestDynamics')
  async getLatestDynamics(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.dynamicService.getLatestDynamics(pageIndex, pageSize, protocol, host);
  }

  @Post('/sendDynamic')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async sendDynamic(
    @Req() { user }: IUserRequest,
    @Body(ValidationPipe) sendDynamicInfo: SendDynamicInfoDTO,
  ) {
    return this.dynamicService.sendDynamic(sendDynamicInfo, user);
  }

  @Get('/getDynamicById')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async getDynamicById(
    @Query('id', ParseIntPipe) id: number,
    @Req() { protocol }: Request,
    @Headers('host') host: string,
  ) {
    return this.dynamicService.getDynamicById(id, protocol, host);
  }

  @Get('/getDynamicByUserId')
  async getDynamicByUserId(
    @Query('id', ParseIntPipe) id: number,
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return this.dynamicService.getDynamicByUserId(id, pageIndex, pageSize, protocol, host);
  }
}
