import { DynamicService } from './../service/dynamic.service';
import { DynamicController } from './../controller/dynamic.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dynamic } from 'src/entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dynamic])],
  controllers: [DynamicController],
  providers: [DynamicService],
})
export class DynamicModule {}
