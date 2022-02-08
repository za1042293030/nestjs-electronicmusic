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
import { ApiTags } from '@nestjs/swagger';
import { PlaylistService } from 'src/service';
import { AuthGuard } from '@nestjs/passport';
import { IUserRequest } from 'src/typings';
import { CreatePlayListInfoDTO, UpdatePlayListInfoDTO, IDInfoDTO, AddSongToPlayListInfoDTO } from 'src/dto';
import { JWT } from 'src/enum';
import { NumberMaxPipe } from 'src/pipe';

@ApiTags('歌单')
@Controller('/api/playlist')
export class PlaylistController {
  constructor(private readonly playListService: PlaylistService) {
  }

  @Get('/getRecommendPlayLists')
  async getRecommendPlayLists(
    @Query('size', ParseIntPipe, new NumberMaxPipe(24)) size: number,
  ) {
    return await this.playListService.getRecommendPlayLists(size);
  }

  @Get('/getPlayListsByStyleId')
  async getPlayListsByStyleId(
    @Query('id', ParseIntPipe) id: number,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(24)) pageSize: number,
  ) {
    return await this.playListService.getPlayListsByStyleId(
      id,
      pageIndex,
      pageSize,
    );
  }

  @Get('/getPlayListsById')
  async getPlayListsById(
    @Query('id', ParseIntPipe) id: number,
  ) {
    return await this.playListService.getPlayListsById(id);
  }

  @Get('/getPlayListsByUserId')
  async getPlayListsByUserId(
    @Query('id', ParseIntPipe) id: number,
    @Query('pageIndex', ParseIntPipe) pageIndex: number,
    @Query('pageSize', ParseIntPipe, new NumberMaxPipe(24)) pageSize: number,
  ) {
    return await this.playListService.getPlayListsByUserId(id, pageIndex, pageSize);
  }

  @Post('/createPlayList')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async createPlayList(
    @Req() { user }: IUserRequest,
    @Body(ValidationPipe) createPlayListInfo: CreatePlayListInfoDTO,
  ) {
    return await this.playListService.createPlayList(createPlayListInfo, user.id);
  }

  @Post('/updatePlayList')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async updatePlayList(
    @Req() { user }: IUserRequest,
    @Body(ValidationPipe) updatePlayListInfo: UpdatePlayListInfoDTO,
  ) {
    return await this.playListService.updatePlayList(updatePlayListInfo, user.id);
  }

  @Post('/deletePlayList')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async deletePlayList(
    @Req() { user }: IUserRequest,
    @Body(ValidationPipe) deletePlayListInfo: IDInfoDTO,
  ) {
    return await this.playListService.deletePlayList(deletePlayListInfo, user.id);
  }

  @Post('/addSongToPlayList')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async addSongToPlayList(
    @Req() { user }: IUserRequest,
    @Body(ValidationPipe) addSongToPlayList: AddSongToPlayListInfoDTO,
  ) {
    return await this.playListService.addSongToPlayList(addSongToPlayList, user.id);
  }

  @Post('/deletePlayListSong')
  @UseGuards(AuthGuard(JWT.LOGIN))
  async deletePlayListSong(
    @Req() { user }: IUserRequest,
    @Body(ValidationPipe) deleteSongFromPlayListInfo: AddSongToPlayListInfoDTO,
  ) {
    return await this.playListService.deletePlayListSong(deleteSongFromPlayListInfo, user.id);
  }
}
