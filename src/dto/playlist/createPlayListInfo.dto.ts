import { IsString, Length } from 'class-validator';

export class CreatePlayListInfoDTO{
  @IsString({message:'歌单名称为字符串'})
  @Length(1, 20, { message: '歌单名称长度在1到20个字符' })
  name:string;
}
