import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolePermission } from './rolePermission.entity';

/**
 * 역할에 대한 엔티티 정의
 */
@Entity('admin_role')
export class AdminRole extends BaseEntity {
  //역할 번호
  @PrimaryGeneratedColumn({
    name: 'role_id',
    type: 'int',
  })
  roleId: number;

  //회원사 번호
  @Column({
    name: 'company_id',
    type: 'int',
  })
  companyId: number;

  //역할 이름
  @Column({
    name: 'role_name',
    type: 'varchar',
    length: '50',
  })
  roleName: string;

  //등록 일시
  @CreateDateColumn({
    name: 'reg_date',
    type: 'datetime',
  })
  regDate: Date;

  //변경 일시
  @UpdateDateColumn({
    name: 'update_date',
    type: 'datetime',
    nullable: true,
  })
  updateDate: Date;

  //삭제 일시
  @DeleteDateColumn({
    name: 'del_date',
    type: 'datetime',
    nullable: true,
  })
  deleteDate: Date;
}
