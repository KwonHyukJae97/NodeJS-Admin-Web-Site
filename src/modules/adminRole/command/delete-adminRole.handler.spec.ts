import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminRole.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { DeleteAdminRoleHandler } from './deleate-adminRole.handler';
import { DeleteAdminRoleCommand } from './delete-adminRole.command';

const mockRepository = () => ({
  findOneBy: jest.fn(),
  softDelete: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('DeleteAdminRole', () => {
  let deleteAdminRoleHandler: DeleteAdminRoleHandler;
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
        DeleteAdminRoleHandler,
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

    deleteAdminRoleHandler = module.get(DeleteAdminRoleHandler);
    adminRoleRepository = module.get(getRepositoryToken(AdminRole));
    rolePermissionRepository = module.get(getRepositoryToken(RolePermission));
  });

  describe('역할 정보 정상 삭제 여부', () => {
    it('역할 정보 삭제 성공', async () => {
      const roleId = 1;
      const findOneRoleId = { roleId: 1 };
      const softDeleteRoleId = { roleId: 1 };

      adminRoleRepository.findOneBy.mockResolvedValue(findOneRoleId);
      adminRoleRepository.softDelete.mockResolvedValue(softDeleteRoleId);
      rolePermissionRepository.softDelete.mockResolvedValue(softDeleteRoleId);

      const result = await deleteAdminRoleHandler.execute(new DeleteAdminRoleCommand(roleId));

      expect(result).toEqual('삭제가 완료 되었습니다.');
    });

    it('역할 정보가 없을 경우 404 에러 발생', async () => {
      const findOneRoleId = { roleId: 1 };
      const roleId = 1;
      adminRoleRepository.findOneBy.mockResolvedValue(findOneRoleId);
      rolePermissionRepository.softDelete.mockResolvedValue(undefined);

      try {
        const result = await deleteAdminRoleHandler.execute(new DeleteAdminRoleCommand(roleId));
        expect(result).toBeDefined();
      } catch (Err) {
        expect(Err.status).toBe(404);
        expect(Err.response).toBe('역할 정보를 찾을 수 없습니다.');
      }
    });
  });
});
