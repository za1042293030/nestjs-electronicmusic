import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length, Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateSongDTO {

  @IsInt({ message: '歌曲封面id为整数数字' })
  @Min(1, { message: '歌曲封面上传错误,请检查' })
  cover: number;

  @IsOptional()
  @IsString({ message: '无效的歌曲描述' })
  @Length(0, 220, { message: '歌曲描述至多220位' })
  describe: string;

  @IsInt({ message: '歌曲文件id为整数数字' })
  @Min(1, { message: '歌曲文件上传错误,请检查' })
  file: number;

  @IsString({ message: '无效的歌曲名称' })
  @Length(1, 20, { message: '专辑歌曲至少1位，至多20位' })
  name: string;

  @IsArray({ message: '制作人为数组' })
  @ArrayNotEmpty({ message: '制作人数组不能为空' })
  @ArrayMaxSize(6, { message: '制作人最多选择6个' })
  @IsInt({ each: true, message: '制作人id需要为整数数字' })
  artist: number[];

  @IsArray({ message: '风格为数组' })
  @ArrayNotEmpty({ message: '风格数组不能为空' })
  @ArrayMaxSize(5, { message: '风格最多选择5个' })
  @IsInt({ each: true, message: '风格id需要为整数数字' })
  style: number[];
}

export class CreateAlbumDTO {

  @IsInt({ message: '专辑封面id为整数数字' })
  @Min(1, { message: '专辑封面上传错误,请检查' })
  cover: number;

  @IsOptional()
  @IsString({ message: '无效的专辑描述' })
  @Length(0, 1000, { message: '专辑描述至多1000位' })
  describe: string;

  @IsString({ message: '无效的专辑名称' })
  @Length(1, 20, { message: '专辑名称至少1位，至多20位' })
  name: string;

  @IsArray({ message: '歌曲为数组' })
  @ArrayNotEmpty({ message: '歌曲数组不能为空' })
  @ArrayMaxSize(20, { message: '歌曲数组长度最长为20' })
  @ValidateNested({ each: true })
  @Type(() => CreateSongDTO)
  songs: CreateSongDTO[];
}
