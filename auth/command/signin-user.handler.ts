// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Account } from 'src/modules/account/entities/account';
// import { Repository } from 'typeorm';
// import { SignInUserCommand } from './signin-user.command';

// @Injectable()
// @CommandHandler(SignInUserCommand)
// export class SignInUserHandler implements ICommandHandler<SignInUserCommand> {
//   constructor(
//     @InjectRepository(Account) private userRepository: Repository<Account>,
//     private signService: SignService,
//   ) {}

//   async execute(command: SignInUserCommand) {
//     const { id, password } = command;

//     const account = await this.userRepository.findOne({ where: { id, password } });

//     if (!account) {
//       throw new NotFoundException('로그인 실패');
//     }

//     return this.signService.signin(account);
//   }
// }
