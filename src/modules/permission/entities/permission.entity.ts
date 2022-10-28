import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
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

  //권한 종류
  @Column({
    name: 'grant_type',
    type: 'char',
  })
  grantType: string;

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
}
