import { StyleService } from './../service/style.service';
import { StyleController } from './../controller/style.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Style } from 'src/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Style])],
  controllers: [StyleController],
  providers: [StyleService],
})
export class StyleModule {}
