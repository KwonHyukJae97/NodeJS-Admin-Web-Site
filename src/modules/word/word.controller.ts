import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards} from '@nestjs/common';
import { WordService } from './word.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import JwtAuthGuard from "../../guard/jwt-auth.guard";

@Controller('word')
@UseGuards(JwtAuthGuard)
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Post()
  create(@Body() createWordDto: CreateWordDto) {
    return this.wordService.create(createWordDto);
  }

  @Get()
  findAll() {
    return this.wordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.wordService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateWordDto: UpdateWordDto) {
    return this.wordService.update(id, updateWordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.wordService.remove(id);
  }
}
