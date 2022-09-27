import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsNumber, IsString } from "class-validator";
import { Notice } from "../notice/entities/notice";

/**
 * 게시글에 대한 엔티티 정의
 */

@Entity()
export class Board {
  @PrimaryGeneratedColumn({
    name: 'board_id',
  })
  boardId: number;

  @IsNumber()
  @Column({
    name: 'account_id',
  })
  accountId!: number;

  @IsString()
  @Column({
    name: 'board_type_code',
  })
  boardTypeCode: string;

  @IsString()
  @Column()
  title: string;

  @IsString()
  @Column()
  content: string;

  @IsNumber()
  @Column({
    name: 'view_count',
  })
  viewCount: number;

  @CreateDateColumn({
    name: 'reg_date',
  })
  regDate: Date;

  @CreateDateColumn({
    name: 'update_date',
    nullable: true,
  })
  updateDate: Date;

  @CreateDateColumn({
    name: 'del_date',
    nullable: true,
  })
  delDate: Date;

  @OneToOne((type) => Notice, (notice) => notice.boardId)
  noticeId: number;
}
