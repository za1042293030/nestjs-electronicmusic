import { IsInt } from 'class-validator';

export class IDInfoDTO{
  @IsInt({ message: '歌单id为数字' })
  id: number;
}
