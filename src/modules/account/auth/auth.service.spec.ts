import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Account } from 'src/modules/account/entities/account';
import { ConvertException } from 'src/common/utils/convert-exception';
import { AuthService } from './auth.service';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  findOne: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('findPassword', () => {
  let authService: AuthService;
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
        AuthService,
        ConvertException,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    accountRepository = module.get(getRepositoryToken(Account));
  });

  describe('비밀번호 정상 수정 여부', () => {
    it('수정 성공', async () => {
      // Given
      const email = '';
      const Dto = { email };

      accountRepository.findOne.mockResolvedValue(user);

      // When
      const result = await authService.findPassword(Dto(email));

      // Then
      expect(result).toEqual('비밀번호 변경 완료');
    });
  });
});
