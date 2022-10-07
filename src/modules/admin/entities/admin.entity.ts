import { RolePermission } from 'src/modules/adminRole/entities/rolePermission.entity';
import { BaseEntity, Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class Admin extends BaseEntity {
  //관리자 번호
  @PrimaryGeneratedColumn({
    name: 'admin_id',
    type: 'int',
  })
  adminId: number;

  //계정번호
  @Column({
    name: 'account_id',
    type: 'bigint',
  })
  accountId: number;

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

  //역할_권한 정보 가져오기
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.admin)
  @JoinColumn({ name: 'role_id' })
  rolePermission: RolePermission[];
}
