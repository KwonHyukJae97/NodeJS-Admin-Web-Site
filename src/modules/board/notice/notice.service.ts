import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Board } from "../entities/board";
import { Notice } from "./entities/notice";
import { Repository } from "typeorm";
import { CreateNoticeDto } from "./dto/create-notice.dto";

/**
 * 공지사항 관련 서비스 로직 작성 (추후, CQRS 패턴으로 수정 예정)
 */

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  // 공지사항 등록 메서드
  async createNotice(createNoticeDto: CreateNoticeDto) {
    const { title, content, isTop, noticeGrant } = createNoticeDto;

    const board = this.boardRepository.create({
      // 임시 accountId 부여
      accountId: 1,
      boardTypeCode: '0',
      title,
      content,
      viewCount: 0,
    });

    await this.boardRepository.save(board);

    const notice = this.noticeRepository.create({
      noticeGrant,
      isTop,
      boardId: board,
    });

    await this.noticeRepository.save(notice);

    return '공지사항 등록 성공';
  }

  // 공지사항 목록 조회 메서드
  async getAllNotices() {
    // notice 리스트 반환 (notice + board)
    return this.noticeRepository.find();
  }
}
