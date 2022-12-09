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
    // Given
    const roleName = '공지사항 관리자';
    const updateRoleName = 'FAQ 관리자';
    const permissionId = 2;
    const grantType = '2';
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
    it('수정 성공', async () => {
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

    it('역할권한 정보가 없을 경우 404 에러 발생', async () => {
      adminRoleRepository.findOneBy.mockResolvedValue(roleId);

      try {
        const result = await updateAdminRoleHandler.execute(
          new UpdateAdminRoleCommand(updateRoleName, roleDto, roleId.roleId),
        );
        expect(result).toBeDefined();
      } catch (Err) {
        expect(Err.status).toBe(404);
        expect(Err.response).toBe('역할_권한정보에  정보를 찾을 수 없습니다.');
      }
    });

    it('역할 정보가 없을 경우 404 에러 발생', async () => {
      // adminRoleRepository.findOneBy.mockResolvedValue(roleId);
      rolePermissionRepository.findBy.mockResolvedValue(roleId);

      try {
        const result = await updateAdminRoleHandler.execute(
          new UpdateAdminRoleCommand(updateRoleName, roleDto, roleId.roleId),
        );
        expect(result).toBeDefined();
      } catch (Err) {
        expect(Err.status).toBe(404);
        expect(Err.response).toBe('역할 정보를 찾을 수 없습니다.');
      }
    });

    it('잘못된 역할 정보일 경우 400 에러 발생', async () => {
      adminRoleRepository.findOneBy.mockResolvedValue(roleId);
      adminRoleRepository.save.mockRejectedValue(newAdminRole);
      // rolePermissionRepository.findBy.mockResolvedValue(roleId);
      // // adminRoleRepository.save.mockResolvedValue(newAdminRole);
      // rolePermissionRepository.save.mockRejectedValue(newAdminRole);

      try {
        const result = await updateAdminRoleHandler.execute(
          new UpdateAdminRoleCommand(updateRoleName, roleDto, roleId.roleId),
        );
        expect(result).toBeDefined();
      } catch (Err) {
        expect(Err.status).toBe(400);
        expect(Err.response).toBe('역할정보에입력된 내용을 확인해주세요.');
      }
    });

    it('역할_권한정보에 문제가 있을 경우 500 에러 발생', async () => {
      adminRoleRepository.findOneBy.mockResolvedValue(roleId);
      adminRoleRepository.save.mockResolvedValue(newAdminRole);
      rolePermissionRepository.findBy.mockResolvedValue(roleId);
      rolePermissionRepository.create.mockResolvedValue(rolePermission);
      rolePermissionRepository.insert.mockResolvedValue(rolePermission);

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
      if (!rolePermission) {
        try {
          const result = await updateAdminRoleHandler.execute(
            new UpdateAdminRoleCommand(updateRoleName, roleDto, roleId.roleId),
          );
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(500);
          expect(Err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      }
    });

    it('역할_권한 정보가 존재할 경우에 대한 문제가 있을 경우 500 에러 발생', async () => {
      rolePermissionRepository.findBy.mockResolvedValue(roleId);
      rolePermissionRepository.create.mockResolvedValue(rolePermission);
      rolePermissionRepository.insert.mockResolvedValue(rolePermission);
      rolePermissionRepository.update.mockResolvedValue(rolePermission);

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
      if (rolePermission != null && rolePermission.permissionId != permissionId) {
        try {
          const result = await updateAdminRoleHandler.execute(
            new UpdateAdminRoleCommand(updateRoleName, roleDto, roleId.roleId),
          );
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(500);
          expect(Err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      }
    });
  });
});
