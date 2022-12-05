/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCommentHandler } from './update-comment.handler';
import { UpdateCommentCommand } from './update-comment.command';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { Comment } from '../entities/comment';
import { Admin } from '../../../account/admin/entities/admin';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Account } from 'src/modules/account/entities/account';

// Repository mocking
const mockRepository = () => ({
  save: jest.fn(),
  findOneBy: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UpdateComment', () => {
  let updateCommentHandler: UpdateCommentHandler;
  let commentRepository: MockRepository<Comment>;
  let boardRepository: MockRepository<Board>;
  let adminRepository: MockRepository<Admin>;
  let accountRepository: MockRepository<Account>;

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
        UpdateCommentHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Board),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    updateCommentHandler = module.get(UpdateCommentHandler);
    commentRepository = module.get(getRepositoryToken(Comment));
    boardRepository = module.get(getRepositoryToken(Board));
    adminRepository = module.get(getRepositoryToken(Admin));
    accountRepository = module.get(getRepositoryToken(Account));
  });

  describe('comment 정보 정상 수정 여부', () => {
    it('수정 성공', async () => {
      // Given
      const commentId = 11;
      const adminId = 27;
      const account = Account;

      // 기존 내용
      const commentDetail = {
        comment: 'test Content',
        commentId: 11,
      };
      // 수정할 내용
      const updateComment = {
        comment: 'update Content',
        commentId: 11,
      };

      commentRepository.findOneBy.mockResolvedValue(commentId);
      commentRepository.findOneBy.mockResolvedValue(commentDetail);
      adminRepository.findOneBy.mockResolvedValue(adminId);
      commentRepository.save.mockResolvedValue(updateComment);

      // When
      const result = await updateCommentHandler.execute(
        new UpdateCommentCommand(updateComment.commentId, updateComment.comment, new account()),
      );

      // Then
      expect(result).toEqual(updateComment);
    });
  });
});
