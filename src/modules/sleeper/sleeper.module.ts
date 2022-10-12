import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account2 } from '../account/entities/account';
import { Sleeper } from './entities/sleeper';
import { SleeperController } from './sleeper.controller';
import { SleeperService } from './sleeper.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sleeper, Account2])],
  controllers: [SleeperController],
  providers: [SleeperService],
})
export class SleeperModule {}
