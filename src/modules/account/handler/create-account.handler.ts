import {Injectable} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import { AccountService } from "../account.service";
import {CreateAccountCommand} from "../command/create-account.command";
import {CreateAccountDto} from "../dto/create-account.dto";

@Injectable()
@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler implements ICommandHandler<CreateAccountCommand> {

    constructor(private accountService: AccountService) {
    }

    async execute(command: CreateAccountCommand) {

        const {email, password} = command;

        const createAccountDto = new CreateAccountDto();
        createAccountDto.email = email;
        createAccountDto.password = password;

        return await this.accountService.create(createAccountDto);
    }



}