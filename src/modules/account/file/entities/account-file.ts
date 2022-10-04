import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNumber, IsString } from 'class-validator';
import { Account } from '../../entities/account.entity';

/**
 * 계정 파일에 대한 엔티티 정의
 */
@Entity('account_file')
export class AccountFile {
  //파일번호
  @PrimaryGeneratedColumn({
    name: 'account_file_id',
    type: 'bigint',
  })
  accountFileId: number;

  //계정번호
  @IsNumber()
  @Column({
    name: 'account_id',
    type: 'bigint',
  })
  accountId!: number;

  //원본파일명
  @IsString()
  @Column({
    name: 'original_name',
    type: 'varchar',
    length: '255',
  })
  originalFileName: string;

  //파일명
  @IsString()
  @Column({
    name: 'file_name',
    type: 'varchar',
    length: '255',
  })
  fileName: string;

  //파일 확장자
  @IsString()
  @Column({
    name: 'file_ext',
    type: 'varchar',
    length: '5',
  })
  fileExt: string;

  //파일경로
  @IsString()
  @Column({
    name: 'file_path',
    type: 'varchar',
    length: '255',
  })
  filePath: string;

  //파일용량
  @IsNumber()
  @Column({
    name: 'file_size',
    type: 'bigint',
  })
  fileSize: number;

  //등록일시
  @CreateDateColumn({
    name: 'reg_date',
    type: 'datetime',
  })
  regDate: Date;

  //변경일시
  @CreateDateColumn({
    name: 'update_date',
    type: 'datetime',
    nullable: true,
  })
  updateDate: Date;

  //삭제일시
  @DeleteDateColumn({
    name: 'del_date',
    type: 'datetime',
    nullable: true,
  })
  delDate: Date;

  //계정 번호 가져오기
  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
