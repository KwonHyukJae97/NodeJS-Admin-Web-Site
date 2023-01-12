import { Account } from '../../entities/account';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 앱 사용자에 대한 엔티티 정의
 */
@Entity('user')
export class User {
  //회원 번호
  @PrimaryGeneratedColumn({
    name: 'user_id',
    type: 'bigint',
  })
  userId: number;

  //학년 정보
  @Column({
    name: 'grade',
    type: 'tinyint',
  })
  grade: number;

  // 계정 번호
  @Column({
    name: 'account_id',
    type: 'bigint',
  })
  accountId: number;

  // 계정 정보
  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
