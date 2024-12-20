import express from "express";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

export const wrapAllRoutersWithAsyncHandler = (router) => {
  const originalRouter = express.Router();

  router.stack.forEach((layer) => {
    if (layer.name === "router") {
      // layer.handle is an instance of express.Router
      // recursively wrap sub router
      const nestedRouter = wrapAllRoutersWithAsyncHandler(layer.handle);

      // layer.regexp is the path of the router
      originalRouter.use(layer.regexp.source, nestedRouter);
    } else if (layer.route) {
      const { path: endpoint, methods } = layer.route;

      Object.keys(methods).forEach((method) => {
        const childLayer = layer.route.stack[0];
        originalRouter[method](endpoint, asyncHandler(childLayer.handle));
      });
    }
  });

  return originalRouter;
};
