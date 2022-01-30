import { Controller, Get, Req, Headers, Query, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { PlaylistService } from 'src/service';

@Controller('/api/playlist')
export class PlaylistController {
  constructor(private readonly playListSerivce: PlaylistService) {}

  @Get('/getRecommendPlayLists')
  async getRecommendPlayLists(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('size', ParseIntPipe) size: number,
  ) {
    return await this.playListSerivce.getRecommendPlayLists(size, protocol, host);
  }

  @Get('/getPlayListsByStyleId')
  async getPlayListsByStyleId(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('id', ParseIntPipe) id: number,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.playListSerivce.getPlayListsByStyleId(
      id,
      pageIndex,
      pageSize,
      protocol,
      host,
    );
  }

  @Get('/getPlayListsById')
  async getPlayListsById(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    return await this.playListSerivce.getPlayListsById(id, protocol, host);
  }

  @Get('/getPlayListsByUserId')
  async getPlayListsByUserId(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('id', ParseIntPipe) id: number,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.playListSerivce.getPlayListsByUserId(id, pageIndex, pageSize, protocol, host);
  }
}
