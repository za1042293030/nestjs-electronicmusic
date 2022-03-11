import { Controller, Get, ParseIntPipe, Query, ParseBoolPipe } from '@nestjs/common';
import { SongService } from 'src/service';
import { ApiTags } from '@nestjs/swagger';
import { NumberMaxPipe } from 'src/pipe';

@ApiTags('歌曲')
@Controller('/api/song')
export class SongController {
  constructor(private readonly songService: SongService) {
  }

  @Get('/getSongsByStyleId')
  async getSongsByStyleId(
    @Query('id', ParseIntPipe) id: number,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(24)) pageSize: number,
  ) {
    return await this.songService.getSongsByStyleId(id, pageIndex, pageSize);
  }

  @Get('/getRecommendSongs')
  async getRecommendSongs(
    @Query('size', ParseIntPipe, new NumberMaxPipe(24)) size: number,
    @Query('style', ParseBoolPipe) style: boolean,
  ) {
    return await this.songService.getRecommendSongs(size, style);
  }

  @Get('/getSongById')
  async getSongById(
    @Query('id', ParseIntPipe) id: number,
  ) {
    return await this.songService.getSongById(id);
  }

  @Get('/getSongsByNameOrProducer')
  async getSongsByNameOrProducer(
    @Query('key') key: string,
  ) {
    return await this.songService.getSongsByNameOrProducer(key);
  }
}
