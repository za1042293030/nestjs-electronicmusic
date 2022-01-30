import { Controller, Get, Req, Headers, Query, ParseIntPipe } from '@nestjs/common';
import { Request } from 'express';
import { SearchService } from 'src/service';

@Controller('/api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/songs')
  async searchSongs(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('key') key: string,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return this.searchService.searchSongs(key, pageIndex, pageSize, host, protocol);
  }

  @Get('/albums')
  async searchAlbums(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('key') key: string,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return this.searchService.searchAlbums(key, pageIndex, pageSize, protocol, host);
  }

  @Get('/users')
  async searchUsers(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('key') key: string,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return this.searchService.searchUsers(key, pageIndex, pageSize, protocol, host);
  }

  @Get('/artists')
  async searchArtists(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('key') key: string,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return this.searchService.searchUsers(key, pageIndex, pageSize, protocol, host, 2);
  }

  @Get('/playlists')
  async searchPlayLists(
    @Req() { protocol }: Request,
    @Headers('host') host: string,
    @Query('key') key: string,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return this.searchService.searchPlayLists(key, pageIndex, pageSize, protocol, host);
  }
}
