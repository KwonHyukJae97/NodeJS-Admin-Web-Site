import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { BoardFile } from '../entities/board-file.entity';
import * as AWS from 'aws-sdk';
import { GetAllFileDownloadQuery } from './get-files-download.query';
import { Board } from '../../board/entities/board.entity';
import { PassThrough } from 'stream';
import * as archiver from 'archiver';
import { getTime } from '../../../common/utils/time-common-method';
import { ConvertException } from '../../../common/utils/convert-exception';

// S3 연결을 위한 설정
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * 다중 파일 압축 메소드
 * @param files : 다중 파일
 * @returns : S3/압축처리 실패 시 에러 메시지 반환 / 조회 성공 시 압축 파일 정보 반환
 */
async function multiFilesStream(files) {
  const archive = archiver('zip', { zlib: { level: 5 } });

  for (const file of files) {
    const passThrough = new PassThrough();

    const getParam = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.fileName,
    };

    // s3에 해당 파일이 있는지 확인 후, 파일 정보 읽기
    try {
      await s3.headObject(getParam).promise();

      await s3
        .getObject(getParam)
        .createReadStream()
        .pipe(passThrough)
        .on('error', (err) => {
          console.log(err);
          return this.convertException.CommonError(500);
        });
      archive.append(passThrough, { name: file.originalFileName + file.fileExt });

      // s3에 파일이 없을 경우 예외처리
    } catch (err) {
      console.log('S3 파일 다운로드 실패', err);
      return this.convertException.notFoundError('S3 파일', 404);
    }
  }
  return archive;
}

// TODO : 작동 테스트 확인 후, 삭제 예정 (convertException이 주입되지 않아서 동일한 로직을 상단과 같이 함수형으로 작성)
// const multiFilesStream = async (files) => {
//   const archive = archiver('zip', { zlib: { level: 5 } });
//
//   for (const file of files) {
//     const passThrough = new PassThrough();
//
//     const getParam = {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: file.fileName,
//     };
//
//     // s3에 해당 파일이 있는지 확인 후, 파일 정보 읽기
//     try {
//       await s3.headObject(getParam).promise();
//
//       await s3
//         .getObject(getParam)
//         .createReadStream()
//         .pipe(passThrough)
//         .on('error', (err) => {
//           console.log(err);
//           return this.convertException.CommonError(500);
//         });
//       archive.append(passThrough, { name: file.originalFileName + file.fileExt });
//
//       // s3에 파일이 없을 경우 예외처리
//     } catch (err) {
//       console.log('S3 파일 다운로드 실패', err);
//       return this.convertException.notFoundError('S3 파일', 404);
//     }
//   }
//   return archive;
// };

/**
 * 다중 파일 다운로드용 쿼리 핸들러
 */
@QueryHandler(GetAllFileDownloadQuery)
export class GetAllFilesDownloadHandler implements IQueryHandler<GetAllFileDownloadQuery> {
  constructor(
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 다중 파일 다운로드(조회) 메소드
   * @param query : 다중 파일 조회 쿼리
   * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 압축 파일 정보 반환
   */
  async execute(query: GetAllFileDownloadQuery) {
    const { boardId, res } = query;

    const files = await this.fileRepository.findBy({ boardId: boardId });

    if (files.length === 0) {
      return this.convertException.notFoundError('파일', 404);
    }

    // 현재 시간으로 파일명 설정
    const downloadName = getTime() + '.zip';

    res.setHeader('Content-Disposition', `attachment; filename=${downloadName}`);

    const mfStream = await multiFilesStream(files);
    mfStream.pipe(res);
    mfStream.finalize();
  }
}
