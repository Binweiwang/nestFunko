import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Usuario } from '../../users/entities/user.entity'
import { AuthService } from '../auth.service'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // el token como barer token
      ignoreExpiration: false,
      secretOrKey: Buffer.from(
        process.env.TOKEN_SECRET || 'ME_GUSTAN_LOS_FUNKOS',
        'utf-8',
      ).toString('base64'),
    })
  }

  async validate(payload: Usuario) {
    const id = payload.id
    return await this.authService.validateUser(id)
  }
}
