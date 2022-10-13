import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@Entity()
export class Account3 {
  @PrimaryGeneratedColumn({
    name: 'account_id',
  })
  accountId: number;

  @IsString()
  @Column({ unique: true })
  email: string;

  @IsString()
  @Column({
    nullable: true,
    length: 18,
  })
  password: string;

  @IsString()
  @Column({
    nullable: true,
  })
  nickname: string;

  @IsString()
  @Column({
    nullable: true,
  })
  name: string;

  @IsString()
  @Column({
    nullable: true,
  })
  hp: string;

  @IsOptional()
  @IsString()
  @Column({
    nullable: true,
  })
  ci: string | null;

  @IsOptional()
  @IsString()
  @Column({
    nullable: true,
  })
  di: string | null;

  @IsOptional()
  @IsString()
  @Column({
    name: 'current_hashed_refresh_token',
    nullable: true,
  })
  currentHashedRefreshToken: string;

  @IsNumber()
  @Column({
    name: 'role_id',
    nullable: true,
  })
  roleId: number;

  @CreateDateColumn({
    name: 'reg_date',
  })
  regDate: Date;

  @IsString()
  role: string;
  ability;

  static from(email: string, password: string, nickname: string, name: string, hp: string) {
    const account = new Account3();
    account.email = email;
    account.password = password;
    account.nickname = nickname;
    account.name = name;
    account.hp = hp;
    return account;
  }
}
