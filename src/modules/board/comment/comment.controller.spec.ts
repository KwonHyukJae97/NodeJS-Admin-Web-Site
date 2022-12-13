import { Test, TestingModule } from '@nestjs/testing';
import { TranslatorModule } from 'nestjs-translator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Account } from 'src/modules/account/entities/account';
import { CommentController } from './comment.controller';
import { GetCommentRequestDto } from './dto/get-comment-request.dto';
import { GetCommentInfoDto } from './dto/get-comment-info.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentController', () => {
  let controller: CommentController;
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
      controllers: [CommentController],
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
    controller = module.get<CommentController>(CommentController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  //전체 조회
  it('1. controller.getAllComment 테스트', () => {
    controller.getAllComment(new GetCommentRequestDto());
    expect(queryBus.execute).toBeCalledTimes(1);
  });

  //상세 조회
  it('2. controller.getCommentDetail 테스트', () => {
    controller.getCommentDetail(1, new GetCommentInfoDto());
    expect(commandBus.execute).toBeCalledTimes(1);
  });

  //수정
  it('3. controller.updateComment 테스트', () => {
    controller.updateComment(1, new UpdateCommentDto(), new Account());
    expect(commandBus.execute).toBeCalledTimes(1);
  });
});
