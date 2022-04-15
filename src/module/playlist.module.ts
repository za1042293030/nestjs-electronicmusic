import { PlaylistService } from 'src/service';
import { PlaylistController } from 'src/controller';
import { Module } from '@nestjs/common';
import { PlayList } from 'src/entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongModule } from '.';

@Module({
  imports: [TypeOrmModule.forFeature([PlayList]), SongModule],
  controllers: [PlaylistController],
  providers: [PlaylistService],
  exports: [PlaylistService],
})
export class PlaylistModule {}
