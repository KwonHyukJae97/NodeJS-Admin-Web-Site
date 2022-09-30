// import { Inject, Injectable } from '@nestjs/common';
// import { ConfigType } from '@nestjs/config';
// import { Account } from '../../src/modules/account/entities/account';
// import * as jwt from 'jsonwebtoken';
// import authConfig from 'src/config/authConfig';

// @Injectable()
// export class SignService {
//   constructor(@Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>) {}

//   signin(account: Account) {
//     const payload = { ...account };

//     return jwt.sign(payload, this.config.jwtSecret, {
//       expiresIn: '1d',
//       audience: 'example.com',
//       issuer: 'example.com',
//     });
//   }
// }
