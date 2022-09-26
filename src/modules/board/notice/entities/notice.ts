import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { Board } from "../../entities/board";

/**
 * 공지사항에 대한 엔티티 정의
 */

@Entity()
export class Notice {
  @PrimaryGeneratedColumn({
    name: 'notice_id',
  })
  noticeId: number;

  // @IsNumber()
  // @Column({
  //   name: 'board_id',
  // })
  // boardId: number;

  @IsString()
  @Column({
    name: 'notice_grant',
  })
  noticeGrant: string;

  @IsBoolean()
  @Column({
    name: 'is_top',
  })
  isTop: boolean;

  @OneToOne((type) => Board, (board) => board.noticeId, { eager: true })
  @JoinColumn({
    name: 'board_id',
  })
  boardId: Board;
}
