import { Matches, IsNotEmpty, IsString, Length } from 'class-validator';
import { passwordReg } from 'src/constant';

class LoginInfoDTO {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '无效的用户名' })
  @Length(8, 16, { message: '账号至少8位，至多16位' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '无效的密码' })
  @Length(10, 16, { message: '密码至少10位，至多16位' })
  @Matches(passwordReg, { message: '密码需要包含数字与字母' })
  password: string;
}
export { LoginInfoDTO };
