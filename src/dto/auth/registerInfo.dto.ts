import {
  Matches,
  IsNotEmpty,
  IsString,
  Length,
  IsNumberString,
} from 'class-validator';
import { nickNameReg, passwordReg, phoneReg } from 'src/constant';

class RegisterInfoDTO {
  @IsNotEmpty({ message: '昵称不能为空' })
  @Length(2, 10, { message: '昵称至少2位，至多16位' })
  @IsString({ message: '无效的用户名' })
  @Matches(nickNameReg, { message: '不允许的昵称（中文字母数字组合）' })
  nickname: string;

  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '无效的用户名' })
  @Length(8, 16, { message: '账号至少8位，至多16位' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '无效的密码' })
  @Length(10, 16, { message: '密码至少10位，至多16位' })
  @Matches(passwordReg, { message: '密码需要包含数字与字母' })
  password: string;

  @IsNotEmpty({ message: '手机号不能为空' })
  @IsNumberString({ no_symbols: true }, { message: '无效的手机号' })
  @Length(11, 11, { message: '手机号为11位' })
  @Matches(phoneReg, { message: '不正确的手机号' })
  phone: string;
}
export { RegisterInfoDTO };
