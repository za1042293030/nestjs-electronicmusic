import { PlaylistModule } from './module/playlist.module';
import { CommontModule } from './module/comment.module';
import { AlbumModule } from './module/album.module';
import { SearchModule } from './module/search.module';
import { join } from 'path';
import {
  FileModule,
  DynamicModule,
  SongModule,
  StyleModule,
  AuthModule,
  UserModule,
} from 'src/module';
import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import Util from 'src/util';
import { DatabaseConfig } from 'src/enum';

@Module({
  imports: [
    PlaylistModule,
    CommontModule,
    AlbumModule,
    DynamicModule,
    SongModule,
    StyleModule,
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'upload'),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: Util.getEnv(DatabaseConfig.DATABASE_HOST),
      port: parseInt(Util.getEnv(DatabaseConfig.DATABASE_PORT)),
      username: Util.getEnv(DatabaseConfig.DATABASE_USERNAME),
      password: Util.getEnv(DatabaseConfig.DATABASE_PWD),
      database: Util.getEnv(DatabaseConfig.DATABASE_NAME),
      entities: ['dist/entity/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    SearchModule,
    FileModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
