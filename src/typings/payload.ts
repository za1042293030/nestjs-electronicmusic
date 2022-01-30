import { JwtPayload } from 'jsonwebtoken';

interface IPayload extends JwtPayload {
  id: number;
  isAdmin: boolean;
}

interface IJwtPayload extends JwtPayload {
  id: number;
  isAdmin: boolean;
}
export type { IJwtPayload, IPayload };
