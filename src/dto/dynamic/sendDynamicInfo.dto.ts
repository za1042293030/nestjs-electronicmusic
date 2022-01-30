import {
  Allow,
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

class SendDynamicInfoDTO {
  @IsNotEmpty({ message: '内容不能为空' })
  @IsString({ message: '无效的内容' })
  @Length(1, 500, { message: '内容长度在1到500个字符' })
  content: string;

  @IsOptional()
  @IsInt({ message: '歌曲id需要为整数数字' })
  songId?: number;

  @IsOptional()
  @IsArray({ message: '图片id必须为数组' })
  @IsInt({ each: true, message: '图片id需要为整数数字' })
  @ArrayMaxSize(9, { message: '图片id最多为9个' })
  @ArrayUnique({ message: '图片id必须唯一' })
  @ArrayNotEmpty({ message: '图片id数组不能为空' })
  pictureIds?: number[];
}
export { SendDynamicInfoDTO };
