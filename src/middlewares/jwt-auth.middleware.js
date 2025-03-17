'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import { checkUserHasPermissionByMethodAndEndpointService, getUserByIdService } from '#src/app/v1/users/users.service';
import { USER_TYPE } from '#src/app/v1/users/users.constant';
import { verifyTokenService } from '#src/app/v1/auth/auth.service';
import { Code } from '#src/core/code/Code';

async function authorized(req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['token'];

  if (!token) {
    return next(HttpException.new({ code: Code.TOKEN_REQUIRED }));
  }

  const decoded = await verifyTokenService(token);
  if (!decoded) {
    return next(HttpException.new({ code: Code.INVALID_TOKEN }));
  }

  const user = await getUserByIdService(decoded.id);
  if (!user || !user.isVerified) {
    return next(HttpException.new({ code: Code.UNVERIFIED }));
  }

  req.user = decoded;
  next();
}

async function checkPermission(req, res, next) {
  // Convert to dynamic path
  let endpoint = req.originalUrl;
  Object.entries(req.params).map(([key, value]) => {
    endpoint = endpoint.replace(value, `:${key}`);
  });

  const hasPermission = await checkUserHasPermissionByMethodAndEndpointService(req.user.id, {
    method: req.method,
    endpoint,
  });

  console.log(hasPermission);

  return hasPermission ? next() : next(HttpException.new({ code: Code.ACCESS_DENIED }));
}

async function checkCustomer(req, res, next) {
  return req.user?.type === USER_TYPE.CUSTOMER ? next() : next(HttpException.new({ code: Code.ACCESS_DENIED }));
}

export const isAuthorized = [authorized];
export const isAuthorizedAndIsCustomer = [authorized, checkCustomer];
export const isAuthorizedAndHasPermission = [authorized, checkPermission];
