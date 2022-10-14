import { Body, Controller, Get, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetTemporaryDto } from './dto/get-temporary.dto';

@Controller('temporary')
export class TemporaryController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}
}
