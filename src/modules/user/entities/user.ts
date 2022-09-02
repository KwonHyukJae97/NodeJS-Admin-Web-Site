import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @IsNumber()
  @Column()
  accountId!: number;

  @IsString()
  @Column()
  state!: string;

  static from(accountId: number, state: string) {
    const user = new User();
    user.accountId = accountId;
    user.state = state;
    return user;
  }
}
