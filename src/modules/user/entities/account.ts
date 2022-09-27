import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsString } from 'class-validator';
import { User } from './user';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  account_id!: number;

  @OneToMany(() => User, (user) => user.account)
  user: User[];

  @IsString()
  @Column()
  id: string;

  @IsString()
  @Column()
  password: string;

  @IsString()
  @Column()
  name: string;

  @IsString()
  @Column()
  email: string;

  @IsString()
  @Column()
  phone: string;

  @IsString()
  @Column()
  nickname: string;

  @IsString()
  @Column()
  birth: string;

  @IsString()
  @Column()
  gender: string;

  @Column()
  reg_date: Date;

  @Column()
  update_date: Date;

  grade: number;

  static from(email: string, nickname: string, password: string, phone: string, grade: number) {
    const account = new Account();
    account.email = email;
    account.nickname = nickname;
    account.password = password;
    account.phone = phone;
    account.grade = grade;
    return account;
  }
}
