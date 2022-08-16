import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {ConfigService} from "@nestjs/config";
import {AccountService} from "../modules/account/account.service";
import {Request} from "express";
import {Account} from "../modules/account/entities/account.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        // private readonly accountService: AccountService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.Authentication;
                },
            ]),
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(payload: TokenPayload) {
        return new Account();
        // return this.accountService.getById(payload.account_id);
    }
}