import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';

/**
 * 게시글 파일에 대한 엔티티 정의
 */

@Entity('board_file')
export class BoardFile {
  @PrimaryGeneratedColumn({
    name: 'board_file_id',
  })
  boardFileId: number;

  @IsNumber()
  @Column({
    name: 'board_id',
  })
  boardId!: number;

  @IsString()
  @Column({
    name: 'original_name',
  })
  originalFileName: string;

  @IsString()
  @Column({
    name: 'file_name',
  })
  fileName: string;

  @IsString()
  @Column({
    name: 'file_ext',
  })
  fileExt: string;

  @IsString()
  @Column({
    name: 'file_path',
  })
  filePath: string;

  @IsNumber()
  @Column({
    name: 'file_size',
  })
  fileSize: number;

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
}
