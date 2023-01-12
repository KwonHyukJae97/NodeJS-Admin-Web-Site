import { WordLevel } from 'src/modules/wordLevel/entities/wordLevel.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('project')
export class Project {
  //프로젝트 번호
  @PrimaryGeneratedColumn({
    name: 'project_id',
    type: 'bigint',
  })
  projectId: number;

  //단어 레벨 번호
  @Column({
    name: 'word_level_id',
    type: 'bigint',
  })
  wordLevelId: number;

  //프로젝트명
  @Column({
    name: 'project_name',
    type: 'varchar',
  })
  projectName: string;

  //서비스 여부
  @Column({
    name: 'is_service',
    type: 'boolean',
  })
  isService: boolean;

  //등록자
  @Column({
    name: 'reg_by',
    type: 'varchar',
    length: '20',
  })
  regBy: string;

  //수정자
  @Column({
    name: 'update_by',
    type: 'varchar',
    length: '20',
  })
  updateBy: string;

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

  //단어 레벨 정보
  @OneToOne(() => WordLevel)
  @JoinColumn({ name: 'word_level_id' })
  wordLevel: WordLevel;
}
