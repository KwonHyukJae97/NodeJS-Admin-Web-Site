import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { UpdateCompanyHandler } from './update-company.handler';
import { Company } from '../entities/company.entity';
import { UpdateCompanyCommand } from './update-company.command';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  save: jest.fn(),
  findOneBy: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UpdateCompany', () => {
  let updateCompanyHandler: UpdateCompanyHandler;
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
        UpdateCompanyHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    updateCompanyHandler = module.get(UpdateCompanyHandler);
    companyRepository = module.get(getRepositoryToken(Company));
  });

  describe('회원사 정보 정상 수정 여부', () => {
    it('수정 성공', async () => {
      // Given
      const companyId = { companyId: 1 };

      const newCompanyInfo = {
        companyName: '회원사',
        businessNumber: '123-45-67890',
        companyId: 1,
      };

      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      companyRepository.findOneBy.mockResolvedValue(companyId);
      companyRepository.save.mockResolvedValue(newCompanyInfo);

      // When
      const result = await updateCompanyHandler.execute(
        new UpdateCompanyCommand(
          newCompanyInfo.companyName,
          newCompanyInfo.businessNumber,
          companyId.companyId,
        ),
      );

      // Then
      expect(result).toEqual(newCompanyInfo);
    });
  });
});
