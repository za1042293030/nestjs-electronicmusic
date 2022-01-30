import { AlbumService } from 'src/service';
import { AlbumController } from 'src/controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from 'src/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Album])],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [AlbumService],
})
export class AlbumModule {}
