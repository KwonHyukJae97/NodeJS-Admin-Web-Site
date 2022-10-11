import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNumber, IsString } from 'class-validator';

/**
 * 게시글 파일에 대한 엔티티 정의
 */

@Entity('board_file')
export class BoardFile {
  // 파일 번호
  @PrimaryGeneratedColumn({
    name: 'board_file_id',
  })
  boardFileId: number;

  // 게시글 번호
  @IsNumber()
  @Column({
    name: 'board_id',
  })
  boardId!: number;

  // 원본 파일명
  @IsString()
  @Column({
    name: 'original_name',
  })
  originalFileName: string;

  // 파일명
  @IsString()
  @Column({
    name: 'file_name',
  })
  fileName: string;

  // 파일 확장자
  @IsString()
  @Column({
    name: 'file_ext',
  })
  fileExt: string;

  // 파일 경로
  @IsString()
  @Column({
    name: 'file_path',
  })
  filePath: string;

  // 파일 용량
  @IsNumber()
  @Column({
    name: 'file_size',
  })
  fileSize: number;

  // 등록일시
  @CreateDateColumn({
    name: 'reg_date',
  })
  regDate: Date;

  // 수정일시
  @UpdateDateColumn({
    name: 'update_date',
    nullable: true,
  })
  updateDate: Date;

  // 삭제일시
  @DeleteDateColumn({
    name: 'del_date',
    nullable: true,
  })
  delDate: Date;
}
