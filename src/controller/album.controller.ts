import { Controller, Get, Req, Headers, Query, ParseIntPipe } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AlbumService } from 'src/service';
import { NumberMaxPipe } from '../pipe/numberMax.pipe';

@ApiTags('专辑')
@Controller('/api/album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {
  }

  @Get('/getRecommendAlbums')
  async getRecommendSongs(
    @Headers('host') host: string,
    @Query('size', ParseIntPipe, new NumberMaxPipe(40)) size: number,
  ) {
    return await this.albumService.getRecommendAlbums(size);
  }

  @Get('/getAlbumById')
  async getAlbumById(
    @Headers('host') host: string,
    @Query('id', ParseIntPipe) id: number,
  ) {
    return await this.albumService.getAlbumById(id);
  }
}
