import express from "express";
import HttpStatus from "http-status-codes";

const wrapAsync = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

const enhanceResponse = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    return res.status(result?.statusCode || HttpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const enhanceRouter = (router) => {
  const enhancedRouter = express.Router();

  router.stack.forEach((layer) => {
    if (layer.name === "router") {
      // Recursively enhance nested routers
      const nestedRouter = enhanceRouter(layer.handle);
      enhancedRouter.use(layer.regexp.source, nestedRouter);
    } else if (layer.route) {
      const { path: endpoint, methods, stack } = layer.route;

      Object.keys(methods).forEach((method) => {
        enhancedRouter[method](
          endpoint,
          ...stack.map((middleware, index) =>
            index === stack.length - 1
              ? enhanceResponse(middleware.handle)
              : wrapAsync(middleware.handle)
          )
        );
      });
    } else {
      // Attach non-route middleware directly
      enhancedRouter.use(layer.handle);
    }
  });

  return enhancedRouter;
};
