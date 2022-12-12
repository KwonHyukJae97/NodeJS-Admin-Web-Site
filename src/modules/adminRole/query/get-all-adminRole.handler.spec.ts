import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { AdminRole } from '../entities/adminRole.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { GetAllAdminRoleQueryHandler } from './get-all-adminRole.handler';
import { GetAllAdminRoleQuery } from './get-all-adminRole.query';

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
    it('역할 리스트 조회 성공', async () => {
      const adminRoleList = [
        {
          roleId: 1,
          roleName: '공지사항 관리자',
          adminCount: '1',
        },
      ];

      adminRoleRepository.find.mockResolvedValue(adminRoleList);
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

      const result = await getAllAdminRoleHandler.execute(new GetAllAdminRoleQuery());

      expect(result).toEqual(adminRoleList);
    });
  });
});
