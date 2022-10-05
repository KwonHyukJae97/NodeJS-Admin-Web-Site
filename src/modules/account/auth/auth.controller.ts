import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { response } from 'express';
import { request } from 'http';
import { JwtManageService } from 'src/guard/jwt/jwt-manage.service';
import JwtRefreshAuthGuard from 'src/guard/jwt/jwt-refresh-auth.guard';
import { LocalAuthGuard } from 'src/guard/local/local-auth.guard';
import { AccountService } from 'src/modules/account-bak/account.service';
import { Account2 } from '../entities/account';
import { AuthService2 } from './auth2.service';
import { SignUpAdminCommand } from './command/signup-admin.command';
import { SignUpUserCommand } from './command/signup-user.command';
import { SignInAdminDto } from './dto/signin-admin.dto';
import { SignInUserDto } from './dto/signin-user.dto';
import { SignUpAdminDto } from './dto/signup-admin.dto';
import { SignUpUserDto } from './dto/signup-user.dto';

/**
 * 회원가입, 로그인 등 계정 관련 auth 컨트롤러
 */
@Controller('auth')
export class SignController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService2: AuthService2,
    private readonly accountService: AccountService,
  ) {}

  /**
   * 관리자 회원가입 컨트롤러
   */
  @HttpCode(200)
  @Post('/signup/admin')
  async signUpAdmin(@Body(ValidationPipe) SignUpAdminDto: SignUpAdminDto): Promise<string> {
    const {
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      companyId,
      roleId,
      isSuper,
      division,
    } = SignUpAdminDto;
    console.log('Admin 컨트롤러 로그', SignUpAdminDto);
    const command = new SignUpAdminCommand(
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      companyId,
      roleId,
      isSuper,
      division,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 사용자 회원가입 컨트롤러
   */
  @HttpCode(200)
  @Post('/signup/user')
  async signUpUser(@Body(ValidationPipe) SignUpUserDto: SignUpUserDto): Promise<string> {
    const { id, password, name, email, phone, nickname, birth, gender, grade } = SignUpUserDto;

    console.log('User 컨트롤러 로그', SignUpUserDto);
    const command = new SignUpUserCommand(
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      grade,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 사용자 로그인 컨트롤러 (RefreshToken 발급안됨.)
   */
  @HttpCode(200)
  @Post('/signin/user')
  async signInUser(
    @Body(ValidationPipe) signinUserDto: SignInUserDto,
  ): Promise<{ accessToken: string }> {
    console.log('사용자 로그인 컨트롤러 로그', signinUserDto);

    return this.authService2.signInUser(signinUserDto);
  }

  /**
   * 관리자 로그인 컨트롤러 (RefreshToken 발급안됨.)
   */
  @HttpCode(200)
  @Post('/signin/admin')
  async signInAdmin(
    @Body(ValidationPipe) signinAdminDto: SignInAdminDto,
  ): Promise<{ accessToken: string }> {
    console.log('관리자 로그인 컨트롤러 로그', signinAdminDto);

    return this.authService2.signInAdmin(signinAdminDto);
  }
  //이거주석해제
  // @HttpCode(200)
  // @Post('/login2/admin')
  // async loginAdmin2(@Req() request, @Res() response) {
  //   const { accessToken, accessOption, refreshToken, refreshOption } =
  //     await this.authService2.getCookieForLogin2(request.account.accountId, request.account.id);

  //   response.cookie('Authorization', accessToken, accessOption);
  //   response.cookie('refresh', refreshToken, refreshOption);

  //   return response.send({
  //     adminData: request.admin,
  //   });
  // }

  //관리자 로그인
  @Post('/login2/admin')
  async loginAdmin2(
    @Res({ passthrough: true }) response,
    @Body(ValidationPipe) signInAdminDto: SignInAdminDto,
  ) {
    const { accessToken, accessOption, refreshToken, refreshOption, admin } =
      await this.authService2.login(signInAdminDto);
    response.cookie('authentication', accessToken, accessOption);
    response.cookie('refresh', refreshToken, refreshOption);
    return { admin };
  }

  // @HttpCode(200)
  // // @UseGuards(LocalAuthGuard)
  // @Post('/login2/admin')
  // async loginAdmin2(@Req() request, @Res() response) {
  //   const admin = request.admin;
  //   const { accessToken, ...accessOption } = this.authService2.getCookieWithJwtAccessToken2(
  //     admin.accountId,
  //   );
  //   const { refreshToken, ...refreshOption } = this.authService2.getCookieWithJwtRefreshToken2(
  //     admin.accountId,
  //   );
  //   console.log('refreshToken Test!!!: ', admin);
  //   await this.accountService.setCurrentRefreshToken2(admin.accountId, refreshToken);

  //   response.cookie('authorization', accessToken, accessOption);
  //   response.cookie('refresh', refreshToken, refreshOption);

  //   return admin;
  // }

  //로그아웃
  @UseGuards(JwtRefreshAuthGuard)
  @Get('/logout2/admin')
  async logoutAdmin2(@Res() response, account: Account2) {
    const { accessOption, refreshOption } = this.authService2.getCookieForLogOut2();

    await this.accountService.removeRefreshToken2(account.accountId);

    response.cookie('authorization', '', accessOption);
    response.cookie('refresh', '', refreshOption);

    return response.sendStatus(200);
  }

  //RefreshToken 재발급
  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh2')
  async refresh2(@Res() response, account: Account2) {
    if (account) {
      const { accessToken, accessOption } = await this.authService2.getCookieWithJwtAccessToken2(
        account.id,
      );
      response.cookie('authauthauth', accessToken, accessOption);
      return { account };
    }
  }
  // const account: Account2 = request.admin;

  // if (account) {
  //   const payload: TokenPayload2 = {
  //     accountId: account.accountId,
  //     id: account.id,
  //   };
  //   const { accessToken, accessOption } = this.authService2.getCookieWithJwtAccessToken2(payload);
  //   response.cookie('Authoriztion', accessToken, accessOption);

  //   const refreshToken = request?.cookies?.refresh;
  //   const newRefreshToken = await this.authService2.refreshTokenChange2(
  //     account.accountId,
  //     payload,
  //     refreshToken,
  //   );

  //   if (newRefreshToken) {
  //     response.cookie('refresh', newRefreshToken.refreshToken, newRefreshToken.refreshOption);
  //   }
  // }
  // }
}
