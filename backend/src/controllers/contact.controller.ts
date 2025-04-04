import { Controller, Get, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ContactService } from '../services/contact.service';
import { CreateContactDto } from '../dto/contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createContactDto: CreateContactDto) {
    return await this.contactService.create(createContactDto);
  }

  @Get()
  async findAll() {
    return await this.contactService.findAll();
  }
} 