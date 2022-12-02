/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCommentHandler } from './create-comment.handler';
import { CreateCommentCommand } from './create-comment.command';
import { Repository } from 'typeorm';
import { Qna } from '../../qna/entities/qna';
import { Comment } from '../entities/comment';
import { Admin } from '../../../account/admin/entities/admin';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';

// Repository mocking
const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  findOneBy: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CreateCommnet', () => {
  let createCommentHandler: CreateCommentHandler;
  let commentRepository: MockRepository<Comment>;
  let qnaRepository: MockRepository<Qna>;
  let adminRepository: MockRepository<Admin>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TranslatorModule.forRoot({
          global: true,
          defaultLang: 'ko',
          translationSource: '/src/common/i18n',
        }),
      ],
      providers: [
        CreateCommentHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Qna),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    createCommentHandler = module.get(CreateCommentHandler);
    commentRepository = module.get(getRepositoryToken(Comment));
    qnaRepository = module.get(getRepositoryToken(Qna));
    adminRepository = module.get(getRepositoryToken(Admin));
  });

  describe('comment 정상 등록 여부', () => {
    it('등록 성공', async () => {
      // Given
      const qnaId = 1;
      const accountId = 27;

      const qnaComment = {
        adminId: 27,
        comment: 'test Content',
        commentId: 11,
        qnaId: qnaId,
      };
      qnaRepository.findOneBy.mockResolvedValue(qnaId);
      adminRepository.findOneBy.mockResolvedValue(accountId);
      commentRepository.create.mockResolvedValue(qnaComment);
      commentRepository.save.mockResolvedValue(qnaComment);

      // When
      const result = await createCommentHandler.execute(
        new CreateCommentCommand(qnaId, qnaComment.comment),
      );

      // Then
      expect(result).toEqual(qnaComment);
    });
  });
});
