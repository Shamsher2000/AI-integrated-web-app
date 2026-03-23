import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/token.js'

export const requireAuth = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization || ''
    const [scheme, token] = authorization.split(' ')

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Authentication required')
    }

    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.sub)

    if (!user) {
      throw new ApiError(401, 'User account no longer exists')
    }

    req.user = user
    next()
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, 'Invalid token'))
  }
}
