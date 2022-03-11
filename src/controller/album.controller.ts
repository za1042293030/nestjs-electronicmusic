import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
  Post,
  Body,
  ValidationPipe, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AlbumService } from 'src/service';
import { NumberMaxPipe } from 'src/pipe';
import { AuthGuard } from '@nestjs/passport';
import { JWT } from 'src/enum';
import { CreateAlbumDTO } from '../dto';
import { IUserRequest } from '../typings';

@ApiTags('专辑')
@Controller('/api/album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {
  }

  @Get('/getRecommendAlbums')
  async getRecommendSongs(
    @Query('size', ParseIntPipe, new NumberMaxPipe(40)) size: number,
  ) {
    return await this.albumService.getRecommendAlbums(size);
  }

  @Get('/getAlbumById')
  async getAlbumById(
    @Query('id', ParseIntPipe) id: number,
  ) {
    return await this.albumService.getAlbumById(id);
  }

  @Get('/getAlbumByUserId')
  async getAlbumByUserId(
    @Query('id', ParseIntPipe) id: number,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(10)) pageSize: number,
  ) {
    return await this.albumService.getAlbumByUserId(id, pageIndex, pageSize);
  }

  @Get('/getApprovingAlbums')
  @UseGuards(AuthGuard(JWT.ADMIN))
  async getApprovingAlbums(
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(50)) pageSize: number,
  ) {
    return await this.albumService.getApprovingAlbums(pageIndex, pageSize);
  }

  @Post('/createAlbum')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async createAlbum(
    @Body(ValidationPipe) createAlbumInfo: CreateAlbumDTO,
    @Req() { user }: IUserRequest,
  ) {
    return await this.albumService.createAlbum(createAlbumInfo, user.id);
  }
}
