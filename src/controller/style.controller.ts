import { Controller, Get } from '@nestjs/common';
import { StyleService } from 'src/service/style.service';

@Controller('/api/style')
export class StyleController {
  constructor(private readonly styleService: StyleService) {}
  
  @Get('/getAllStyles')
  async getAllStyles() {
    return this.styleService.getAllStyles();
  }
}
