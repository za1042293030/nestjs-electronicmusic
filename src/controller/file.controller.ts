import { FileService } from 'src/service';
import {
  Controller,
  Post,
  Headers,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IFile, IUserRequest } from 'src/typings';
import Util from 'src/util';
import { AuthGuard } from '@nestjs/passport';
import { JWT } from 'src/enum';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('文件')
@Controller('/api/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * 上传图片
   * @param file 文件
   * @returns 文件URL
   */
  @Post('/uploadImage')
  @UseInterceptors(
    FileInterceptor('img', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: Util.imageFileFilter,
    }),
  )
  @UseGuards(AuthGuard(JWT.LOGIN))
  async uploadImage(
    @UploadedFile() file: IFile,
    @Headers('host') host: string,
    @Req() { user }: IUserRequest,
  ) {
    const { path, id } = await this.fileService.upload(file, 'img', user);
    return {
      src: Util.generateUrl(path),
      id,
    };
  }

  /**
   * 上传歌曲
   * @param file 文件
   * @returns 文件URL
   */
  @Post('/uploadSong')
  @UseInterceptors(
    FileInterceptor('song', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: Util.songFileFilter,
    }),
  )
  @UseGuards(AuthGuard(JWT.LOGIN))
  async uploadSong(
    @UploadedFile() file: IFile,
    @Headers('host') host: string,
    @Req() { user }: IUserRequest,
  ) {
    const { path, id } = await this.fileService.upload(file, 'song', user);
    return {
      path: Util.generateUrl(path),
      id,
    };
  }

  /**
   * 上传头像
   * @param file 文件
   * @returns 文件URL
   */
  @Post('/uploadAvatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 1 * 1024 * 1024,
      },
      fileFilter: Util.imageFileFilter,
    }),
  )
  @UseGuards(AuthGuard(JWT.LOGIN))
  async uploadAvatar(
    @UploadedFile() file: IFile,
    @Headers('host') host: string,
    @Req() { user }: IUserRequest,
  ) {
    const { path, id } = await this.fileService.upload(file, 'avatar', user);
    return {
      src: Util.generateUrl(path),
      id,
    };
  }
}
