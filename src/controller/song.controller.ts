import { Controller, Get, ParseIntPipe, Query, Req, Headers, ParseBoolPipe } from '@nestjs/common';
import { SongService } from 'src/service';
import { Request } from 'express';

@Controller('/api/song')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Get('/getSongsByStyleId')
  async getSongsByStyleId(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('id', ParseIntPipe) id: number,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.songService.getSongsByStyleId(id, pageIndex, pageSize, protocol, host);
  }

  @Get('/getRecommendSongs')
  async getRecommendSongs(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('size', ParseIntPipe) size: number,
    @Query('style', ParseBoolPipe) style: boolean,
  ) {
    return await this.songService.getRecommendSongs(size, protocol, host, style);
  }

  @Get('/getSongById')
  async getSongById(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    return await this.songService.getSongById(id, protocol, host);
  }

  @Get('/getSongsByNameOrProducer')
  async getSongsByNameOrProducer(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('key') key: string,
  ) {
    return await this.songService.getSongsByNameOrProducer(key, protocol, host);
  }
}
