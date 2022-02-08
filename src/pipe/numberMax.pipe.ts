import { PipeTransform, Injectable, ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class NumberMaxPipe implements PipeTransform {
  private max: number;

  constructor(max: number) {
    this.max = max;
  }

  transform(value: number, metadata: ArgumentMetadata) {
    if (value > this.max)
      throw new HttpException('数字不能超过' + this.max, HttpStatus.BAD_REQUEST);
    return value;
  }
}
