import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountedController } from "./accounted.controller";
import { AccountedService } from "./accounted.service";
import { Accounted } from "./entities/account.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Accounted])],
    controllers: [AccountedController],
    providers: [AccountedService]
})
export class AccountedModule {}