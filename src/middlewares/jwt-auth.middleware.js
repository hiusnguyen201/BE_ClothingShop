import { REGEX_PATTERNS } from '#src/core/constant';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '#src/core/exception/http-exception';
import { checkUserHasPermissionByMethodAndEndpointService, getUserByIdService } from '#src/app/v1/users/users.service';
import { USER_TYPE } from '#src/app/v1/users/users.constant';
import { verifyTokenService } from '#src/app/v1/auth/auth.service';

async function authorized(req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  if (!token) {
    return next(new UnauthorizedException('No token provided'));
  }

  if (!token.match(REGEX_PATTERNS.BEARER_TOKEN)) {
    return next(new BadRequestException('Invalid token format. Format is Authorization: Bearer [token]'));
  }

  token = token.split(' ')[1];

  const decoded = await verifyTokenService(token);
  if (!decoded) {
    return next(new UnauthorizedException('Invalid or expired token'));
  }

  const user = await getUserByIdService(decoded.id);
  if (!user || !user.isVerified) {
    return next(new ForbiddenException('Unverified user'));
  }

  req.user = decoded;
  next();
}

async function checkPermission(req, res, next) {
  if (!req?.user) {
    return next(new UnauthorizedException('User not logged in'));
  }

  // Convert to dynamic path
  let endpoint = req.originalUrl;
  Object.entries(req.params).map(([key, value]) => {
    endpoint = endpoint.replace(value, `:${key}`);
  });

  const hasPermission = await checkUserHasPermissionByMethodAndEndpointService(req.user.id, {
    method: req.method,
    endpoint,
  });

  return hasPermission ? next() : next(new ForbiddenException("Don't have permission to access this resource"));
}

async function checkCustomer(req, res, next) {
  if (!req?.user) {
    return next(new UnauthorizedException('User not logged in'));
  }

  console.log(req?.user);

  return req.user?.type === USER_TYPE.CUSTOMER
    ? next()
    : next(new ForbiddenException("Don't have permission to access this resource"));
}

export const isAuthorized = [authorized];
export const isAuthorizedAndIsCustomer = [authorized, checkCustomer];
export const isAuthorizedAndHasPermission = [authorized, checkPermission];
