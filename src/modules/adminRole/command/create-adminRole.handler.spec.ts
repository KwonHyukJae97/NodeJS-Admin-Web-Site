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
    adminRoleRepository = module.get<MockRepository<AdminRole>>(getRepositoryToken(AdminRole));
    rolePermissionRepository = module.get<MockRepository<RolePermission>>(
      getRepositoryToken(RolePermission),
    );
  });

  it('be defined', () => {
    expect(adminRoleRepository).toBeDefined();
  });

  describe('역할 정보 정상 등록 여부', () => {
    it('등록에 성공할 경우', async () => {
      // Given
      const roleName = '공지사항 관리자';
      const companyId = 2;
      const roleDto = [
        {
          permissionId: 4,
          grantType: '1',
        },
      ];

      // When
      const result = await createAdminRoleHandler.execute(
        new CreateAdminRoleCommand(roleName, companyId, roleDto),
      );

      // // Then
      expect(result).toEqual('등록이 완료 되었습니다.');
    });
  });
});
