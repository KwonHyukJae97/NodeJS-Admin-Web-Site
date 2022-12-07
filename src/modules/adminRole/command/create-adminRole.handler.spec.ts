import { Test, TestingModule } from '@nestjs/testing';
import { CreateAdminRoleHandler } from './create-adminRole.handler';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminRole.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { CreateAdminRoleCommand } from './create-adminRole.command';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  insert: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CreateAdminRole', () => {
  let createAdminRoleHandler: CreateAdminRoleHandler;
  let adminRoleRepository: MockRepository<AdminRole>;
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
        CreateAdminRoleHandler,
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

    createAdminRoleHandler = module.get(CreateAdminRoleHandler);
    adminRoleRepository = module.get(getRepositoryToken(AdminRole));
    rolePermissionRepository = module.get(getRepositoryToken(RolePermission));
  });

  describe('역할 정보 정상 등록 여부', () => {
    it('등록 성공', async () => {
      // Given
      const roleName = '공지사항 관리자';
      const companyId = 2;
      const roleDto = [
        {
          permissionId: 4,
          grantType: '1',
        },
      ];

      const adminRole = {
        roleId: 1,
        roleName: roleName,
        companyId: companyId,
      };

      const rolePermission = {
        roleId: adminRole.roleId,
        permissionId: roleDto[0].permissionId,
        grantType: roleDto[0].grantType,
      };

      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      adminRoleRepository.create.mockResolvedValue(adminRole);
      adminRoleRepository.save.mockResolvedValue(adminRole);
      rolePermissionRepository.create.mockResolvedValue(rolePermission);
      rolePermissionRepository.insert.mockResolvedValue(rolePermission);

      // When
      const result = await createAdminRoleHandler.execute(
        new CreateAdminRoleCommand(roleName, companyId, roleDto),
      );

      // Then
      expect(result).toEqual('등록이 완료 되었습니다.');
    });
  });
});
