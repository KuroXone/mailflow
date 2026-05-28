import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, CreateListDto } from './dto/contact.dto';
import { OrgId } from '../../common/decorators/org.decorator';

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private svc: ContactsService) {}

  @Get('lists')
  getLists(@OrgId() orgId: string) { return this.svc.getLists(orgId); }

  @Post('lists')
  createList(@OrgId() orgId: string, @Body() dto: CreateListDto) { return this.svc.createList(orgId, dto); }

  @Delete('lists/:id')
  deleteList(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.deleteList(id, orgId); }

  @Get('stats')
  getStats(@OrgId() orgId: string) { return this.svc.getStats(orgId); }

  @Get('tags')
  getTags(@OrgId() orgId: string) { return this.svc.getTags(orgId); }

  @Get()
  findAll(@OrgId() orgId: string, @Query() query: any) { return this.svc.findAll(orgId, query); }

  @Get(':id')
  findOne(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.findOne(id, orgId); }

  @Post()
  create(@OrgId() orgId: string, @Body() dto: CreateContactDto) { return this.svc.create(orgId, dto); }

  @Put(':id')
  update(@Param('id') id: string, @OrgId() orgId: string, @Body() dto: UpdateContactDto) {
    return this.svc.update(id, orgId, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @OrgId() orgId: string) { return this.svc.delete(id, orgId); }

  @Post(':id/tags')
  addTag(@Param('id') id: string, @OrgId() orgId: string, @Body('tag') tag: string) {
    return this.svc.addTag(id, orgId, tag);
  }

  @Delete(':id/tags/:tag')
  removeTag(@Param('id') id: string, @OrgId() orgId: string, @Param('tag') tag: string) {
    return this.svc.removeTag(id, orgId, tag);
  }

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({ destination: '/tmp' }) }))
  import(@OrgId() orgId: string, @Query('listId') listId: string, @UploadedFile() file: Express.Multer.File) {
    return this.svc.importCsv(orgId, listId, file);
  }

  @Post('lists/:listId/contacts/:contactId')
  addToList(@Param('listId') listId: string, @Param('contactId') contactId: string, @OrgId() orgId: string) {
    return this.svc.addToList(listId, contactId, orgId);
  }

  @Delete('lists/:listId/contacts/:contactId')
  removeFromList(@Param('listId') listId: string, @Param('contactId') contactId: string) {
    return this.svc.removeFromList(listId, contactId);
  }
}
