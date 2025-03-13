'use strict';
import express from 'express';
import HttpStatus from 'http-status-codes';

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res, next);
    res.set('Content-Type', 'application/json');
    res.status(result?.statusCode || HttpStatus.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const enhanceRouter = (router) => {
  const newRouter = express.Router();

  router.stack.forEach((layer) => {
    if (layer.name === 'router') {
      // Recursively enhance nested routers
      const nestedRouter = enhanceRouter(layer.handle);
      newRouter.use(layer.regexp.source, nestedRouter);
    } else if (layer.route) {
      const { path: endpoint, methods, stack } = layer.route;

      Object.keys(methods).forEach((method) => {
        newRouter[method](
          endpoint,
          ...stack.map((fn, index) => (index === stack.length - 1 ? asyncHandler(fn.handle) : fn.handle)),
        );
      });
    } else {
      // Attach non-route middleware directly
      newRouter.use(layer.handle);
    }
  });

  return newRouter;
};
