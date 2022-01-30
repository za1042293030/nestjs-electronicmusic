import { Request } from 'express';
import { IPayload } from '.';

interface IUserRequest extends Request {
  user: IPayload;
}
export type { IUserRequest };
