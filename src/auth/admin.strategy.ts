import Util from './../util/index';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET, TOKEN } from 'src/constant';
import { JWT } from 'src/enum';
import { IJwtPayload } from 'src/typings';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, JWT.ADMIN) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader(TOKEN),
      ignoreExpiration: false,
      secretOrKey: Util.getEnv(JWT_SECRET),
    });
  }

  async validate(payload: IJwtPayload) {
    const { id, isAdmin, iat, exp } = payload;
    if (Math.floor(new Date().getTime() / 1000 - iat) - (exp - iat) > 0)
      throw new UnauthorizedException('登录信息已过期，请重新登录');
    //验证token
    const admin = await this.authService.findAdmin({ id });
    if (!admin || admin.role.isAdmin !== isAdmin) throw new UnauthorizedException('token验证失败');
    else if (!admin.role.isAdmin) throw new UnauthorizedException('无权限访问');
    return { id };
  }
}
