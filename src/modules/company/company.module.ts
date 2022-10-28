import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyController } from './company.controller';
import { Company } from './entities/company.entity';
import { GetCompanyInfoQueryHandler } from './query/get-company-info.handler';
import { DeleteCompanyHandler } from './command/deleate-company.handler';
import { UpdateCompanyHandler } from './command/update-company.handler';
import { Admin } from '../account/admin/entities/admin';
import { RolePermission } from '../adminRole/entities/rolePermission.entity';
import { ConvertException } from 'src/common/utils/convert-exception';

const CommandHandlers = [UpdateCompanyHandler, DeleteCompanyHandler];
const QueryHandlers = [GetCompanyInfoQueryHandler];
@Module({
  imports: [TypeOrmModule.forFeature([Company, Admin, RolePermission]), CqrsModule],
  controllers: [CompanyController],
  providers: [...CommandHandlers, ...QueryHandlers, ConvertException],
})
export class CompanyModule {}
