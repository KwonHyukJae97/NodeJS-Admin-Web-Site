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
 * 회원사 정보 수정에 필요한 엔티티 정의
 */
@Entity('company')
export class Company extends BaseEntity {
  //회원사 번호
  @PrimaryGeneratedColumn({
    name: 'company_id',
    type: 'int',
  })
  companyId: number;

  //회원사명
  @Column({
    name: 'company_name',
    type: 'varchar',
    length: '80',
  })
  companyName: string;

  //회원사 코드
  @Column({
    name: 'company_code',
    type: 'mediumint',
  })
  companyCode: number;

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
  })
  updateDate: Date;

  //회원사 탈퇴 일시
  @DeleteDateColumn({
    name: 'del_date',
    type: 'datetime',
  })
  delDate?: Date | null;
}
