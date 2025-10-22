import { CanActivate, ExecutionContext, Injectable, HttpException } from '@nestjs/common'

const DEFAULT_TOKEN = '8673c8bfb68df6c834cb8f1ec5c2bb367418390b7e675c9d71d2f5281d6a1e4c'

@Injectable()
export class ApiTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const token = (req.headers?.authorization || req.headers?.Authorization) as string | undefined
    const expected = process.env.API_AUTH_TOKEN || DEFAULT_TOKEN
    const ok = token === expected
    if (!ok) {
      throw new HttpException({ message: 'Authorization error', statusCode: 2, error: undefined }, 401)
    }
    return true
  }
}
