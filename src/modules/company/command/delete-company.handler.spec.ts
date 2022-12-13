import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Admin } from '../../account/admin/entities/admin';
import { Company } from '../entities/company.entity';
import { DeleteCompanyHandler } from './deleate-company.handler';
import { DeleteCompanyCommand } from './delete-company.command';

const mockRepository = () => ({
  softDelete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('DeleteCompany', () => {
  let deleteCompanyHandler: DeleteCompanyHandler;
  let adminRepository: MockRepository<Admin>;
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
        DeleteCompanyHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    deleteCompanyHandler = module.get(DeleteCompanyHandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    companyRepository = module.get(getRepositoryToken(Company));
  });

  describe('회원사 정보 정상 삭제 여부', () => {
    // Given
    const companyId = 1;
    const roleId = 1;

    const company = {
      companyId: 1,
      companyName: '회원사',
      companyCode: 100001,
      rolePermission: {
        permissionId: 4,
      },
    };
    it('삭제 성공', async () => {
      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      jest.spyOn(adminRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: () => company,
        };
      });
      adminRepository.softDelete.mockReturnValue(companyId);

      const result = await deleteCompanyHandler.execute(
        new DeleteCompanyCommand(companyId, roleId),
      );

      expect(result).toEqual('삭제가 완료 되었습니다.');
    });

    it('회원사 정보가 없을 경우 404 에러 발생', async () => {
      jest.spyOn(adminRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: () => undefined,
        };
      });

      try {
        const result = await deleteCompanyHandler.execute(
          new DeleteCompanyCommand(companyId, roleId),
        );
        expect(result).toBeDefined();
      } catch (Err) {
        expect(Err.status).toBe(404);
        expect(Err.response).toBe('회원사 정보를 찾을 수 없습니다.');
      }
    });

    it('회원사 정보 삭제 500 에러 발생', async () => {
      jest.spyOn(adminRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: () => company,
        };
      });

      if (companyId == company.companyId && company.rolePermission.permissionId == 4) {
        try {
          const result = await deleteCompanyHandler.execute(
            new DeleteCompanyCommand(companyId, roleId),
          );
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(500);
          expect(Err.response).toBe('삭제할 수 있는 권한이 없습니다.');
        }
      }
    });
  });
});
