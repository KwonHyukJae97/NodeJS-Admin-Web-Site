import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import { getTime, getToday } from '../../common/utils/time-common-method';
import { FileDbInterface } from './file-db.interface';
import { ConvertException } from '../../common/utils/convert-exception';
import { AccountFile } from './entities/account-file';

/**
 * 파일 관련 서비스 로직
 */
// S3 연결을 위한 설정
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uuid = randomUUID();

/**
 * S3 파일 업로드 메소드
 * @param file : 신규 파일
 * @param fileType : 파일 타입명
 * @param today : 업로드 요청일
 * @param time : 업로드 요청 시간
 * @returns : S3처리 실패 시 에러 메시지 반환 / 업로드 성공 시 void 반환
 */
async function putObjectS3(
  file: Express.MulterS3.File,
  fileType: string,
  today: string,
  time: string,
) {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Body: file.buffer,
    Key: `${fileType}/${today}/${time}_${uuid}`,
  };

  try {
    await s3.putObject(uploadParams).promise();
    console.log('정상적으로 업로드 되었습니다.');
  } catch (err) {
    console.log('S3 파일 업로드 실패', err);
    return this.convertException.badRequestS3Error('업로드 ', 400);
  }
}

/**
 * S3 파일 url 조회 메소드
 * @param fileType : 파일 타입명
 * @param today : 업로드 요청일
 * @param time : 업로드 요청 시간
 * @returns : S3처리 실패 시 에러 메시지 반환 / 조회 성공 시 void 반환
 */
async function getObjectUrlS3(fileType: string, today: string, time: string) {
  const getParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${fileType}/${today}/${time}_${uuid}`,
  };

  const url: string = await new Promise((resolve, reject) =>
    s3.getSignedUrl('getObject', getParams, (err, url) => {
      if (err) {
        reject(this.convertException.notFoundError('S3 파일', 404));
      } else {
        resolve(url.split('?')[0]);
      }
    }),
  );
  return url;
}

/**
 * S3 파일 삭제 메소드
 * @param file : S3 파일 객체의 key
 * @returns : S3처리 실패 시 에러 메시지 반환 / 삭제 성공 시 void 반환
 */
async function deleteObjectS3(file) {
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: file,
  };

  try {
    await s3.deleteObject(deleteParams).promise();
    console.log('정상적으로 삭제되었습니다.');
  } catch (err) {
    console.log('S3 파일 삭제 실패', err);
    return this.convertException.badRequestS3Error('삭제 ', 400);
  }
}

@Injectable()
export class FileService {
  constructor(@Inject(ConvertException) private convertException: ConvertException) {}

  /**
   * 다중 파일 등록(업로드) 메소드
   * @param id : board_id
   * @param fileType : 파일 타입명
   * @param files : 신규 파일 리스트
   * @param fileDbInterface : 파일 관련 DB 처리용 인터페이스
   * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 등록(업로드) 성공 시 void 반환
   */
  async uploadFiles(
    id: number,
    fileType: string,
    files: Express.MulterS3.File[],
    fileDbInterface: FileDbInterface,
  ) {
    if (!files) {
      return this.convertException.notFoundError('신규 파일', 404);
    }

    // 한글 파일명 인코딩
    files.map((file) => {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf-8');
    });

    files.map(async (file) => {
      const today = getToday();
      const time = getTime();

      // S3 업로드
      await putObjectS3(file, fileType, today, time);

      // 업로드 된 파일 url 가져오기
      const url = await getObjectUrlS3(fileType, today, time);

      const ext = path.extname(file.originalname);

      const fileInfo = {
        originalFileName: path.basename(file.originalname, ext),
        fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
        fileExt: ext,
        filePath: url,
        fileSize: file.size,
      };

      // 신규 파일 정보 DB 저장
      await fileDbInterface.save(id, fileInfo);
    });
  }

  /**
   * 다중 파일 수정(업로드/삭제) 메소드
   * @param id : board_id
   * @param fileType : 파일 타입명
   * @param files : 신규 파일 리스트
   * @param fileDbInterface : 파일 관련 DB 처리용 인터페이스
   * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 수정(업로드/삭제) 성공 시 void 반환
   */
  async updateFiles(
    id: number,
    fileType: string,
    files: Express.MulterS3.File[],
    fileDbInterface: FileDbInterface,
  ) {
    files.map(async (file) => {
      const today = getToday();
      const time = getTime();

      // S3 업로드
      await putObjectS3(file, fileType, today, time);

      // 업로드 된 파일 url 가져오기
      const url = await getObjectUrlS3(fileType, today, time);

      const ext = path.extname(file.originalname);

      const fileInfo = {
        originalFileName: path.basename(file.originalname, ext),
        fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
        fileExt: ext,
        filePath: url,
        fileSize: file.size,
      };

      // 신규 파일 정보 DB 저장
      await fileDbInterface.save(id, fileInfo);
    });

    // 기존 파일 정보 DB 삭제
    const deleteList = await fileDbInterface.delete(id);

    deleteList.map(async (file) => {
      await deleteObjectS3(file);
    });
  }

  /**
   * 다중 파일 삭제 메소드
   * @param id : board_id
   * @param fileDbInterface : 파일 관련 DB 처리용 인터페이스
   * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 void 반환
   */
  async deleteFiles(id: number, fileDbInterface: FileDbInterface) {
    // S3 key값이 담긴 배열 받기
    const deleteList = await fileDbInterface.delete(id);

    // S3에 저장되어 있는 기존 파일 삭제
    deleteList.map(async (file) => {
      await deleteObjectS3(file);
    });
  }

  /**
   * 단일 파일 등록(업로드) 메소드
   * @param id : account_id
   * @param fileType : 파일 타입명
   * @param file : 신규 파일
   * @param fileDbInterface : 파일 관련 DB 처리용 인터페이스
   * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 등록(업로드) 성공 시 void 반환
   */
  async uploadFile(
    id: number,
    fileType: string,
    file: Express.MulterS3.File,
    fileDbInterface: FileDbInterface,
  ) {
    if (!file) {
      return this.convertException.notFoundError('신규 파일', 404);
    }

    const today = getToday();
    const time = getTime();

    // S3 업로드
    await putObjectS3(file, fileType, today, time);

    // 업로드 된 파일 url 가져오기
    const url = await getObjectUrlS3(fileType, today, time);

    const ext = path.extname(file.originalname);

    const fileInfo = {
      originalFileName: path.basename(file.originalname, ext),
      fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
      fileExt: ext,
      filePath: url,
      fileSize: file.size,
    };

    // 신규 파일 정보 DB 저장
    await fileDbInterface.save(id, fileInfo);
  }

  /**
   * 단일 파일 수정(업로드/삭제) 메소드
   * @param id : account_id
   * @param fileType : 파일 타입명
   * @param file : 신규 파일
   * @param fileDbInterface : 파일 관련 DB 처리용 인터페이스
   * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 수정(업로드/삭제) 성공 시 void 반환
   */
  async updateFile(
    id: number,
    fileType: string,
    file: Express.MulterS3.File,
    fileDbInterface: FileDbInterface,
  ) {
    // 기존 S3에 업로드된 파일 정보 조회
    const deleteFile = await fileDbInterface.delete(id);

    // S3에 저장되어 있는 기존 파일 객체 삭제
    await deleteObjectS3(deleteFile);

    const today = getToday();
    const time = getTime();

    // S3 업로드
    await putObjectS3(file, fileType, today, time);

    // 업로드 된 파일 url 가져오기
    const url = await getObjectUrlS3(fileType, today, time);

    const ext = path.extname(file.originalname);

    const fileInfo = {
      originalFileName: path.basename(file.originalname, ext),
      fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
      fileExt: ext,
      filePath: url,
      fileSize: file.size,
    };

    // 신규 파일 정보 DB 저장
    await fileDbInterface.save(id, fileInfo);
  }

  /**
   * 단일 파일 삭제 메소드
   * @param id : account_id
   * @param fileDbInterface : 파일 관련 DB 처리용 인터페이스
   * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 void 반환
   */
  async deleteFile(id: number, fileDbInterface: FileDbInterface) {
    // 기존 S3에 업로드된 파일 정보 조회
    const deleteFile = await fileDbInterface.delete(id);

    await deleteObjectS3(deleteFile);
  }
}
