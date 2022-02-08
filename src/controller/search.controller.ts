import { Controller, Get, Req, Headers, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SearchService } from 'src/service';
import { NumberMaxPipe } from '../pipe/numberMax.pipe';

@ApiTags('搜索')
@Controller('/api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/songs')
  async searchSongs(
    @Query('key') key: string,
    @Query('pageIndex', ParseIntPipe, new NumberMaxPipe(20)) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(20)) pageSize: number,
  ) {
    return this.searchService.searchSongs(key, pageIndex, pageSize);
  }

  @Get('/albums')
  async searchAlbums(
    @Query('key') key: string,
    @Query('pageIndex', ParseIntPipe, new NumberMaxPipe(20)) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(20)) pageSize: number,
  ) {
    return this.searchService.searchAlbums(key, pageIndex, pageSize);
  }

  @Get('/users')
  async searchUsers(
    @Query('key') key: string,
    @Query('pageIndex', ParseIntPipe, new NumberMaxPipe(20)) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(20)) pageSize: number,
  ) {
    return this.searchService.searchUsers(key, pageIndex, pageSize);
  }

  @Get('/artists')
  async searchArtists(
    @Query('key') key: string,
    @Query('pageIndex', ParseIntPipe, new NumberMaxPipe(20)) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(20)) pageSize: number,
  ) {
    return this.searchService.searchUsers(key, pageIndex, pageSize, 2);
  }

  @Get('/playlists')
  async searchPlayLists(
    @Query('key') key: string,
    @Query('pageIndex', ParseIntPipe, new NumberMaxPipe(20)) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(20)) pageSize: number,
  ) {
    return this.searchService.searchPlayLists(key, pageIndex, pageSize);
  }
}
