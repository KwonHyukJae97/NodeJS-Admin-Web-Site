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
import JwtRefreshAuthGuard from 'src/guard/jwt/jwt-refresh-auth.guard';

/**
 * 회원가입, 로그인 등 계정 관련 auth API controller
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
   * 사용자 정보 조회
   * @returns : account 정보 반환
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getAuthInfo(@Req() req) {
    const authInfo = req.user;
    console.log('kakao test');
    console.log('카카오 정보', req.user);
    return authInfo;
  }

  /**
   * 관리자 회원가입 메소드
   * @param SignUpAdminDto : 관리자 회원가입에 필요한 dto
   * @returns : 관리자 회원가입 커맨드 전송
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
   * 사용자 회원가입 메소드
   * @param SignUpUserDto : 사용자 회원가입에 필요한 dto
   * @returns : 사용자 회원가입 커맨드 전송
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
   * 관리자 로그인 메소드
   * @param signInAdminDto : 관리자 로그인에 필요한 dto
   * @returns : 관리자 로그인 커맨드 전송
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
   * 사용자 로그인 메소드
   * @param signInAdminDto :사용자 로그인에 필요한 dto
   * @returns : 사용자 로그인 커맨드 전송
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

  // TODO : 관리자 로그인 테스트
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

  // TODO : 사용자 로그인 테스트
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
   * 관리자 로그아웃 메소드
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
   * 사용자 로그아웃 메소드
   * @param : request
   * @param : response
   * @returns : 로그아웃시 엑세스, 리프래쉬 토큰 옵션을 초기화 시키고 상태 값 리턴
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
   * 아이디 찾기 메소드
   * @param  findIdDto : 아이디 찾기에 필요한 dto
   * @returns : findIdDto(name, phone)을 findId라는 변수에 담아 리턴
   */
  @Post('/find_id')
  async findId(@Body(ValidationPipe) findIdDto: FindIdDto) {
    const findid = await this.authService.findId(findIdDto);
    console.log('아이디찾는 값 추출', findIdDto);
    return findid;
  }

  /**
   * 카카오 로그인 메소드
   * @param req : FE에서 넘어오는 카카오 유저 정보
   * @returns : 카카오 유저정보를 담은 dto를 카카오 로그인 서비스에 전송
   */
  @Post('/kakao')
  async kakaoLoginUserInfo(@Req() req, @Res({ passthrough: true }) response) {
    const userKakaoDto: UserKakaoDto = req.body;
    console.log('프론트에서 넘어오는 카카오 유저데이터', userKakaoDto);

    const snsId = userKakaoDto.snsId;
    console.log('controller snsId??', snsId);
    const snsType = '01';

    const { accessToken, accessOption } = await this.authService.kakaoGetCookieWithJwtAccessToken(
      snsId,
      snsType,
    );
    const { refreshToken, refreshOption } =
      await this.authService.kakaoGetCookieWithJwtRefreshToken(snsId, snsType);

    await this.authService.setCurrentRefreshToken2(refreshToken, snsId);

    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);

    return this.authService.kakaoUserInfos(userKakaoDto);
  }

  // TODO: 카카오 로그인 콜백
  @Post('/kakao/callback')
  // @UseGuards(AuthGuard('kakao'))
  async kakaoLoginCallback(@Req() req): Promise<UserLoginResDto> {
    const userKakaoDto: UserKakaoDto = req.body;
    return this.authService.kakaoSignIn(userKakaoDto);
  }

  // TODO: 리프레쉬 토큰
  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh')
  async refresh(@Req() request, @Res() response) {
    const account: Account = request.user;

    if (account) {
      const payload: TokenPayload = {
        accountId: account.accountId,
        id: account.id,
        snsType: account.snsType,
        snsId: account.snsId,
      };
      const { accessToken, accessOption } =
        this.jwtManageService.getCookieWithJwtAccessToken(payload);
      response.cookie('authentication', accessToken, accessOption);

      const refreshToken = request?.cookies?.refresh;
      const newRefreshToken = await this.authService.refreshTokenChange(
        account.id,
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
}
