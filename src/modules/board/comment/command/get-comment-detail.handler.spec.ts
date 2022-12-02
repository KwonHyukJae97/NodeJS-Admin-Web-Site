import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { GetCommentDetailHandler } from './get-comment-detail.handler';
import { GetCommentDetailCommand } from './get-comment-detail.command';
import { Comment } from '../entities/comment';
import { Qna } from '../../qna/entities/qna';
import { Admin } from '../../../account/admin/entities/admin';
import { Board } from '../../entities/board';
import { Account } from '../../../account/entities/account';
import { BoardFile } from '../../../file/entities/board-file';
import { Company } from '../../../company/entities/company.entity';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockReturnThis(),
  }),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetCommentDetail', () => {
  let getCommentDetailHandler: GetCommentDetailHandler;
  let commentRepository: MockRepository<Comment>;
  let qnaRepository: MockRepository<Qna>;
  let adminRepository: MockRepository<Admin>;
  let boardRepository: MockRepository<Board>;
  let accountRepository: MockRepository<Account>;
  let boardFileRepository: MockRepository<BoardFile>;
  let companyRepository: MockRepository<Company>;

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
        GetCommentDetailHandler,
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
        {
          provide: getRepositoryToken(Board),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(BoardFile),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getCommentDetailHandler = module.get(GetCommentDetailHandler);
    commentRepository = module.get(getRepositoryToken(Comment));
    qnaRepository = module.get(getRepositoryToken(Qna));
    adminRepository = module.get(getRepositoryToken(Admin));
    accountRepository = module.get(getRepositoryToken(Account));
    boardFileRepository = module.get(getRepositoryToken(BoardFile));
    companyRepository = module.get(getRepositoryToken(Company));
  });

  describe(' 코멘트 상세 정보 정상 조회 여부', () => {
    it('조회 성공', async () => {
      const qnaId = 1;
      const boardId = 1;
      const accountId = 1;
      const companyId = 1;
      const file = [];
      const role = '본사 관리자';

      const board = {
        title: 'Update Title',
        content: 'Update Content',
        boardId: 11,
        viewCount: 1,
      };

      const qna = {
        boardId: boardId,
        board: board,
        qnaId: 1,
      };

      const resultCommentInfo = {
        user: {
          boardId: 11,
          accountId: 2,
          boardTypeCode: '2',
          title: 'title',
          content: 'content',
          viewCount: 0,
        },
        file: file,
      };

      // jest.requireMock(<모듈 이름>) 을 사용하면 해당 모듈을 mocking 할 수 있음
      jest.spyOn(adminRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockReturnThis(),
        };
      });
      qnaRepository.findOneBy.mockResolvedValue(qnaId);
      boardRepository.findOneBy.mockResolvedValue(boardId);
      boardRepository.save.mockResolvedValue(board);
      qnaRepository.save.mockResolvedValue(qna);
      accountRepository.findOneBy.mockResolvedValue(accountId);
      boardFileRepository.findBy.mockResolvedValue(boardId);
      commentRepository.find.mockResolvedValue(qnaId);
      companyRepository.findOneBy.mockResolvedValue(companyId);
      // When
      const result = await getCommentDetailHandler.execute(
        new GetCommentDetailCommand(qnaId, role),
      );

      // Then
      expect(result).toEqual(resultCommentInfo);
    });
  });
});
