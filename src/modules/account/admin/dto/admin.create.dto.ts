// import { OmitType } from "@nestjs/mapped-types";
// import { IsString, MaxLength, MinLength, Matches } from "class-validator";
// import { Admin } from "../entities/admin.entity";

// export class CreateAdminDto {

//     @IsString()
//     @MinLength(5)
//     @MaxLength(20)
//     id: string;

//     @IsString()
//     @MinLength(4)
//     @MaxLength(80)
//     //영어랑 숫자만 가능한 유효성체크
//     @Matches(/^[a-zA-Z0-9]*$/, {
//         message: 'password only accepts english nad number223'
//     })
//     password: string;

//     @IsString()
//     @MinLength(1)
//     @MaxLength(80)
//     name: string;

//     @IsString()
//     @MinLength(10)
//     @MaxLength(100)
//     @Matches(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i, {
//         message: '이메일 양식에 맞게 입력해주세요.'
//     })
//     email: string;
    
//     @IsString()
//     @MinLength(8)
//     @MaxLength(20)
//     phone: string;

//     @IsString()
//     @MinLength(1)
//     @MaxLength(20)
//     nickname: string;

//     @IsString()
//     @MinLength(8)
//     @MaxLength(10)
//     birth: string;

//     gender: CharacterData;
    


// }