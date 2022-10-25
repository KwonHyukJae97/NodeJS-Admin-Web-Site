import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/guard/jwt/jwt-auth.guard';
import { JwtManageService } from 'src/guard/jwt/jwt-manage.service';
import { LocalAuthGuard } from 'src/guard/local/local-auth.guard';
import { AccountService } from 'src/modules/account-bak/account.service';
import { Repository } from 'typeorm';
import { Account } from '../entities/account';
import { AuthService } from './auth.service';
import { SignUpAdminCommand } from './command/signup-admin.command';
import { SignUpUserCommand } from './command/signup-user.command';
import { FindIdDto } from './dto/findid.dto';
import { SignInAdminDto } from './dto/signin-admin.dto';
import { SignInUserDto } from './dto/signin-user.dto';
import { SignUpAdminDto } from './dto/signup-admin.dto';
import { SignUpUserDto } from './dto/signup-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserKakaoDto } from './dto/user.kakao.dto';
import { SignInAdminCommand } from './command/signin-admin.command';
import { SignInUserCommand } from './command/signin-user.command';
import { SignInUserHandler } from './command/signin-user.handler';
import { UserLoginResDto } from './dto/login-res.dto';
import { response } from 'express';

/**
 * 회원가입, 로그인 등 계정 관련 auth 컨트롤러
 */
@Controller('auth')
export class SignController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
    private readonly jwtManageService: JwtManageService,
    private readonly signInUserHandler: SignInUserHandler,
    @InjectRepository(Account)
    private accountRepository2: Repository<Account>,
  ) {}

  /**
   * 관리자 회원가입 컨트롤러
   */
  @Post('/register/admin')
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
  @Post('/register/user')
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
   *
   * @param signInAdminDto
   * @param response
   * @returns SignInAdminCommand에 로그인 정보를 담아 SignInAdminHandler에 보낸후 절차를 걸쳐 통과되면 토큰을 발급하여 command를 리턴
   */
  @UseGuards(LocalAuthGuard)
  @Post('/login/admin')
  async loginAdmin(
    @Body(ValidationPipe) signInAdminDto: SignInAdminDto,
    @Res({ passthrough: true }) response,
  ) {
    const { id, password } = signInAdminDto;

    console.log('cqrs 방식 관리자 로그인 테스트', signInAdminDto);

    const command = new SignInAdminCommand(id, password);
    const { accessToken, accessOption } = await this.authService.getCookieWithJwtAccessToken(
      id,
      null,
    );
    const { refreshToken, refreshOption } = await this.authService.getCookieWithJwtRefreshToken(
      id,
      null,
    );

    await this.authService.setCurrentRefreshToken(refreshToken, id);

    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);

    console.log('쿠키 값 조회 command', command);
    console.log('쿠키 값 조회 accessToken', accessToken);
    console.log('쿠키 값 조회 refreshToken', refreshToken);

    return this.commandBus.execute(command);
  }

  /**
   *
   * @param signInUserDto
   * @param response
   * @returns SignInUserCommand에 로그인 정보를 담아 SignInUserHandler에 보낸후 절차를 걸쳐 통과되면 토큰을 발급하여 command를 리턴
   */
  @UseGuards(LocalAuthGuard)
  @Post('/login/user')
  async loginUser(
    @Body(ValidationPipe) signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) response,
  ) {
    const { id, password } = signInUserDto;

    console.log('cqrs 방법으로 사용자 로그인 테스트', signInUserDto);

    const command = new SignInUserCommand(id, password);

    const { accessToken, accessOption } = await this.authService.getCookieWithJwtAccessToken(
      id,
      null,
    );
    const { refreshToken, refreshOption } = await this.authService.getCookieWithJwtRefreshToken(
      id,
      null,
    );

    await this.authService.setCurrentRefreshToken(refreshToken, id);

    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);

    console.log('쿠키 값 조회 command', command);
    console.log('쿠키 값 조회 accessToken', accessToken);
    console.log('쿠키 값 조회 refreshTokn', refreshToken);
    return this.commandBus.execute(command);
  }

  //관리자 로그인 테스트
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/login/admin/test')
  async loginAdmin2(
    @Res({ passthrough: true }) response,
    @Body(ValidationPipe) signInAdminDto: SignInAdminDto,
  ) {
    const { accessToken, accessOption, refreshToken, refreshOption, account } =
      await this.authService.loginAdmin(signInAdminDto);
    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);
    console.log('AccessToken 테스트', accessToken);
    console.log('RefreshToken 테스트', refreshToken);
    console.log('AccessOption 테스트', accessOption);
    console.log('RefreshOption 테스트', refreshOption);
    return { account };
  }

  //사용자 로그인 테스트
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/login/user/test')
  async loginUser2(
    @Res({ passthrough: true }) response,
    @Body(ValidationPipe) signInUserDto: SignInUserDto,
  ) {
    const { accessToken, accessOption, refreshToken, refreshOption, account } =
      await this.authService.loginUser(signInUserDto);
    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);
    console.log('AccessToken 테스트', accessToken);
    console.log('RefreshToken 테스트', refreshToken);
    console.log('AccessOption 테스트', accessOption);
    console.log('RefreshOption 테스트', refreshOption);
    return { account };
  }

  /**
   *
   * @param request
   * @param response
   * @returns 로그아웃시 엑세스, 리프래쉬 토큰 옵션을 초기화 시키고 상태 값 리턴
   */
  @UseGuards(JwtAuthGuard)
  @Post('/logout/admin')
  async logoutAdmin(@Req() request, @Res() response) {
    const { accessOption, refreshOption } = this.authService.getCookiesForLogOut2();
    await this.authService.removeRefreshToken(request.user.accountId);
    response.cookie('authentication', '', accessOption);
    response.cookie('Refresh', '', refreshOption);

    return response.sendStatus(200), '로그아웃 완료';
  }

  /**
   *
   * @param request
   * @param response
   * @returns 로그아웃시 엑세스, 리프래쉬 토큰 옵션을 초기화 시키고 상태 값 리턴
   */
  @UseGuards(JwtAuthGuard)
  @Post('/logout/user')
  async logoutUser(@Req() request, @Res() response) {
    const { accessOption, refreshOption } = this.authService.getCookiesForLogOut2();
    await this.authService.removeRefreshToken(request.user.accountId);
    response.cookie('authentication', '', accessOption);
    response.cookie('Refresh', '', refreshOption);

    return response.sendStatus(200);
  }

  /**
   *
   * @param findIdDto
   * @returns findIdDto(name, phone)을 findId라는 변수에 담아 리턴
   */
  @Post('/find_id')
  async findId(@Body(ValidationPipe) findIdDto: FindIdDto) {
    const findid = await this.authService.findId(findIdDto);
    console.log('아이디찾는 값 추출', findIdDto);
    return findid;
  }

  // @Get('/kakao')
  // @UseGuards(AuthGuard('kakao'))
  // async kakaoLogin() {
  //   return HttpStatus.OK;
  // }

  // //kakako 로그인 v1
  // @Get('/kakao/callback')
  // @UseGuards(AuthGuard('kakao'))
  // async kakaoLoginCallback(@Req() request): Promise<any> {
  //   return this.authService.kakaoLogin(request.user as UserKakaoDto);
  // }

  //kakao 로그인 v1
  // @Get('/kakao')
  // @UseGuards(AuthGuard('kakao'))
  // async kakaoLogin() {
  //   return HttpStatus.OK;
  // }

  // //kakako 로그인 v1
  // @Get('/kakao/callback')
  // @UseGuards(AuthGuard('kakao'))
  // async kakaoLoginCallback(@Req() request): Promise<{ accessToken: string }> {
  //   const code = request.query.code;
  //   return this.authService.kakaoUserInfo(code);
  // }

  // @Get('/kakao')
  // // @UseGuards(AuthGuard('kakao'))
  // async kakaoLogin(@Req() req) {
  //   const code = req.query.code;
  //   console.log('카카오 인가코드', code);
  //   return this.authService.kakaoUserInfo(code);
  // }

  @Post('/kakao')
  async kakaoLoginUserInfo(@Req() req, @Res({ passthrough: true }) response) {
    const userKakaoDto: UserKakaoDto = req.body;
    console.log('프론트에서 넘어오는 카카오 유저데이터', userKakaoDto);

    const id = userKakaoDto.snsId;
    const snsType = '01';

    const { accessToken, accessOption } = await this.authService.getCookieWithJwtAccessToken(
      id,
      snsType,
    );
    const { refreshToken, refreshOption } = await this.authService.getCookieWithJwtRefreshToken(
      id,
      snsType,
    );

    await this.authService.setCurrentRefreshToken(refreshToken, id);

    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);

    return this.authService.kakaoUserInfos(userKakaoDto);
  }

  @Post('/kakao/callback')
  // @UseGuards(AuthGuard('kakao'))
  async kakaoLoginCallback(@Req() req): Promise<UserLoginResDto> {
    const userKakaoDto: UserKakaoDto = req.body;
    return this.authService.kakaoSignIn(userKakaoDto);
  }
  //휴면계정 처리
  // @Get('/sleeper')
  // @HttpCode(200)
  // async sleeperCheck() {
  //   return HttpStatus.OK;
  // }

  // @UseGuards(JwtRefreshAuthGuard)
  // @Post('/refresh')
  // async refresh(@Req() request, @Res() response) {
  //   const account: Account = request.user;

  //   if (account) {
  //     const payload: TokenPayload2 = {
  //       accountId: account.accountId,
  //       id: account.id,
  //     };
  //     const { accessToken, accessOption } =
  //       this.jwtManageService.getCookieWithJwtAccessToken(payload);
  //     response.cookie('authentication', accessToken, accessOption);

  //     const refreshToken = request?.cookies?.refresh;
  //     const newRefreshToken = await this.authService.refreshTokenChange(
  //       account.accountId,
  //       payload,
  //       refreshToken,
  //     );
  //     if (newRefreshToken) {
  //       response.cookie('refresh', newRefreshToken.refreshToken, newRefreshToken.refreshOption);
  //     }
  //   }
  //   return response.send({
  //     userData: request.user,
  //   });
  // }

  // @UseGuards(JwtRefreshAuthGuard)
  // @Post('/refresh')
  // refresh(@Req() request, @Res({ passthrough: true }) response) {
  //   const user = request.user;
  //   const { accessToken, ...accessOption } = this.authService.getCookieWithJwtAccessToken2(
  //     request.user.id,
  //   );
  //   response.cookie('authentication', accessToken, accessOption);
  //   return user;
  // }

  // RefreshToken 유효한지 확인 후 AccessToken 발급
  // @UseGuards(JwtRefreshAuthGuard)
  // @Post('/refresh2')
  // async refresh2(@Req() request, @Res() response) {
  //   const account: Account = request.user;
  //   if (account) {
  //     const { accessToken, accessOption } = await this.authService.getCookieWithJwtAccessToken2(
  //       account.id,
  //     );
  //     response.cookie('authentication', accessToken, accessOption);
  //     return { account };
  //   }
  // }

  // const account: Account = request.user;

  // if (account) {
  //   const payload: TokenPayload2 = {
  //     accountId: account.accountId,
  //     id: account.id,
  //   };
  //   const { accessToken, accessOption } = this.authService.getCookieWithJwtAccessToken2(payload);
  //   response.cookie('Authoriztion', accessToken, accessOption);

  //   const refreshToken = request?.cookies?.refresh;
  //   const newRefreshToken = await this.authService.refreshTokenChange2(
  //     account.accountId,
  //     payload,
  //     refreshToken,
  //   );

  //   if (newRefreshToken) {
  //     response.cookie('Refresh', newRefreshToken.refreshToken, newRefreshToken.refreshOption);
  //   }
  // }
  // }
}
