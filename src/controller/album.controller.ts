import { Controller, Get, Req, Headers, Query, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { Request } from 'express';
import { AlbumService } from 'src/service';

@Controller('/api/album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}
  @Get('/getRecommendAlbums')
  async getRecommendSongs(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('size', ParseIntPipe) size: number,
  ) {
    return await this.albumService.getRecommendAlbums(size, protocol, host);
  }
  @Get('/getAlbumById')
  async getAlbumById(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    return await this.albumService.getAlbumById(id, protocol, host);
  }
}
