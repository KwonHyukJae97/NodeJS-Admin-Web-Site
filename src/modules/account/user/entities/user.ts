import { Account } from '../../entities/account';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 앱 사용자에 대한 엔티티 정의
 */
@Entity('user')
export class User extends BaseEntity {
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

  //계정번호
  @OneToOne((type) => Account, (account) => account.userId, { eager: true })
  @JoinColumn({
    name: 'account_id',
  })
  accountId: Account;

  //account 정보 가져오기
  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
