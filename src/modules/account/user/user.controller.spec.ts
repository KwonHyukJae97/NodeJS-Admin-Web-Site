import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { TranslatorModule } from 'nestjs-translator';
import { UserController } from './user.controller';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
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
      controllers: [UserController],
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
    controller = module.get<UserController>(UserController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  const userId = 1;
  const updateUserDto = new UpdateUserDto();
  const file = {
    fieldname: 'file',
    originalname: 'medal.png',
    encoding: '7bit',
    mimetype: 'image/png',
    buffer: Buffer.from(__dirname + '/../../medal.png', 'utf8'),
    size: 51828,
  } as Express.MulterS3.File;

  it('1. controller.getAllUser 테스트', () => {
    controller.getAllUser();
    expect(queryBus.execute).toBeCalledTimes(1);
  });

  it('2. controller.getUserInfo 테스트', () => {
    controller.getUserInfo(userId);
    expect(queryBus.execute).toBeCalledTimes(1);
  });

  it('3. controller.updateUser 테스트', () => {
    controller.updateUser(userId, updateUserDto, file);
    expect(commandBus.execute).toBeCalledTimes(1);
  });

  it('4. controller.deleteUser 테스트', () => {
    controller.deleteUser(userId, new Date());
    expect(commandBus.execute).toBeCalledTimes(1);
  });
});
