import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminRole.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { CreateAdminRoleCommand } from './create-adminRole.command';
import { CreateAdminRoleHandler } from './create-adminRole.handler';

const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('createAdminRole', () => {
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
    createAdminRoleHandler = module.get<CreateAdminRoleHandler>(CreateAdminRoleHandler);
    adminRoleRepository = module.get<MockRepository<AdminRole>>(getRepositoryToken(AdminRole));
    rolePermissionRepository = module.get<MockRepository<RolePermission>>(
      getRepositoryToken(RolePermission),
    );
  });
  describe('역할 정보 정상 등록 여부', () => {
    it('역할 정보 등록 성공', async () => {
      const roleName = '어드민1';
      const companyId = 1;
      const roleDto = [
        {
          permissionId: 1,
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

      adminRoleRepository.create.mockReturnValue(adminRole);
      adminRoleRepository.save.mockReturnValue(adminRole);
      rolePermissionRepository.create.mockReturnValue(rolePermission);
      rolePermissionRepository.save.mockReturnValue(rolePermission);

      const result = await createAdminRoleHandler.execute(
        new CreateAdminRoleCommand(roleName, companyId, roleDto),
      );

      expect(result).toEqual('등록이 완료 되었습니다.');
    });
  });
});
