import { v4 } from 'uuid';
import { requestContext } from '#src/utils/request-context';

export function requestContextMiddleware(req, res, next) {
  const context = {
    user: req.user,
    ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    correlationId: v4(),
    timestamp: Date.now(),
  };

  requestContext.run(context, () => {
    next();
  });
}
