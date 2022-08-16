import {Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LocalAuthGuard} from "./local-auth.guard";
import RequestWithUser from "./request-with-user.interface";
import JwtAuthGuard from "./jwt-auth.guard";
import {response} from "express";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post('log-in')
    async logIn(@Body() request: RequestWithUser, @Res() response) {
        const {account} = request;

        const authAccount = await this.authService.getAuthUser(account.email, account.password);
        const jwtToken = this.authService.getJwtToken(authAccount.account_id, authAccount.email);

        return response.send(jwtToken);
    }

    @UseGuards(JwtAuthGuard)
    @Post('log-out')
    async logOut(@Req() request: RequestWithUser, @Res() Response) {
        response.setHeader(
            'Set-Cookie',
            this.authService.getCookieForLogOut(),
        );
        return response.sendStatus(200);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    auth(@Req() request: RequestWithUser) {
        const {account} = request;
        account.password = undefined;
        return account;
    }
}
