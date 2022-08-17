import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import JwtAuthGuard from "../../guard/jwt-auth.guard";
import {Role, ROLES_ENUM} from "../../guard/roles.decorator";
import {RolesGuard} from "../../guard/roles.guard";
import {CommandBus} from "@nestjs/cqrs";
import { CreateAccountCommand } from './command/create-account.command';

@Controller('account')
export class AccountController {
  constructor(
      private readonly accountService: AccountService,
      private commandBus: CommandBus,
  ) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {

    const command = new CreateAccountCommand(createAccountDto.email, createAccountDto.password);

    return this.commandBus.execute(command);

    // return this.accountService.create(createAccountDto);
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
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
  }
}
