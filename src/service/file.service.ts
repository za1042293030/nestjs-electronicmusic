import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createWriteStream, constants } from 'fs';
import { access, mkdir } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
import { File } from 'src/entity';
import { IFile, IPayload } from 'src/typings';
import Util from 'src/util';
import { Repository } from 'typeorm';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {
  }

  /**
   * 上传文件
   * @param file 文件
   * @returns 路径
   */
  async upload(file: IFile, dir: string, user: IPayload) {
    await this.validationDir(dir);
    return this.writeFile(file, dir, user);
  }

  /**
   * 写入文件
   * @param file 文件
   * @returns 路径
   */
  async writeFile(file: IFile, dir: string, user: IPayload) {
    const { size, originalname } = file;
    const originalNameArr = originalname.split('.');
    const fileName = Util.generateFileName(originalname);
    const writeStream = createWriteStream(join(cwd(), '.', 'upload', dir, fileName));
    if (!writeStream.writable)
      throw new HttpException('文件不可写入', HttpStatus.SERVICE_UNAVAILABLE);
    writeStream.on('error', error => {
      throw new HttpException(error.stack, HttpStatus.INTERNAL_SERVER_ERROR);
    });
    writeStream.write(file.buffer);
    writeStream.close();
    writeStream.end();
    const {
      identifiers: [{ id }],
    } = await this.fileRepository
      .createQueryBuilder()
      .insert()
      .values([
        {
          size,
          createTime: new Date(),
          createBy: () => user.id.toString(),
          name: fileName.split('.')[0],
          original: originalname,
          type: originalNameArr[originalNameArr.length - 1].toLowerCase(),
          dir,
        },
      ])
      .execute();
    return {
      path: `/${dir}/${fileName}`,
      id,
    };
  }

  /**
   * 检查某个文件是否可以访问
   * @param dir 文件夹名
   */
  async validationDir(dir: string) {
    try {
      await access(join(cwd(), '.', 'upload', dir), constants.R_OK | constants.F_OK);
    } catch {
      await mkdir(join(cwd(), '.', 'upload', dir), { recursive: true });
    }
  }

  /**
   * 检查某个文件是否可以访问
   * @param dir 文件夹名
   * @param fileName 文件名
   */
  async validationFile(dir: string, fileName: string) {
    try {
      await access(join(cwd(), '.', 'upload', dir, fileName), constants.R_OK | constants.F_OK);
    } catch {
      throw new HttpException('没有该文件存在', HttpStatus.NOT_FOUND);
    }
  }
}
