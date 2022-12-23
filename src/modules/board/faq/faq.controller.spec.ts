import { Test, TestingModule } from '@nestjs/testing';
import { FaqController } from './faq.controller';
import { TranslatorModule } from 'nestjs-translator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetFaqRequestDto } from './dto/get-faq-request.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

describe('FaqController', () => {
  let controller: FaqController;
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
      controllers: [FaqController],
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
    controller = module.get<FaqController>(FaqController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('1. controller.createFaq 테스트', () => {
    controller.createFaq(new CreateFaqDto(), []);
    expect(commandBus.execute).toBeCalledTimes(1);
  });
  it('2. controller.getFaqSearch 테스트', () => {
    controller.getFaqSearch(new GetFaqRequestDto());
    expect(queryBus.execute).toBeCalledTimes(1);
  });
  it('3. controller.getAllCategory 테스트', () => {
    controller.getAllCategory('test');
    expect(queryBus.execute).toBeCalledTimes(1);
  });
  it('4. controller.getFaqDetail 테스트', () => {
    controller.getFaqDetail(1, 'test');
    expect(commandBus.execute).toBeCalledTimes(1);
  });
  it('5. controller.updateFaq 테스트', () => {
    controller.updateFaq(1, new UpdateFaqDto(), []);
    expect(commandBus.execute).toBeCalledTimes(1);
  });
  it('6. controller.updateFaq 테스트', () => {
    controller.deleteFaq(1);
    expect(commandBus.execute).toBeCalledTimes(1);
  });
});
