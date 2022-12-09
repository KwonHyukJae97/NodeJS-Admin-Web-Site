import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminRole.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { GetAllAdminRoleQueryHandler } from './get-all-adminRole.handler';
import { GetAllAdminRoleQuery } from './get-all-adminRole.query';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  find: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
  }),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetAllAdminRole', () => {
  let getAllAdminRoleHandler: GetAllAdminRoleQueryHandler;
  let adminRoleRepository: MockRepository<AdminRole>;

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
        GetAllAdminRoleQueryHandler,
        ConvertException,
        {
          provide: getRepositoryToken(AdminRole),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(RolePermission),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getAllAdminRoleHandler = module.get(GetAllAdminRoleQueryHandler);
    adminRoleRepository = module.get(getRepositoryToken(AdminRole));
  });

  describe('전체 역할 정보 정상 조회 여부', () => {
    it('조회 성공', async () => {
      // Given
      const adminRoleList = [
        {
          roleId: 1,
          roleName: '공지사항 관리자',
          adminCount: '1',
        },
      ];

      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      adminRoleRepository.find.mockResolvedValue(adminRoleList);
      // jest.requireMock(<모듈 이름>) 을 사용하면 해당 모듈을 mocking 할 수 있음
      jest.spyOn(adminRoleRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          select: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawMany: () => adminRoleList,
        };
      });

      // When
      const result = await getAllAdminRoleHandler.execute(new GetAllAdminRoleQuery());

      // Then
      expect(result).toEqual(adminRoleList);
    });

    it('역할 정보가 없을 경우 404 에러 발생', async () => {
      adminRoleRepository.find.mockResolvedValue(undefined);

      try {
        const result = await getAllAdminRoleHandler.execute(GetAllAdminRoleQuery);
        expect(result).toBeDefined();
      } catch (Err) {
        expect(Err.status).toBe(404);
        expect(Err.response).toBe('역할 정보를 찾을 수 없습니다.');
      }
    });
  });
});
