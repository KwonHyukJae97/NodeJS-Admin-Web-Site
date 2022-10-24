import { RolePermission } from 'src/modules/adminRole/entities/rolePermission.entity';
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

/**
 * 권한에 대한 엔티티 정의
 */
@Entity('permission')
export class Permission extends BaseEntity {
  //권한 번호
  @PrimaryGeneratedColumn({
    name: 'permission_id',
    type: 'int',
  })
  permissionId: number;

  //메뉴명
  @Column({
    name: 'menu_name',
    type: 'varchar',
    length: '50',
  })
  menuName: string;

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

  //등록 일시
  @CreateDateColumn({
    name: 'reg_date',
    type: 'datetime',
  })
  regDate: Date;

  //role_permission 정보 가져오기
  @OneToOne(() => RolePermission)
  @JoinColumn({ name: 'permission_id' })
  rolePermission: RolePermission;
}
