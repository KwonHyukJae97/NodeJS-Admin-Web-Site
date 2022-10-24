import { Account } from 'src/modules/account/entities/account';
import { RolePermission } from 'src/modules/adminRole/entities/rolePermission.entity';
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
  @Column({
    name: 'company_id',
    type: 'int',
  })
  companyId: number;

  //역할 번호
  @Column({
    name: 'role_id',
    type: 'int',
  })
  roleId: number;

  //관리자 타입
  @Column({
    name: 'is_super',
    type: 'boolean',
  })
  isSuper: boolean;

  //계정번호
  @OneToOne((type) => Account, (account) => account.adminId, { eager: true })
  @JoinColumn({
    name: 'account_id',
  })
  accountId: Account;

  //account 정보 가져오기
  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  //역할_권한 정보 가져오기
  @OneToOne(() => RolePermission)
  @JoinColumn({ name: 'role_id' })
  rolePermission: RolePermission;
}
