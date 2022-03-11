import {
  Body,
  Controller,
  Get,
  Headers, ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { DynamicService } from 'src/service';
import { AuthGuard } from '@nestjs/passport';
import { AuditStatus, JWT } from 'src/enum';
import { IUserRequest } from 'src/typings';
import { IDInfoDTO, SendDynamicInfoDTO } from 'src/dto';
import { ApiTags } from '@nestjs/swagger';
import { NumberMaxPipe } from 'src/pipe';

@ApiTags('动态')
@Controller('/api/dynamic')
export class DynamicController {
  constructor(private readonly dynamicService: DynamicService) {
  }

  @Get('/getRecommendDynamics')
  async getRecommendDynamics(
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(10)) pageSize: number,
  ) {
    return await this.dynamicService.getRecommendDynamics(pageIndex, pageSize);
  }

  @Get('/getLatestDynamics')
  async getLatestDynamics(
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(10)) pageSize: number,
  ) {
    return await this.dynamicService.getLatestDynamics(pageIndex, pageSize);
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
  ) {
    return this.dynamicService.getDynamicById(id);
  }

  @Get('/getDynamicByUserId')
  async getDynamicByUserId(
    @Query('id', ParseIntPipe) id: number,
    @Headers('token') token: string | undefined,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(10)) pageSize: number,
  ) {
    return this.dynamicService.getDynamicByUserId(id, pageIndex, pageSize, token);
  }

  @Post('/deleteDynamic')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async deleteDynamic(
    @Req() { user }: IUserRequest,
    @Body(ValidationPipe) deleteDynamicInfo: IDInfoDTO,
  ) {
    return await this.dynamicService.deleteDynamic(deleteDynamicInfo, user.id);
  }

  @Get('/getApprovingDynamics')
  @UseGuards(AuthGuard(JWT.ADMIN))
  async getApprovingDynamics(
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(100)) pageSize: number,
  ) {
    return await this.dynamicService.getApprovingDynamics(pageIndex, pageSize);
  }

  @Post('/changeDynamicsAuditStatus')
  @UseGuards(AuthGuard(JWT.ADMIN))
  async changeDynamicsAuditStatus(
    @Query('id', ParseIntPipe) id: number,
    @Query('status', new ParseEnumPipe(AuditStatus)) status: AuditStatus,
  ) {
    return await this.dynamicService.changeDynamicsAuditStatus(id, status);
  }
}
