import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Style } from 'src/entity';
import { Repository } from 'typeorm';

@Injectable()
export class StyleService {
  constructor(
    @InjectRepository(Style)
    private readonly styleRepository: Repository<Style>,
  ) {}
  async getAllStyles() {
    return this.styleRepository
      .createQueryBuilder('style')
      .select(['style.id', 'style.name'])
      .leftJoin('style.children', 's')
      .addSelect(['s.id', 's.name'])
      .where('style.parent_id is null')
      .getMany();
  }
}
