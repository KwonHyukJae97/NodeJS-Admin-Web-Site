import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import JwtAuthGuard from '../../guard/jwt/jwt-auth.guard';
import { Role, ROLES_ENUM } from '../../guard/role/roles.decorator';
import { RolesGuard } from '../../guard/role/roles.guard';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  @Role(ROLES_ENUM.ROLE_ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req) {
    return this.accountService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: number) {
    return this.accountService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.accountService.remove(id);
  }
}
