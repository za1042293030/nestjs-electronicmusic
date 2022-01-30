import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { CommentType } from 'src/enum';

export class SendCommentInfoDTO {
  @IsNotEmpty({ message: '内容不能为空' })
  @IsString({ message: '无效的内容' })
  @Length(1, 200, { message: '内容长度在1到200个字符' })
  content: string;

  @IsInt({ message: 'id需要为整数数字' })
  id: number;

  @IsIn([CommentType.DYNAMIC, CommentType.ALBUM, CommentType.PLAYLIST, CommentType.SONG], {
    message: "类型需要为'0'（动态）或'1'（专辑）或'2'（歌单）或'3'（歌曲）",
  })
  type: CommentType;

  @IsOptional()
  @IsInt({ message: '回复评论id需要为整数数字' })
  replyToId: number;
}
