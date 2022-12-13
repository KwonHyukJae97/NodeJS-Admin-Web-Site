import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { TranslatorModule } from 'nestjs-translator';
import { AdminRoleController } from './adminRole.controller';
import { CreateAdminRoleDto } from './dto/create-adminRole.dto';
import { UpdateAdminRoleDto } from './dto/update-adminRole.dto';
import { GetAdminRoleInfoQuery } from './query/get-adminRole-info.query';
import { GetAllAdminRoleQuery } from './query/get-all-adminRole.query';

describe('AdminRoleController', () => {
  let controller: AdminRoleController;
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
      controllers: [AdminRoleController],
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
    controller = module.get<AdminRoleController>(AdminRoleController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  //등록
  it('1. controller.createAdminRole 테스트', () => {
    controller.createAdminRole(new CreateAdminRoleDto());
    expect(commandBus.execute).toBeCalledTimes(1);
  });

  //전체 조회
  it('2. controller.getAllAdminRole 테스트', () => {
    controller.getAllAdminRole();
    expect(queryBus.execute).toBeCalledTimes(1);
  });

  //상세 조회
  it('3. controller.getAdminRoleInfo 테스트', () => {
    controller.updateAdminRole(1, new UpdateAdminRoleDto());
    expect(commandBus.execute).toBeCalledTimes(1);
  });
  //수정
  it('4. controller.updateAdminRole 테스트', async () => {
    controller.updateAdminRole(1, new UpdateAdminRoleDto());
    expect(commandBus.execute).toBeCalledTimes(1);
  });

  //삭제
  it('5. controller.deleteAdminRole 테스트', async () => {
    controller.deleteAdminRole(1);
    expect(commandBus.execute).toBeCalledTimes(1);
  });
});
