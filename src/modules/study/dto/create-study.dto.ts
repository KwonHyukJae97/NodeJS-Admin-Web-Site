import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PercentDto } from './percent.dto';

/**
 * 학습관리 등록 dto
 */
export class CreateStudyDto {
  //학습영역코드
  readonly studyTypeCode: string;
  //학습명
  @IsNotEmpty()
  @IsString()
  readonly studyName: string;

  //학습대상
  @IsNotEmpty()
  @IsString()
  readonly studyTarget: string;

  //학습정보
  @IsNotEmpty()
  @IsString()
  readonly studyInformation: string;

  //성취도 평가 점수
  @IsNotEmpty()
  @IsNumber()
  readonly testScore: number;

  //서비스 여부
  @IsNotEmpty()
  @IsBoolean()
  readonly isService: boolean;

  //측정레벨이하
  @IsNotEmpty()
  @IsString()
  readonly checkLevelUnder: string;

  //측정해당레벨
  @IsNotEmpty()
  @IsString()
  readonly checkLevel: string;

  //등록자
  @IsNotEmpty()
  @IsString()
  readonly regBy: string;

  //----학습설정정보----

  //   //학년범위시작
  // @IsNotEmpty()
  // @IsString()
  // readonly gradeStart: string;

  // //학년범위종료
  // @IsNotEmpty()
  // @IsString()
  // readonly gradeEnd: string;

  //   //----백분율 정보----
  // 부모 엔티티에서 자식 정보 조회가 필요할 경우, 아래와 같이 사용
  // @OneToOne((type) => Notice, (notice) => notice.boardId)
  // noticeId: number;
  //
  // @OneToOne((type) => Faq, (faq) => faq.boardId)
  // faqId: number;
  //
  // @OneToOne((type) => Qna, (qna) => qna.boardId)
  // qnaId: number;
  //
  // @ManyToOne((type) => Word, (word) => word.examples, {
  //   createForeignKeyConstraints: false,
  // })
  // word: Word;
  @IsNotEmpty()
  readonly percentList: PercentDto[];
  //등급명
  // @IsNotEmpty()
  // @IsString()
  // readonly rankName: string;

  // //백분율
  // @IsNotEmpty()
  // @IsNumber()
  // readonly percent: number;

  // //백분율 순번
  // @IsNotEmpty()
  // @IsNumber()
  // readonly percentSequence: number;

  //----레벨수준정보----

  //수준
  @IsNotEmpty()
  @IsString()
  readonly standard: string;

  //아는 수 오차
  @IsNotEmpty()
  @IsNumber()
  readonly knownError: number;

  //레벨수준 순번
  @IsNotEmpty()
  @IsNumber()
  readonly levelStandardSequence: number;

  //----학년별 레벨병 등급 정보----

  //학년
  @IsNotEmpty()
  @IsNumber()
  readonly gradeRank: number;

  //----학습구성정보----이미지파일추가

  //등록진행방식
  @IsNotEmpty()
  @IsString()
  readonly registerMode: string;

  //기본 학습 진행 방식
  @IsNotEmpty()
  @IsString()
  readonly studyMode: string;

  //교재명
  @IsNotEmpty()
  @IsString()
  readonly textbookName: string;

  //교재순번
  @IsNotEmpty()
  @IsNumber()
  readonly textbookSequence: number;

  //----학습단원정보----

  //단원명
  @IsNotEmpty()
  @IsString()
  readonly unitName: string;

  //단원순번
  @IsNotEmpty()
  @IsNumber()
  readonly unitSequence: number;
}
