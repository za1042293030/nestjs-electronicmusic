import {
  PlaylistService,
  SearchService,
  SongService,
  UserService,
} from 'src/service';
import { SearchController } from 'src/controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album, PlayList, Song, User } from 'src/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Song, Album, User, PlayList])],
  controllers: [SearchController],
  providers: [SearchService, SongService, UserService, PlaylistService],
})
export class SearchModule {}
