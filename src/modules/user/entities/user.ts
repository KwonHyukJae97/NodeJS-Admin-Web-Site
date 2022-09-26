import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';

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

  static from(account_id: number, grade: number) {
    const user = new User();
    user.account_id = account_id;
    user.grade = grade;
    return user;
  }
}
