import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { DeleteUserHandler } from './delete-user.handler';
import { User } from '../entities/user';
import { Account } from '../../entities/account';
import { AccountFile } from '../../../file/entities/account-file.entity';
import { EventBus } from '@nestjs/cqrs';
import { AccountFileDb } from '../../account-file-db';
import { DeleteUserCommand } from './delete-user.command';
import { ConvertException } from '../../../../common/utils/convert-exception';

const mockRepository = () => ({
  softDelete: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('DeleteUser', () => {
  let deleteUserHandler: DeleteUserHandler;
  let userRepository: MockRepository<User>;
  let accountRepository: MockRepository<Account>;
  let acccountFileRepository: MockRepository<AccountFile>;
  let eventBus: jest.Mocked<EventBus>;

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
        DeleteUserHandler,
        ConvertException,
        AccountFileDb,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(AccountFile),
          useValue: mockRepository(),
        },
        {
          provide: 'accountFile',
          useClass: AccountFileDb,
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    deleteUserHandler = module.get(DeleteUserHandler);
    userRepository = module.get(getRepositoryToken(User));
    accountRepository = module.get(getRepositoryToken(Account));
    acccountFileRepository = module.get(getRepositoryToken(AccountFile));
    eventBus = module.get(EventBus);
  });

  describe('사용자 정보 정상 삭제 여부', () => {
    const userId = 1;
    const delDate = new Date();

    const userInfo = {
      userId: 1,
      grade: 0,
      accountId: 1,
    };

    const accountInfo = {
      accountId: 1,
      id: 'test',
      name: '이름',
      email: 'email@email.com',
      phone: '010-1111-1111',
      nickname: '닉네임',
      grade: 1,
      birth: '20221202',
      gender: '0',
    };

    const accountFile = {
      accountFileId: 1,
      accountId: 1,
      originalFileName: '스크린샷 2022-10-19 20.22.28(2)',
      fileExt: '.png',
      filePath:
        'https://b2c-file-test.s3.ap-northeast-2.amazonaws.com/account/2022-10-27/19082121_c7bddcb5-59fd-4d08-b816-5d734bf09566',
      fileSize: 355102,
    };

    const deleteAccountInfo = {
      accountId: 1,
      password: '*****',
      id: '*****',
      name: '*****',
      phone: '*****',
      nickname: '*****',
      email: '*****',
      birth: '*****',
      snsId: '*****',
      snsType: '**',
      gender: '*',
      ci: '*****',
    };

    it('계정 파일이 있을 경우 사용자 정보 삭제 성공', async () => {
      userRepository.findOneBy.mockResolvedValue(userInfo);
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      acccountFileRepository.findOneBy.mockResolvedValue(accountInfo.accountId);
      const deleteAccount = jest
        .spyOn(accountRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: () => deleteAccountInfo,
          };
        });
      acccountFileRepository.findOneBy.mockResolvedValue(accountFile);

      const result = await deleteUserHandler.execute(new DeleteUserCommand(userId, delDate));

      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      expect(deleteAccount).toHaveBeenCalled();
      expect(acccountFileRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(result).toEqual('삭제가 완료 되었습니다.');
    });

    it('계정 파일이 없을 경우 사용자 정보 삭제 성공', async () => {
      userRepository.findOneBy.mockResolvedValue(userInfo);
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      acccountFileRepository.findOneBy.mockResolvedValue(accountInfo.accountId);
      const deleteAccount = jest
        .spyOn(accountRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: () => deleteAccountInfo,
          };
        });
      acccountFileRepository.findOneBy.mockResolvedValue(undefined);

      const result = await deleteUserHandler.execute(new DeleteUserCommand(userId, delDate));

      expect(eventBus.publish).not.toHaveBeenCalled();
      expect(deleteAccount).toHaveBeenCalled();
      expect(acccountFileRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(result).toEqual('삭제가 완료 되었습니다.');
    });

    it('해당 사용자 계정 정보가 없을 경우 404 에러 발생', async () => {
      userRepository.findOneBy.mockResolvedValue(userInfo);
      accountRepository.findOneBy.mockResolvedValue(undefined);

      try {
        const result = await deleteUserHandler.execute(new DeleteUserCommand(userId, delDate));
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('사용자 정보를 찾을 수 없습니다.');
      }
    });

    it('삭제된 계정 정보 업데이트에 문제가 있을 경우 500 에러 발생', async () => {
      userRepository.findOneBy.mockResolvedValue(userInfo);
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      acccountFileRepository.findOneBy.mockResolvedValue(accountInfo.accountId);
      const deleteAccount = jest
        .spyOn(accountRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: () => Promise.reject(),
          };
        });

      try {
        const result = await deleteUserHandler.execute(new DeleteUserCommand(userId, delDate));
        expect(result).toBeDefined();
        expect(deleteAccount).toHaveBeenCalled();
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
      }
    });
  });
});
