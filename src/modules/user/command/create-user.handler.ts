import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserCommand } from './create-user.command';
import { Repository } from 'typeorm';
import { User } from '../entities/user';

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
  async execute(command: CreateUserCommand) {
    const { account_id, grade } = command;

    return this.userRepository.save(command);
  }
}
