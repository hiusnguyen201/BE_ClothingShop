import { REGEX_PATTERNS } from '#core/constant';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '#core/exception/http-exception';
import { verifyToken } from '#utils/jwt.util';
import { checkUserHasPermissionByMethodAndEndpointService, getUserByIdService } from '#src/app/v1/users/users.service';

async function authorized(req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  if (!token) {
    return next(new UnauthorizedException('No token provided'));
  }

  if (!token.match(REGEX_PATTERNS.BEARER_TOKEN)) {
    return next(new BadRequestException('Invalid token format. Format is Authorization: Bearer [token]'));
  }

  token = token.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    if (!decoded || !(await getUserByIdService(decoded._id))) {
      return next(new UnauthorizedException('Invalid or expired token'));
    }

    req.user = decoded;
    next();
  } catch (e) {
    return next(new UnauthorizedException('Invalid or expired token'));
  }
}

async function checkPermission(req, res, next) {
  if (!req?.user) {
    next(new UnauthorizedException('User not logged in'));
  }

  // Convert to dynamic path
  let endpoint = req.originalUrl;
  Object.entries(req.params).map(([key, value]) => {
    endpoint = endpoint.replace(value, `:${key}`);
  });

  const hasPermission = await checkUserHasPermissionByMethodAndEndpointService(req.user._id, {
    method: req.method,
    endpoint,
  });

  return hasPermission ? next() : next(new ForbiddenException("Don't have permission to access this resource"));
}

export const isAuthorized = [authorized];
export const isAuthorizedAndHasPermission = [authorized, checkPermission];
