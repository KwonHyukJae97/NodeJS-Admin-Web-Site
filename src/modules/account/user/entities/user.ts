import { IsNumber } from 'class-validator';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from '../../entities/account';

@Entity('user')
export class User extends BaseEntity {
  //회원 번호
  @PrimaryGeneratedColumn({
    name: 'user_id',
    type: 'bigint',
  })
  userId: number;

  //학년 정보
  @IsNumber()
  @Column({
    name: 'grade',
    type: 'tinyint',
  })
  grade: number;

  //계정번호
  @OneToOne((type) => Account, (account) => account.userId, { eager: true })
  @JoinColumn({
    name: 'account_id',
  })
  accountId: Account;
}
