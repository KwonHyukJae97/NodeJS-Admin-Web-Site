import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { GetFindIdQueryHandler } from './get-findId.handler';
import { GetFindIdQuery } from './get-findId.query';

const mockRepository = () => ({
  findOne: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('FindId', () => {
  let getFindIdHandler: GetFindIdQueryHandler;
  let accountRepository: MockRepository<Account>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TranslatorModule.forRoot({
          global: true,
          defaultLang: 'ko',
          translationSource: '/src/common/i18n',
        }),
      ],
      providers: [
        GetFindIdQueryHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getFindIdHandler = module.get(GetFindIdQueryHandler);
    accountRepository = module.get<MockRepository<Account>>(getRepositoryToken(Account));
  });

  describe('아이디 찾기 성공 여부', () => {
    it('아이디 찾기 ', async () => {
      const name = '권혁재';
      const phone = '01086197872';

      const param = {
        name: name,
        phone: phone,
      };

      accountRepository.findOne.mockResolvedValue(param);

      jest.spyOn(accountRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnThis(),
        };
      });

      const result = await getFindIdHandler.execute(new GetFindIdQuery(param));

      expect(result).toEqual(result);
    });
  });
});
