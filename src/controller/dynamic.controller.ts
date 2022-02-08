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
import { AuthGuard } from '@nestjs/passport';
import { JWT } from 'src/enum';
import { IUserRequest } from 'src/typings';
import { SendDynamicInfoDTO, IDInfoDTO } from 'src/dto';
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
}
