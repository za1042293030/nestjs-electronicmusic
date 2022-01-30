import { FileService } from 'src/service/file.service';
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
    FileInterceptor('file', {
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
    @Req() { protocol, user }: IUserRequest,
  ) {
    const { path, id } = await this.fileService.upload(file, 'img', user);
    return {
      src: Util.generateUrl(protocol, host, path),
      id,
    };
  }

  /**
   * 上传图片
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
    @Req() { protocol, user }: IUserRequest,
  ) {
    const { path, id } = await this.fileService.upload(file, 'song', user);
    return {
      path: Util.generateUrl(protocol, host, path),
      id,
    };
  }
}
