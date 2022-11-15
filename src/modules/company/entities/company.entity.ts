import { Admin } from 'src/modules/account/admin/entities/admin';
import { UserCompany } from 'src/modules/account/user/entities/user-company';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 회원사에 필요한 엔티티 정의
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

  //사업자 번호
  @Column({
    name: 'business_number',
    type: 'varchar',
    length: '12',
  })
  businessNumber: string;

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

  //관리자 admin_id
  @OneToMany(() => Admin, (admin) => admin.company)
  @JoinColumn({ name: 'company_id' })
  admin: Admin[];

  //회원사에 속한 user 정보 가져오기
  @OneToMany(() => UserCompany, (userCompany) => userCompany.company)
  @JoinColumn({ name: 'company_id' })
  userCompany: UserCompany[];
}
