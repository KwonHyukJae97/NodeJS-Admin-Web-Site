import { Inject, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import { getTime, getToday } from '../../common/utils/time-common-method';
import { FileDbInterface } from './file-db.interface';
import { ConvertException } from '../../common/utils/convert-exception';
import { QueryRunner } from 'typeorm';

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

@Injectable()
export class FileService {
  constructor(@Inject(ConvertException) private convertException: ConvertException) {}

  /**
   * S3 파일 업로드 메소드
   * @param file : 신규 파일
   * @param fileType : 파일 타입명
   * @param today : 업로드 요청일
   * @param time : 업로드 요청 시간
   * @returns : S3처리 실패 시 에러 메시지 반환 / 업로드 성공 시 void 반환
   */
  async putObjectS3(file: Express.MulterS3.File, fileType: string, today: string, time: string) {
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: file.buffer,
      Key: `${fileType}/${today}/${time}_${uuid}`,
    };

    try {
      // throw new Error('업로드 에러');
      await s3.putObject(uploadParams).promise();
      console.log('정상적으로 업로드 되었습니다.');
      return uploadParams.Key;
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
  async getObjectUrlS3(fileType: string, today: string, time: string) {
    const getParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${fileType}/${today}/${time}_${uuid}`,
    };

    let url;
    try {
      // throw new Error('url 에러');
      url = s3.getSignedUrl('getObject', getParams);
      return url;
    } catch (err) {
      return this.convertException.notFoundError('S3 파일', 404);
    }
  }

  /**
   * S3 파일 삭제 메소드
   * @param file : S3 파일 객체의 key
   * @returns : S3처리 실패 시 에러 메시지 반환 / 삭제 성공 시 void 반환
   */
  async deleteObjectS3(file) {
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: file,
    };

    try {
      // throw new Error('삭제 에러');
      await s3.deleteObject(deleteParams).promise();
      console.log('정상적으로 삭제되었습니다.');
    } catch (err) {
      console.log('S3 파일 삭제 실패', err);
      return this.convertException.badRequestS3Error('삭제', 400);
    }
  }

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
    file: Express.MulterS3.File,
    fileDbInterface: FileDbInterface,
    queryRunner: QueryRunner,
  ) {
    // 단어에 대한 파일 정보가 있을 경우
    let wordFile = [];
    if (file) {
      wordFile.push(file);
      files = wordFile;
    }

    let fileKeyList = [];

    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        // 한글 파일명 인코딩
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf-8');

        const today = getToday();
        const time = getTime();

        // S3 업로드
        const putS3Result = await this.putObjectS3(file, fileType, today, time);
        // 신규로 저장된 file key만 배열에 추가
        fileKeyList.push(putS3Result);

        // 업로드 된 파일 url 가져오기
        const url = await this.getObjectUrlS3(fileType, today, time);

        const ext = path.extname(file.originalname);

        const fileInfo = {
          originalFileName: path.basename(file.originalname, ext),
          fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
          fileExt: ext,
          filePath: url,
          fileSize: file.size,
          fieldName: file.fieldname,
        };

        // 신규 파일 정보 DB 저장
        await fileDbInterface.save(id, fileInfo, queryRunner);
      }
    } catch (err) {
      // 업로드 실패 시, 신규로 저장된 파일이 있다면 삭제
      if (fileKeyList.length !== 0) {
        for (let i = 0; i < fileKeyList.length; i++) {
          const file = fileKeyList[i];
          await this.deleteObjectS3(file);
        }
      }
      return this.convertException.badRequestS3Error('업로드', 500);
    }
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
    file: Express.MulterS3.File,
    files: Express.MulterS3.File[],
    fileDbInterface: FileDbInterface,
    queryRunner: QueryRunner,
  ) {
    // 단어에 대한 파일 정보가 있을 경우
    let wordFile = [];
    if (file) {
      wordFile.push(file);
      files = wordFile;
    }

    let fileKeyList = [];

    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        // 한글 파일명 인코딩
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf-8');

        const today = getToday();
        const time = getTime();

        // S3 업로드
        const putS3Result = await this.putObjectS3(file, fileType, today, time);
        fileKeyList.push(putS3Result);

        // 업로드 된 파일 url 가져오기
        const url = await this.getObjectUrlS3(fileType, today, time);

        const ext = path.extname(file.originalname);

        const fileInfo = {
          originalFileName: path.basename(file.originalname, ext),
          fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
          fileExt: ext,
          filePath: url,
          fileSize: file.size,
        };

        // 신규 파일 정보 DB 저장
        await fileDbInterface.save(id, fileInfo, queryRunner);

        // 기존 파일 정보 DB 삭제
        const deleteList = await fileDbInterface.delete(id, queryRunner);

        for (let i = 0; i < deleteList.length; i++) {
          const file = deleteList[i];
          await this.deleteObjectS3(file);
        }
      }
    } catch (err) {
      if (fileKeyList.length !== 0) {
        for (let i = 0; i < fileKeyList.length; i++) {
          const file = fileKeyList[i];
          await this.deleteObjectS3(file);
        }
      }
      return this.convertException.badRequestS3Error('업로드', 500);
    }
  }

  /**
   * 다중 파일 삭제 메소드
   * @param id : board_id
   * @param fileDbInterface : 파일 관련 DB 처리용 인터페이스
   * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 void 반환
   */
  async deleteFiles(id: number, fileDbInterface: FileDbInterface, queryRunner: QueryRunner) {
    // S3 key값이 담긴 배열 받기
    const deleteList = await fileDbInterface.delete(id, queryRunner);

    // S3에 저장되어 있는 기존 파일 삭제
    try {
      for (let i = 0; i < deleteList.length; i++) {
        const file = deleteList[i];
        await this.deleteObjectS3(file);
      }
    } catch (err) {
      return this.convertException.CommonError(500);
    }
  }

  // /**
  //  * 단일 파일 등록(업로드) 메소드
  //  * @param id : account_id
  //  * @param fileType : 파일 타입명
  //  * @param file : 신규 파일
  //  * @param fileDbInterface : 파일 관련 DB 처리용 인터페이스
  //  * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 등록(업로드) 성공 시 void 반환
  //  */
  // async uploadFile(
  //   id: number,
  //   fileType: string,
  //   file: Express.MulterS3.File,
  //   fileDbInterface: FileDbInterface,
  // ) {
  //   const today = getToday();
  //   const time = getTime();
  //
  //   let putS3Result;
  //
  //   try {
  //     // S3 업로드
  //     putS3Result = await this.putObjectS3(file, fileType, today, time);
  //
  //     // 업로드 된 파일 url 가져오기
  //     const url = await this.getObjectUrlS3(fileType, today, time);
  //
  //     const ext = path.extname(file.originalname);
  //
  //     const fileInfo = {
  //       originalFileName: path.basename(file.originalname, ext),
  //       fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
  //       fileExt: ext,
  //       filePath: url,
  //       fileSize: file.size,
  //     };
  //
  //     // 신규 파일 정보 DB 저장
  //     // await fileDbInterface.save(id, fileInfo);
  //   } catch (err) {
  //     if (putS3Result) {
  //       await this.deleteObjectS3(putS3Result);
  //     }
  //     return this.convertException.badRequestS3Error('업로드', 500);
  //   }
  // }
  //
  // /**
  //  * 단일 파일 수정(업로드/삭제) 메소드
  //  * @param id : account_id
  //  * @param fileType : 파일 타입명
  //  * @param file : 신규 파일
  //  * @param fileDbInterface : 파일 관련 DB 처리용 인터페이스
  //  * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 수정(업로드/삭제) 성공 시 void 반환
  //  */
  // async updateFile(
  //   id: number,
  //   fileType: string,
  //   file: Express.MulterS3.File,
  //   fileDbInterface: FileDbInterface,
  // ) {
  //   let putS3Result;
  //
  //   try {
  //     // 기존 S3에 업로드된 파일 정보 조회
  //     // const deleteFile = await fileDbInterface.delete(id);
  //
  //     // S3에 저장되어 있는 기존 파일 객체 삭제
  //     // await this.deleteObjectS3(deleteFile);
  //
  //     const today = getToday();
  //     const time = getTime();
  //
  //     // S3 업로드
  //     putS3Result = await this.putObjectS3(file, fileType, today, time);
  //
  //     // 업로드 된 파일 url 가져오기
  //     const url = await this.getObjectUrlS3(fileType, today, time);
  //
  //     const ext = path.extname(file.originalname);
  //
  //     const fileInfo = {
  //       originalFileName: path.basename(file.originalname, ext),
  //       fileName: url.split('com/')[1], // 전체 url - 공통 url(https://b2c-file-test.s3.amazonaws.com/)
  //       fileExt: ext,
  //       filePath: url,
  //       fileSize: file.size,
  //     };
  //
  //     // 신규 파일 정보 DB 저장
  //     // await fileDbInterface.save(id, fileInfo);
  //   } catch (err) {
  //     if (putS3Result) {
  //       await this.deleteObjectS3(putS3Result);
  //     }
  //     return this.convertException.badRequestS3Error('업로드', 500);
  //   }
  // }
  //
  // /**
  //  * 단일 파일 삭제 메소드
  //  * @param id : account_id
  //  * @param fileDbInterface : 파일 관련 DB 처리용 인터페이스
  //  * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 void 반환
  //  */
  // async deleteFile(id: number, fileDbInterface: FileDbInterface) {
  //   // 기존 S3에 업로드된 파일 정보 조회
  //   // const deleteFile = await fileDbInterface.delete(id);
  //   // await this.deleteObjectS3(deleteFile);
  // }
}
