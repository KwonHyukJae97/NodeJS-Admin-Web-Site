import { Test, TestingModule } from '@nestjs/testing';
import { NoticeController } from './notice.controller';
import { TranslatorModule } from 'nestjs-translator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetNoticeRequestDto } from './dto/get-notice-request.dto';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { Account } from 'src/modules/account/entities/account';

describe('NoticeController', () => {
  let controller: NoticeController;
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
      controllers: [NoticeController],
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
    controller = module.get<NoticeController>(NoticeController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('1. controller.createNotice 테스트', () => {
    controller.createNotice(new CreateNoticeDto(), []);
    expect(commandBus.execute).toBeCalledTimes(1);
  });
  it('2. controller.getAllSearchNotice 테스트', () => {
    controller.getAllSearchNotice(new GetNoticeRequestDto());
    expect(queryBus.execute).toBeCalledTimes(1);
  });
  it('3. controller.getNoticeDetail 테스트', () => {
    controller.getNoticeDetail(1, 'test');
    expect(commandBus.execute).toBeCalledTimes(1);
  });
  it('4. controller.updateNotice 테스트', () => {
    controller.updateNotice(1, new UpdateNoticeDto(), []);
    expect(commandBus.execute).toBeCalledTimes(1);
  });
  it('5. controller.deleteNotice 테스트', () => {
    controller.deleteNotice(1, 'test', new Account());
    expect(commandBus.execute).toBeCalledTimes(1);
  });
});
