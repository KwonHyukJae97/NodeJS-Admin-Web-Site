import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from '../../account.entity';

@Entity('user')
export class User extends BaseEntity {
  //회원 번호
  @PrimaryGeneratedColumn({
    name: 'user_id',
    type: 'bigint',
  })
  userId: number;

  //계정 번호
  @Column({
    name: 'account_id',
    type: 'bigint',
  })
  accountId: number;

  //학년 정보
  @Column({
    name: 'grade',
    type: 'tinyint',
  })
  grade: number;

  @ManyToOne(() => Account, (account) => account.user)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
