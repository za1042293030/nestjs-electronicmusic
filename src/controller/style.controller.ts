import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StyleService } from 'src/service/style.service';

@ApiTags('风格')
@Controller('/api/style')
export class StyleController {
  constructor(private readonly styleService: StyleService) {}
  
  @Get('/getAllStyles')
  async getAllStyles() {
    return this.styleService.getAllStyles();
  }

  @Get('/getSelectStyles')
  async getSelectStyles(){
    return this.styleService.getSelectStyles();
  }
}
