import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  LoggerService,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../src/guard/local/local-auth.guard';
import JwtAuthGuard from '../src/guard/jwt/jwt-auth.guard';
import { response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import JwtRefreshAuthGuard from 'src/guard/jwt/jwt-refresh-auth.guard';
import { Account } from '../src/modules/account-bak/entities/account.entity';
import { JwtManageService } from '../src/guard/jwt/jwt-manage.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly authService: AuthService,
    private readonly jwtManageService: JwtManageService,
  ) {}

  /**
   * 웹 관리자 회원가입
   * @param request
   */
  @HttpCode(200)
  @Post('register/admin11')
  registerAdmin(@Req() request) {}

  /**
   * 앱 사용자 회원가입
   * @param request
   */
  @HttpCode(200)
  @Post('register/user11')
  registerUser(@Req() request) {}

  /**
   * 웹 관리자 로그인
   * @param request
   * @param response
   */
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login/admin')
  async logInAdmin(@Req() request, @Res() response) {
    const { accessToken, accessOption, refreshToken, refreshOption } =
      await this.authService.getCookieForLogin(request.user.accountId, request.user.email);

    response.cookie('authorization', accessToken, accessOption);
    response.cookie('refresh', refreshToken, refreshOption);

    return response.send({
      userData: request.user,
    });
  }

  // /**
  //  * 앱 사용자 로그인
  //  * @param request
  //  * @param response
  //  */
  // @HttpCode(200)
  // @UseGuards(LocalAuthGuard)
  // @Post('login/user')
  // async logInUser(@Req() request, @Res() response) {
  //
  //     const { accessToken, accessOption, refreshToken, refreshOption } = await this.authService.getCookieForLogin(request.user.accountId, request.user.email);
  //
  //     return response.send({
  //         userData: request.user,
  //     });
  // }

  /**
   * 웹 관리자 로그아웃
   * @param request
   * @param response
   */
  @UseGuards(JwtRefreshAuthGuard)
  @Post('logout/admin')
  async logoutAdmin(@Req() request, @Res() response) {
    const { accessOption, refreshOption } = this.authService.getCookieForLogOut();
    await this.authService.removeRefreshToken(request.user.accountId);

    response.cookie('authorization', '', accessOption);
    response.cookie('refresh', '', refreshOption);

    return response.sendStatus(200);
  }

  // /**
  //  * 앱 사용자 로그아웃
  //  * @param request
  //  * @param Response
  //  */
  // @UseGuards(JwtAuthGuard)
  // @Post('logout/user')
  // async logoutUser(@Req() request, @Res() Response) {
  //
  //     return response.sendStatus(200);
  // }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh')
  async refresh(@Req() request, @Res() response) {
    const account: Account = request.user;

    if (account) {
      const payload: TokenPayload = {
        accountId: account.accountId,
        email: account.email,
      };
      const { accessToken, accessOption } =
        this.jwtManageService.getCookieWithJwtAccessToken(payload);
      response.cookie('authorization', accessToken, accessOption);

      const refreshToken = request?.cookies?.refresh;
      const newRefreshToken = await this.authService.refreshTokenChange(
        account.accountId,
        payload,
        refreshToken,
      );

      if (newRefreshToken) {
        response.cookie('refresh', newRefreshToken.refreshToken, newRefreshToken.refreshOption);
      }
    }

    return response.send({
      userData: request.user,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async me(@Req() request, @Res() response) {
    //TODO : 임시로 role 정의
    request.user.role = 'admin';
    delete request.user.ci;
    delete request.user.di;
    delete request.user.regDate;
    delete request.user.hp;
    delete request.user.roleId;
    //
    // email: "admin@materialize.com"
    // fullName: "John Doe"
    // id: 1
    // role: "admin"
    // username: "johndoe"

    return response.send({
      userData: request.user,
    });
  }
}
