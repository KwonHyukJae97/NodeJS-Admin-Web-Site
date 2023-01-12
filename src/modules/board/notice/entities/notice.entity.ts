import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from '../../entities/board.entity';

/**
 * 공지사항에 대한 엔티티 정의
 */
@Entity()
export class Notice {
  // 공지사항 번호
  @PrimaryGeneratedColumn({
    name: 'notice_id',
    type: 'bigint',
  })
  noticeId: number;

  // 공지사항 조회권한 (0:본사, 1:회원사, 2:사용자)
  @Column({
    name: 'notice_grant',
    type: 'varchar',
    length: '10',
  })
  noticeGrant: string;

  // 상단 고정 여부 (0:false(미사용), 1:true(사용))
  @Column({
    name: 'is_top',
    type: 'boolean',
  })
  isTop: boolean;

  // 게시글 번호
  @Column({
    name: 'board_id',
    type: 'bigint',
  })
  boardId: number;

  // 게시글 정보
  @OneToOne(() => Board)
  @JoinColumn({
    name: 'board_id',
  })
  board: Board;
}
