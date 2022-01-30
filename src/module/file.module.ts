import { FileService } from 'src/service/file.service';
import { FileController } from 'src/controller/file.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from 'src/entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
