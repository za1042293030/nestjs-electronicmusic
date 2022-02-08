import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class UpdatePlayListInfoDTO {
  @IsInt({ message: '歌单id为数字' })
  id: number;

  @IsOptional()
  @IsString({ message: '歌单名称为字符串' })
  @Length(1, 20, { message: '歌单名称长度在1到20个字符' })
  name?: string;

  @IsOptional()
  @IsString({ message: '歌单名称为字符串' })
  @Length(0, 220, { message: '歌单简介长度最多220个字符' })
  describe?: string;

  @IsOptional()
  @IsInt({ message: '歌单封面id为数字' })
  coverId?: number;
}
