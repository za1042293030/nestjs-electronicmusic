import { SongService } from 'src/service';
import { SongController } from 'src/controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from 'src/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Song])],
  controllers: [SongController],
  providers: [SongService],
  exports: [SongService],
})
export class SongModule {}
