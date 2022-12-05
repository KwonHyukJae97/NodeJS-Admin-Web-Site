import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminRole.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { UpdateAdminRoleHandler } from './update-adminRole.handler';
import { UpdateAdminRoleCommand } from './update-adminRole.command';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  update: jest.fn(),
  insert: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UpdateAdminRole', () => {
  let updateAdminRoleHandler: UpdateAdminRoleHandler;
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
        UpdateAdminRoleHandler,
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

    updateAdminRoleHandler = module.get(UpdateAdminRoleHandler);
    adminRoleRepository = module.get(getRepositoryToken(AdminRole));
    rolePermissionRepository = module.get(getRepositoryToken(RolePermission));
  });

  describe('역할 정보 정상 수정 여부', () => {
    it('수정 성공', async () => {
      // Given
      const roleName = '공지사항 관리자';
      const updateRoleName = 'FAQ 관리자';
      const roleId = { roleId: 1 };
      const roleDto = [
        {
          permissionId: 2,
          grantType: '2',
        },
      ];

      const newAdminRole = {
        roleId: 1,
        roleName: updateRoleName,
        companyId: 1,
      };

      const rolePermission = {
        roleId: newAdminRole.roleId,
        permissionId: roleDto[0].permissionId,
        grantType: roleDto[0].grantType,
      };

      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      adminRoleRepository.findOneBy.mockResolvedValue(roleId);
      adminRoleRepository.save.mockResolvedValue(newAdminRole);
      rolePermissionRepository.findBy.mockResolvedValue(roleId);
      // jest.requireMock(<모듈 이름>) 을 사용하면 해당 모듈을 mocking 할 수 있음
      jest.spyOn(rolePermissionRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getOne: () => rolePermission,
        };
      });
      rolePermissionRepository.update.mockResolvedValue(rolePermission);

      // When
      const result = await updateAdminRoleHandler.execute(
        new UpdateAdminRoleCommand(updateRoleName, roleDto, roleId.roleId),
      );

      // Then
      expect(result).toEqual(undefined);
    });
  });
});
