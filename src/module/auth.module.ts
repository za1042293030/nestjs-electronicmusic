import Util from 'src/util';
import { AuthController } from 'src/controller/auth.controller';
import { Module } from '@nestjs/common';
import { AuthService } from 'src/service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET, TOKEN_EXP } from 'src/constant';
import { PassportModule } from '@nestjs/passport';
import { LoginStrategy } from 'src/auth/login.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity';
import { AdminStrategy } from 'src/auth/admin.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: Util.getEnv(JWT_SECRET),
      signOptions: { expiresIn: Util.getEnv(TOKEN_EXP) },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginStrategy, AdminStrategy],
})
export class AuthModule {}
