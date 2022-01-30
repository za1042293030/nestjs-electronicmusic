import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET, TOKEN } from 'src/constant';
import { JWT } from 'src/enum';
import { AuthService } from 'src/service/auth.service';
import Util from 'src/util';
import { IPayload } from 'src/typings';

@Injectable()
export class LoginStrategy extends PassportStrategy(Strategy, JWT.LOGIN) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader(TOKEN),
      ignoreExpiration: true,
      secretOrKey: Util.getEnv(JWT_SECRET),
    });
  }

  async validate(payload: IPayload) {
    const { id, iat, exp, isAdmin } = payload;
    if (Math.floor(new Date().getTime() / 1000 - iat) - (exp - iat) > 0)
      throw new UnauthorizedException('登录信息已过期，请重新登录');
    //验证token准确性
    const user = await this.authService.findAllUser({ id });
    if (!user || user.role.isAdmin !== isAdmin) throw new UnauthorizedException('token验证失败');
    return { id };
  }
}
