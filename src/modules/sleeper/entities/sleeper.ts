import { IsString } from 'class-validator';
import { Account2 } from 'src/modules/account/entities/account';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sleeper')
export class Sleeper extends BaseEntity {
  //휴면계정 Primary Key
  @PrimaryGeneratedColumn()
  @OneToOne((type) => Account2, (account) => account.accountId, { eager: true })
  @JoinColumn({
    name: 'account_id',
  })
  sleeperAccountId: Account2;

  // 비밀번호
  @IsString()
  @Column({
    name: 'password',
    type: 'varchar',
    length: '80',
  })
  password: string;

  //아이디
  @IsString()
  @Column({
    name: 'id',
    type: 'varchar',
    length: '20',
    unique: true,
  })
  id: string;

  //이름
  @IsString()
  @Column({
    name: 'name',
    type: 'varchar',
    length: '80',
  })
  name: string;

  //연락처
  @IsString()
  @Column({
    name: 'phone',
    type: 'varchar',
    length: '20',
  })
  phone: string;

  @IsString()
  @Column({
    name: 'email',
    type: 'varchar',
    length: '80',
  })
  email: string;

  //생년월일
  @IsString()
  @Column({
    name: 'birth',
    type: 'varchar',
    length: '8',
  })
  birth: string;

  //sns아이디
  @IsString()
  @Column({
    name: 'sns_id',
    type: 'varchar',
    length: '100',
  })
  snsId: string;

  //sns 타입 (00:naver, 01:kakao, 02: google, 03:apple)
  @IsString()
  @Column({
    name: 'sns_type',
    type: 'char',
    length: '2',
  })
  snsType: string;

  //성별
  @IsString()
  @Column({
    name: 'gender',
    type: 'char',
  })
  gender: string;

  //CI고유번호
  @IsString()
  @Column({
    name: 'ci',
    type: 'varchar',
    length: '255',
  })
  ci: string;

  //등록일시
  @CreateDateColumn({
    name: 'reg_date',
    type: 'datetime',
  })
  regDate: Date;
}
