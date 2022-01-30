import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/controller/user.controller';
import { File, Role, Route, User } from 'src/entity';
import { UserService } from 'src/service/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Route, Role])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
