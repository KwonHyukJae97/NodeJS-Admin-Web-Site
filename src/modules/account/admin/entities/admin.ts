import { IsBoolean, IsNumber } from 'class-validator';
import { Account2 } from '../../entities/account';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class Admin extends BaseEntity {
  //관리자 번호
  @PrimaryGeneratedColumn({
    name: 'admin_id',
    type: 'int',
  })
  adminId: number;

  //회원사 번호
  @IsNumber()
  @Column({
    name: 'company_id',
    type: 'int',
  })

  //역할 번호
  companyId: number;
  @IsNumber()
  @Column({
    name: 'role_id',
    type: 'int',
  })
  roleId: number;

  //관리자 타입
  @IsBoolean()
  @Column({
    name: 'is_super',
    type: 'boolean',
  })
  isSuper: boolean;

  //계정번호
  @OneToOne((type) => Account2, (account) => account.adminId, { eager: true })
  @JoinColumn({
    name: 'account_id',
  })
  accountId: Account2;
}
