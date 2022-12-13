import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { RolePermission } from '../entities/rolePermission.entity';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { GetAdminRoleInfoQueryHandler } from './get-adminRole-info.handler';
import { Admin } from '../../account/admin/entities/admin';
import { GetAdminRoleInfoQuery } from './get-adminRole-info.query';

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
    it('역할 상세정보 조회 성공', async () => {
      const roleId = 1;
      const getAdminInfo = null;
      const rolePermissionRawList = [
        {
          RP_role_id: 1,
          P_permission_id: 1,
          RP_grant_type: '0',
          P_menu_name: '메뉴1',
          P_display_name: '화면1',
        },
        {
          RP_role_id: 1,
          P_permission_id: 1,
          RP_grant_type: '1',
          P_menu_name: '메뉴1',
          P_display_name: '화면1',
        },
      ];

      const grantTypeList = [
        {
          grant_type: '0',
        },
        {
          grant_type: '1',
        },
      ];

      const permissionList = [
        {
          permission_id: rolePermissionRawList[0].P_permission_id,
          menu_name: rolePermissionRawList[0].P_menu_name,
          display_name: rolePermissionRawList[0].P_display_name,
          grant_type_list: grantTypeList,
        },
      ];

      jest.spyOn(rolePermissionRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getRawMany: () => rolePermissionRawList,
        };
      });

      const result = await getAdminRoleInfohanlder.execute(
        new GetAdminRoleInfoQuery(roleId, getAdminInfo),
      );

      expect(result).toEqual(permissionList);
    });
  });
});
