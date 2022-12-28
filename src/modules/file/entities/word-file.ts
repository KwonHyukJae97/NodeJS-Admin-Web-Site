import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 단어 파일에 대한 엔티티 정의
 */
@Entity('word_file')
export class WordFile {
  // 파일 번호
  @PrimaryGeneratedColumn({
    name: 'word_file_id',
    type: 'bigint',
  })
  wordFileId: number;

  // 단어 번호
  @Column({
    name: 'word_id',
    type: 'bigint',
  })
  wordId!: number;

  // 파일 종류 (00:설명 이미지, 01:그림 이미지, 02:음원, 03:영상)
  @Column({
    name: 'file_code',
    type: 'char',
    length: '2',
  })
  fileCode: string;

  // 원본 파일명
  @Column({
    name: 'original_name',
    type: 'varchar',
    length: '255',
  })
  originalFileName: string;

  // 파일명
  @Column({
    name: 'file_name',
    type: 'varchar',
    length: '255',
  })
  fileName: string;

  // 파일 확장자
  @Column({
    name: 'file_ext',
    type: 'varchar',
    length: '5',
  })
  fileExt: string;

  // 파일 경로
  @Column({
    name: 'file_path',
    type: 'varchar',
    length: '255',
  })
  filePath: string;

  // 파일 용량
  @Column({
    name: 'file_size',
    type: 'bigint',
  })
  fileSize: number;

  // 등록일시
  @CreateDateColumn({
    name: 'reg_date',
    type: 'datetime',
  })
  regDate: Date;

  // 수정일시
  @UpdateDateColumn({
    name: 'update_date',
    type: 'datetime',
    nullable: true,
  })
  updateDate: Date;

  // 삭제일시
  @DeleteDateColumn({
    name: 'del_date',
    type: 'datetime',
    nullable: true,
  })
  delDate: Date;
}
