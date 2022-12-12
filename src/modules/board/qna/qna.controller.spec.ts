import { Test, TestingModule } from '@nestjs/testing';
import { QnaController } from './qna.controller';
import { TranslatorModule } from 'nestjs-translator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetQnaRequestDto } from './dto/get-qna-request.dto';
import { CreateQnaDto } from './dto/create-qna.dto';
import { UpdateQnaDto } from './dto/update-qna.dto';
import { Account } from '../../account/entities/account';

describe('QnaController', () => {
  let controller: QnaController;
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
      controllers: [QnaController],
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
    controller = module.get<QnaController>(QnaController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('1. controller.createQna 테스트', () => {
    controller.createQna(new CreateQnaDto(), []);
    expect(commandBus.execute).toBeCalledTimes(1);
  });
  it('2. controller.getQnaDetail 테스트', () => {
    controller.getQnaDetail(1);
    expect(commandBus.execute).toBeCalledTimes(1);
  });
  it('3. controller.getAllQna 테스트', () => {
    controller.getAllQna(new GetQnaRequestDto());
    expect(queryBus.execute).toBeCalledTimes(1);
  });
  it('4. controller.updateQna 테스트', () => {
    controller.updateQna(1, new UpdateQnaDto(), []);
    expect(commandBus.execute).toBeCalledTimes(1);
  });
  it('5. controller.deleteQna 테스트', () => {
    controller.deleteQna(1, new Account());
    expect(commandBus.execute).toBeCalledTimes(1);
  });
});
