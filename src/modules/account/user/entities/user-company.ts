import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

/**
 * 회원사에 속한 앱 사용자에 대한 엔티티 정의
 */
@Entity('user_company')
export class UserCompany extends BaseEntity {
  //회원 번호
  @PrimaryColumn({
    primary: false,
    name: 'user_id',
    type: 'bigint',
  })
  userId: number;

  //회원사 번호
  @Column({
    name: 'company_id',
    type: 'int',
  })
  companyId: number;

  // 등록일시
  @CreateDateColumn({
    name: 'reg_date',
    type: 'datetime',
  })
  regDate: Date;

  // 삭제일시
  @DeleteDateColumn({
    name: 'del_date',
    type: 'datetime',
    nullable: true,
  })
  delDate: Date;
}
