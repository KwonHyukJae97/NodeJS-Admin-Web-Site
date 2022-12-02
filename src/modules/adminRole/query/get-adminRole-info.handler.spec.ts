import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { RolePermission } from '../entities/rolePermission.entity';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { GetAllAdminRoleQueryHandler } from './get-all-adminRole.handler';
import { GetAdminRoleInfoQueryHandler } from './get-adminRole-info.handler';
import { Admin } from '../../account/admin/entities/admin';
import { GetAdminRoleInfoQuery } from './get-adminRole-info.query';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  find: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
  }),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetDetailAdminRole', () => {
  let getAdminRoleInfohanlder: GetAdminRoleInfoQueryHandler;
  let adminRepository: MockRepository<Admin>;
  let rolePermissionRepository: MockRepository<RolePermission>;

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
        GetAdminRoleInfoQueryHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(RolePermission),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getAdminRoleInfohanlder = module.get(GetAdminRoleInfoQueryHandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    rolePermissionRepository = module.get(getRepositoryToken(RolePermission));
  });

  describe('역할 상세 정보 정상 조회 여부', () => {
    it('조회 성공', async () => {
      // Given
      const roleId = 1;
      const getAdminInfo = null;
      const rolePermissionList = [
        {
          roleId: 1,
          permissionId: 1,
          grantType: '0',
        },
        {
          roleId: 1,
          permissionId: 2,
          grantType: '1',
        },
      ];

      const adminInfoList = [
        {
          id: 1,
          adminId: 1,
          adminName: '공지사항 관리자',
        },
      ];

      const permissionList = [
        {
          permission_id: undefined,
          menu_name: undefined,
          display_name: undefined,
          grant_type_list: [
            {
              grant_type: undefined,
            },
            {
              grant_type: undefined,
            },
          ],
        },
      ];

      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      // jest.requireMock(<모듈 이름>) 을 사용하면 해당 모듈을 mocking 할 수 있음
      jest.spyOn(rolePermissionRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getRawMany: () => rolePermissionList,
        };
      });

      // jest.spyOn(adminRepository, 'createQueryBuilder').mockImplementation(() => {
      //   const mockModule = jest.requireMock('typeorm');
      //   return {
      //     ...mockModule,
      //     select: jest.fn().mockReturnThis(),
      //     leftJoin: jest.fn().mockReturnThis(),
      //     where: jest.fn().mockReturnThis(),
      //     getRawMany: () => adminInfoList,
      //   };
      // });

      // When
      const result = await getAdminRoleInfohanlder.execute(
        new GetAdminRoleInfoQuery(roleId, getAdminInfo),
      );

      // Then
      expect(result).toEqual(permissionList);
    });
  });
});
