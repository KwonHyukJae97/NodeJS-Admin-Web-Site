import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserCommand } from './create-user.command';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async execute(command: CreateUserCommand) {
    const { user_id, account_id, grade } = command;
  }
}
