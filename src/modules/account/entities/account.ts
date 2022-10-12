import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
// import { Sleeper } from 'src/modules/sleeper/entities/sleeper';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Admin } from '../admin/entities/admin';
import { User } from '../user/entities/user';

@Entity('account')
@Unique(['id'])
export class Account2 extends BaseEntity {
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
    unique: true,
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
    unique: true,
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
    unique: true,
  })
  nickname: string;

  //생년월
  @Column({
    name: 'birth',
    type: 'varchar',
    length: '8',
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
    length: '150',
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
  division: Boolean;

  @OneToOne((type) => User, (user) => user.accountId)
  userId: number;

  @OneToOne((type) => Admin, (admin) => admin.accountId)
  adminId: number;

  // @OneToOne((type) => Sleeper, (sleeper) => sleeper.sleeperAccountId)
  // sleeperAccountId: number;
}
