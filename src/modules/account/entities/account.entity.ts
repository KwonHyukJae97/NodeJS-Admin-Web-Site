import { Temporary } from 'src/modules/temporary/entities/temporary';
// import { Sleeper } from 'src/modules/sleeper/entities/sleeper';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Admin } from '../admin/entities/admin.entity';
import { User } from '../user/entities/user.entity';

/**
 * account에 대한 엔티티 정의
 */

@Entity('account')
export class Account {
  //계정번호
  @PrimaryGeneratedColumn({
    name: 'account_id',
    type: 'bigint',
  })
  accountId: number;

  //아이디
  @Column({
    name: 'id',
    type: 'varchar',
    length: '20',
  })
  id: string;

  //비밀번호
  @Column({
    name: 'password',
    type: 'varchar',
    length: '80',
  })
  password: string;

  //이름
  @Column({
    name: 'name',
    type: 'varchar',
    length: '80',
  })
  name: string;

  //이메일
  @Column({
    type: 'varchar',
    length: '100',
  })
  email: string;

  //연락처
  @Column({
    name: 'phone',
    type: 'varchar',
    length: '20',
  })
  phone: string;

  //닉네임
  @Column({
    name: 'nickname',
    type: 'varchar',
    length: '20',
  })
  nickname: string;

  //생년월
  @Column({
    name: 'birth',
    type: 'varchar',
    length: '12',
  })
  birth: string;

  //성별 (0:M, 1:F)
  @Column({
    name: 'gender',
    type: 'char',
  })
  gender: string;

  //리프레쉬 토큰
  // @IsOptional()
  // @Exclude()
  @Column({
    name: 'current_hashed_refresh_token',
    type: 'varchar',
    length: '250',
    nullable: true,
  })
  currentHashedRefreshToken: string;

  //CI고유번호
  @Column({
    name: 'ci',
    type: 'varchar',
    length: '255',
  })
  ci: string;

  //sns아이디
  @Column({
    name: 'sns_id',
    type: 'varchar',
    length: '100',
  })
  snsId: string;

  //sns타입
  @Column({
    name: 'sns_type',
    type: 'char',
    length: '2',
  })
  snsType: string;

  //sns토큰
  @Column({
    name: 'sns_token',
    type: 'varchar',
    length: '250',
  })
  snsToken: string;

  //가입 일시
  @CreateDateColumn({
    name: 'reg_date',
    type: 'datetime',
  })
  regDate: Date;

  //정보수정 일시
  @UpdateDateColumn({
    name: 'update_date',
    type: 'datetime',
  })
  updateDate: Date;

  //회원탈퇴 일시
  @DeleteDateColumn({
    name: 'del_date',
    type: 'datetime',
  })
  delDate?: Date | null;

  //최근 로그인 일시
  @Column({
    name: 'login_date',
    type: 'datetime',
  })
  loginDate: Date;

  //관리자 or 사용자 구분(true: 관리자, false: 사용자)
  @Column({
    name: 'division',
    type: 'boolean',
  })
  division: boolean;

  @OneToOne((type) => Temporary, (temporary) => temporary.accountId)
  temporaryId: number;

  //admin 정보 가져오기
  @OneToOne(() => Admin)
  @JoinColumn({ name: 'account_id' })
  admin: Admin;

  //user 정보 가져오기
  @OneToOne(() => User)
  @JoinColumn({ name: 'account_id' })
  user: User;

  // @OneToOne((type) => Sleeper, (sleeper) => sleeper.sleeperAccountId)
  // sleeperAccountId: number;
}
