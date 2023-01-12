import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { GetFileDownloadQuery } from './get-file-download.query';
import { BoardFile } from '../entities/board-file.entity';
import * as AWS from 'aws-sdk';
import { ConvertException } from '../../../common/utils/convert-exception';

// S3 연결을 위한 설정
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * 단일 파일 다운로드용 쿼리 핸들러
 */
@QueryHandler(GetFileDownloadQuery)
export class GetFileDownloadHandler implements IQueryHandler<GetFileDownloadQuery> {
  constructor(
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 단일 파일 다운로드(조회) 메소드
   * @param query : 단일 파일 조회 쿼리
   * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 파일 정보 반환
   */
  async execute(query: GetFileDownloadQuery) {
    const { fileId, res } = query;

    const file = await this.fileRepository.findOneBy({ boardFileId: fileId });

    if (!file) {
      return this.convertException.notFoundError('파일', 404);
    }

    const fileName = file.originalFileName + file.fileExt;
    const downloadName = encodeURIComponent(`${fileName}`); // 한글 파일명 사용 시 인코딩

    const getParam = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file.fileName,
    };

    // headObject()를 통해 S3에 해당 파일이 있는지 확인
    try {
      await s3.headObject(getParam).promise();

      // 브라우저에게 파일을 다운로드 하도록 알려주기 위해 Header에 Content-Disposition 설정하여 응답
      res.setHeader('Content-Disposition', `attachment; filename=${downloadName}`);

      try {
        await s3
          .getObject(getParam)
          .createReadStream()
          .pipe(res)
          .on('error', (err) => {
            console.log(err);
            return this.convertException.CommonError(500);
          });
      } catch (err) {
        console.log('파일 읽어오기 실패', err);
        return this.convertException.badRequestS3Error('읽기 ', 400);
      }
    } catch (err) {
      console.log('S3 파일 다운로드 실패', err);
      return this.convertException.notFoundError('S3 파일', 404);
    }

    // 파일 정보 반환 (임시)
    return file;
  }
}
