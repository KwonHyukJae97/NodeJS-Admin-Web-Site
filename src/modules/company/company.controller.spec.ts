import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { TranslatorModule } from 'nestjs-translator';
import { CompanyController } from './company.controller';
import { GetCompanyRequestDto } from './dto/get-company-request.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

describe('CompanyController', () => {
  let controller: CompanyController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TranslatorModule.forRoot({
          global: true,
          defaultLang: 'ko',
          translationSource: '/src/common/i18n',
        }),
      ],
      controllers: [CompanyController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<CompanyController>(CompanyController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  //전체 조회
  it('1. controller.getAllCompany 테스트', () => {
    controller.getAllCompany(new GetCompanyRequestDto());
    expect(queryBus.execute).toBeCalledTimes(1);
  });

  //상세 조회
  it('2. controller.getCompanyInfo 테스트', () => {
    controller.getCompanyInfo(1);
    expect(queryBus.execute).toBeCalledTimes(1);
  });

  //수정
  it('3. controller.updateCompany 테스트', async () => {
    controller.updateCompany(1, new UpdateCompanyDto());
    expect(commandBus.execute).toBeCalledTimes(1);
  });

  //삭제
  it('5. controller.deleteCompany 테스트', async () => {
    controller.deleteCompany(1, 1);
    expect(commandBus.execute).toBeCalledTimes(1);
  });
});
