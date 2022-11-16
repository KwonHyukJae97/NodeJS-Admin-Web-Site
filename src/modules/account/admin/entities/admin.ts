import { Account } from 'src/modules/account/entities/account';
import { AdminRole } from 'src/modules/adminRole/entities/adminRole.entity';
import { RolePermission } from 'src/modules/adminRole/entities/rolePermission.entity';
import { Company } from 'src/modules/company/entities/company.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  // 계정 번호
  @Column({
    name: 'account_id',
    type: 'bigint',
  })
  accountId: number;

  // 계정 정보
  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  //역할_권한 정보 가져오기
  @OneToOne(() => RolePermission)
  @JoinColumn({ name: 'role_id' })
  rolePermission: RolePermission;

  //회원사 정보 가져오기
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  //역할 정보 가져오기
  @ManyToOne(() => AdminRole)
  @JoinColumn({ name: 'role_id' })
  adminRole: AdminRole;
}
