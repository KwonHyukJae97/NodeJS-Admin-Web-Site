import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Account } from '../../entities/account';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { AdminUpdatePasswordHandler } from './admin-update-password.handler';
import { AdminUpdatePasswordCommand } from './admin-update-password.command';

const mockRepository = () => ({
  update: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('AdminUpdatePassword', () => {
  let adminUpdatePasswordHandler: AdminUpdatePasswordHandler;
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
        AdminUpdatePasswordHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    adminUpdatePasswordHandler = module.get(AdminUpdatePasswordHandler);
    accountRepository = module.get(getRepositoryToken(Account));
  });

  describe('비밀번호 정상 수정 여부', () => {
    const accountId = { accountId: 1 };
    const password = { password: '1234' };

    // 수정하고자 하는 값
    const newPassword = {
      password: password,
    };

    it('비밀번호 수정 성공', async () => {
      accountRepository.update(newPassword);
      const result = await adminUpdatePasswordHandler.execute(
        new AdminUpdatePasswordCommand(accountId.accountId, password.password),
      );
      expect(result).toEqual('비밀번호 변경 완료');
    });

    it('비밀번호 수정 실패', async () => {
      try {
        await accountRepository.update.mockRejectedValue(undefined);
        throw new Error('비밀번호 수정에입력된 내용을 확인해주세요.');
      } catch (e) {
        expect(e.message).toBe('비밀번호 수정에입력된 내용을 확인해주세요.');
      }
    });
  });
});
