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
    it('등록 성공', async () => {
      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      adminRoleRepository.create.mockResolvedValue(adminRole);
      adminRoleRepository.save.mockResolvedValue(adminRole);
      rolePermissionRepository.create.mockResolvedValue(rolePermission);
      rolePermissionRepository.insert.mockResolvedValue(rolePermission);

      const result = await createAdminRoleHandler.execute(
        new CreateAdminRoleCommand(roleName, companyId, roleDto),
      );

      expect(result).toEqual('등록이 완료 되었습니다.');
    });

    it('잘못된 역할 정보일 경우 400 에러 발생', async () => {
      adminRoleRepository.create.mockResolvedValue(adminRole);
      adminRoleRepository.save.mockResolvedValue(adminRole);

      try {
        const result = await createAdminRoleHandler.execute(
          new CreateAdminRoleCommand(roleName, companyId, roleDto),
        );
        expect(result).toBeDefined();
      } catch (Err) {
        expect(Err.status).toBe(400);
        expect(Err.response).toBe('역할정보에 입력된 내용을 확인해주세요.');
      }
    });

    it('역할_권한 정보에 문제가 있을 경우 500 에러 발생', async () => {
      adminRoleRepository.create.mockResolvedValue(adminRole.roleId);
      adminRoleRepository.save.mockResolvedValue(adminRole.roleId);
      rolePermissionRepository.create.mockResolvedValue(rolePermission);
      rolePermissionRepository.insert.mockResolvedValue(rolePermission);

      try {
        const result = await createAdminRoleHandler.execute(
          new CreateAdminRoleCommand(roleName, companyId, roleDto),
        );
        expect(result).toBeDefined();
      } catch (Err) {
        console.log('에러로그=========', Err);
        expect(Err.status).toBe(500);
        expect(Err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
      }
    });
  });
});

//update-adminRole.handler.spec.ts
//auth (관리자, 사용자) 회원가입, 소셜 2차 정보 가입, 아이디 찾기 에러 처리 하고 진행 상항 양식 자료 채우기
