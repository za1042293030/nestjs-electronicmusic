import { IsInt } from 'class-validator';

export class AddSongToPlayListInfoDTO {
  @IsInt({ message: '歌单id为数字' })
  playListId: number;

  @IsInt({ message: '歌曲id为数字' })
  songId: number;
}
