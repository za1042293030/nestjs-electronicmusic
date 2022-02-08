import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { passwordReg } from 'src/constant';

class ChangePasswordInfoDTO{
  @IsNotEmpty({ message: '原密码不能为空' })
  @IsString({ message: '无效的原密码' })
  @Length(10, 16, { message: '原密码至少10位，至多16位' })
  @Matches(passwordReg, { message: '原密码需要包含数字与字母' })
  oldpassword: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  @IsString({ message: '无效的新密码' })
  @Length(10, 16, { message: '新密码至少10位，至多16位' })
  @Matches(passwordReg, { message: '新密码需要包含数字与字母' })
  newpassword: string;
}
export {
  ChangePasswordInfoDTO
}
