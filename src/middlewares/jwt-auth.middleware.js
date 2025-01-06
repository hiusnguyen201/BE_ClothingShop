import { REGEX_PATTERNS } from "#src/core/constant";
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "#src/core/exception/http-exception";
import { verifyToken } from "#src/utils/jwt.util";
import { checkUserHasPermissionByMethodAndEndpointService } from "#src/modules/users/users.service";

export async function isAuthorized(req, res, next) {
  let token =
    req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return next(new UnauthorizedException("No token provided"));
  }

  if (!token.match(REGEX_PATTERNS.BEARER_TOKEN)) {
    return next(
      new BadRequestException(
        "Invalid token format. Format is Authorization: Bearer [token]"
      )
    );
  }

  token = token.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new UnauthorizedException("Invalid token"));
    }

    req.user = decoded;
    next();
  } catch (e) {
    return next(new UnauthorizedException("Invalid token"));
  }
}

export async function hasPermission(req, res, next) {
  if (!req?.user) {
    next(new UnauthorizedException("User not logged in"));
  }

  const hasPermission =
    await checkUserHasPermissionByMethodAndEndpointService(req.user._id, {
      method: req.method,
      endpoint: req.originalUrl,
    });

  return hasPermission
    ? next()
    : next(
        new ForbiddenException(
          "Don't have permission to access this resource"
        )
      );
}
