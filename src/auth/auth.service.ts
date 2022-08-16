import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from '@nestjs/config';
import { AccountService } from 'src/modules/account/account.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly accountService: AccountService,
    ) {
    }

    public async getAuthUser(email: string, plainTextPassword: string) {

        try {

            const account = await this.accountService.getByEmail(email);
            await this.verifyPassword(plainTextPassword, account.password);
            account.password = undefined;
            return account;

        } catch (e) {
            throw new HttpException(
                '잘못된 인증 정보입니다.',
                HttpStatus.BAD_REQUEST,
            );
        }

    }

    private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await bcrypt.compare(
            plainTextPassword,
            hashedPassword,
        );

        if (!isPasswordMatching) {
            throw new HttpException(
                '잘못된 인증 정보입니다.',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    public getJwtToken(account_id: number, email: string) {
        const payload: TokenPayload = {
            account_id: account_id,
            email: email,
        };
        const token = this.jwtService.sign(payload);
        return token;
    }

    public getCookieForLogOut() {
        return `Authorization=; HttpOnly; Path=/; Max-Age=0`;
    }
}
