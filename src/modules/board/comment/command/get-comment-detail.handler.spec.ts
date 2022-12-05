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
    boardRepository = module.get(getRepositoryToken(Board));
  });

  describe(' 코멘트 상세 정보 정상 조회 여부', () => {
    it('조회 성공', async () => {
      const qnaId = 1;
      const boardId = 1;
      const accountId = 1;
      const companyId = 1;
      const role = '본사 관리자';
      const viewCount = 0;

      // 게시글 정보
      const board = {
        title: 'Update Title',
        content: 'Update Content',
        boardId: boardId,
        viewCount: viewCount,
      };

      // qna 정보
      const qna = {
        boardId: boardId,
        board: board,
        qnaId: qnaId,
      };

      // 답변 정보
      const comment = [
        {
          qnaId: qnaId,
          accountId: accountId,
          title: '100001',
          viewCount: viewCount,
          regDate: '2022-12-02 14:54:45',
          isComment: 1,
        },
      ];

      // 계정 정보
      const adminAccount = {
        admin_admin_id: 2,
        admin_company_id: 1,
        admin_role_id: 7,
        admin_is_super: 0,
        admin_account_id: '4',
        account_account_id: null,
        account_id: null,
        account_password: null,
        account_name: null,
        account_email: null,
        account_phone: null,
        account_nickname: null,
        account_birth: null,
        account_gender: null,
        account_current_hashed_refresh_token: null,
        account_ci: null,
        account_sns_id: null,
        account_sns_type: null,
        account_sns_token: null,
        account_reg_date: null,
        account_update_date: null,
        account_del_date: null,
        account_login_date: null,
        account_division: null,
      };

      // 반환되는 답변 정보
      const resultCommentInfo = {
        qna: {
          qnaId: qnaId,
          boardId: board.boardId,
          board: {
            boardId: board.boardId,
            title: board.title,
            content: board.content,
            viewCount: 1,
          },
        },
        writer: 'undefined(undefined)',
        fileList: 1,
        commentListInfo: [
          {
            comment: {
              qnaId: qnaId,
              accountId: accountId,
              title: '100001',
              viewCount: viewCount,
              regDate: '2022-12-02 14:54:45',
              isComment: 1,
            },
            writer: 'null(null)',
          },
        ],
      };

      qnaRepository.findOneBy.mockResolvedValue(qna);
      boardRepository.findOneBy.mockResolvedValue(board);
      boardRepository.save.mockResolvedValue(board);
      qnaRepository.save.mockResolvedValue(qna);
      accountRepository.findOneBy.mockResolvedValue(accountId);
      boardFileRepository.findBy.mockResolvedValue(boardId);
      commentRepository.find.mockResolvedValue(comment);
      companyRepository.findOneBy.mockResolvedValue(companyId);

      // jest.requireMock(<모듈 이름>) 을 사용하면 해당 모듈을 mocking 할 수 있음
      jest.spyOn(adminRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getRawOne: () => adminAccount,
        };
      });

      // When
      const result = await getCommentDetailHandler.execute(
        new GetCommentDetailCommand(qnaId, role),
      );

      // Then
      expect(result).toEqual(resultCommentInfo);
    });
  });
});
