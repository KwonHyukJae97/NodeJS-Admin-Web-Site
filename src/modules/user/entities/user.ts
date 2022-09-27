import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber } from 'class-validator';
import { Account } from './account';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @IsNumber()
  @Column()
  account_id!: number;

  @IsNumber()
  @Column()
  grade!: number;

  @ManyToOne(() => Account, (account) => account.user)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  static from(grade: number) {
    const user = new User();
    user.grade = grade;
    return user;
  }
}
