import { HttpException, HttpStatus } from '@nestjs/common';
import { IFile } from 'src/typings';
import stringRandom from 'string-random';
import { Request } from 'express';
import { Style } from 'src/entity';

/**
 * 工具类
 */
class Util {
  /**
   * 获取配置项
   * @param key 键值
   * @returns 配置项的值
   */
  static getEnv(key: string): string {
    return process.env[key];
  }

  /**
   * 生成文件名
   * @param file 文件原始名
   * @returns 文件名
   */
  static generateFileName(originalname: string): string {
    const arr = originalname.split('.');
    return `${stringRandom(32)}.${arr[arr.length - 1]}`;
  }

  /**
   * 生成URL
   * @param protocol 协议
   * @param host 主机名（ip）与端口
   * @param path 路径
   * @returns http地址
   */
  static generateUrl(protocol: string, host: string, path: string): string {
    return `${protocol}://${host}${path}`;
  }

  /**
   * 图片文件过滤
   * @param _req 请求
   * @param file 文件
   * @param cb 回调
   */
  static imageFileFilter(
    _req: Request,
    file: IFile,
    cb: (error: Error, acceptFile: boolean) => void,
  ) {
    if (file.originalname.length > 20)
      cb(new HttpException('文件名不能超过20个字符', HttpStatus.BAD_REQUEST), false);
    else if (file.originalname.split('.').length > 2)
      cb(new HttpException('文件名不可以包含多个英文小数点（.）', HttpStatus.BAD_REQUEST), false);
    else if (!file.mimetype.includes('image'))
      cb(new HttpException('上传的不是图片', HttpStatus.BAD_REQUEST), false);
    else cb(null, true);
  }

  /**
   * 音乐文件过滤
   * @param _req 请求
   * @param file 文件
   * @param cb 回调
   */
  static songFileFilter(
    _req: Request,
    file: IFile,
    cb: (error: Error, acceptFile: boolean) => void,
  ) {
    if (file.originalname.length > 20)
      cb(new HttpException('文件名不能超过20个字符', HttpStatus.BAD_REQUEST), false);
    else if (file.originalname.split('.').length > 2)
      cb(new HttpException('文件名不可以包含多个英文小数点（.）', HttpStatus.BAD_REQUEST), false);
    else if (!file.mimetype.includes('audio'))
      cb(new HttpException('上传的不是音频', HttpStatus.BAD_REQUEST), false);
    else cb(null, true);
  }

  static StyleSet(_styles: Style[]) {
    if (!_styles) return;
    const setStyleIds = [...new Set(_styles.map(style => style.id))];
    let styles: Style[] = [];
    for (let i = 0; i < _styles.length; i++) {
      let j = 0;
      while (j < setStyleIds.length) {
        if (_styles[i].id === setStyleIds[j]) {
          setStyleIds.splice(j, 1);
          styles.push(_styles[i]);
        }
        j++;
      }
    }
    return styles;
  }
}
export default Util;
