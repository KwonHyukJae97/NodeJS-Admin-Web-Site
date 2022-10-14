import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../account/entities/account';
// import { Account } from "../accounted/entities/account.entity";
import { Admin } from './entities/admin.entity';
// import { AdminRepository } from './query/admin.repository';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Account>,
  ) {}

  async deleteAccountById(id: number): Promise<void> {
    //   console.log('deleteTest:', id);
    //   const result = await this.adminRepository.delete(id);
    //   console.log('deleteTest222:', id);
    //   // console.log("deleteTest4:", id)
    //   // if (result.affected === 0) {
    //   //     throw new NotFoundException(`can't find id ${id}`);
    //   // }
    //   // console.log("deleteTest3:", id)
    //   console.log('result', result);
    // }
  }
}
