import { Admin } from 'src/modules/admin/entities/admin.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

/**
 * 역할_권한 정보 에 대한 엔티티 정의
 */
@Entity('role_permission')
export class RolePermission extends BaseEntity {
  //역할 번호
  @PrimaryColumn({
    primary: false,
    name: 'role_id',
    type: 'int',
  })
  roleId: number;

  //권한 번호
  @Column({
    name: 'permission_id',
    type: 'int',
  })
  permissionId: number;

  //삭제 일시
  @DeleteDateColumn({
    name: 'del_date',
    type: 'datetime',
    nullable: true,
  })
  deleteDate: Date;

  //등록 일시
  @CreateDateColumn({
    name: 'reg_date',
    type: 'datetime',
  })
  regDate: Date;
}
