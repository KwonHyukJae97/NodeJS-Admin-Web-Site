import { AdminController } from './admin.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { TranslatorModule } from 'nestjs-translator';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminUpdateInfoDto } from '../auth/dto/admin-update-info.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

describe('AdminController', () => {
  let controller: AdminController;
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
      controllers: [AdminController],
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
    controller = module.get<AdminController>(AdminController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  const adminId = 1;
  const accountId = 1;
  const updateAdminDto = new UpdateAdminDto();
  const updateAdminInfoDto = new AdminUpdateInfoDto();
  const createAdminDto = new CreateAdminDto();
  const file = {
    fieldname: 'file',
    originalname: 'medal.png',
    encoding: '7bit',
    mimetype: 'image/png',
    buffer: Buffer.from(__dirname + '/../../medal.png', 'utf8'),
    size: 51828,
  } as Express.MulterS3.File;

  it('1. controller.getAllAdmin 테스트', () => {
    controller.getAllAdmin();
    expect(queryBus.execute).toBeCalledTimes(1);
  });

  it('2. controller.getAdminInfo 테스트', () => {
    controller.getAdminInfo(adminId);
    expect(queryBus.execute).toBeCalledTimes(1);
  });

  it('3. controller.updateAdmin 테스트', () => {
    controller.updateAdmin(adminId, updateAdminDto, file);
    expect(commandBus.execute).toBeCalledTimes(1);
  });

  it('4. controller.updateInfo 테스트', () => {
    controller.updateInfo(accountId, updateAdminInfoDto, file);
    expect(commandBus.execute).toBeCalledTimes(1);
  });

  it('5. controller.createAdmin 테스트', () => {
    controller.createAdmin(createAdminDto);
    expect(commandBus.execute).toBeCalledTimes(1);
  });

  it('6. controller.deleteAdmin 테스트', () => {
    controller.deleteAdmin(adminId, new Date());
    expect(commandBus.execute).toBeCalledTimes(1);
  });
});
