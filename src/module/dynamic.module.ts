import { DynamicService } from './../service/dynamic.service';
import { DynamicController } from './../controller/dynamic.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dynamic } from 'src/entity';
import { JwtModule } from '@nestjs/jwt';
import Util from 'src/util';
import { JWT_SECRET, TOKEN_EXP } from 'src/constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dynamic]),
    JwtModule.register({
      secret: Util.getEnv(JWT_SECRET),
      signOptions: { expiresIn: Util.getEnv(TOKEN_EXP) },
    }),
  ],
  controllers: [DynamicController],
  providers: [DynamicService],
})
export class DynamicModule {}
