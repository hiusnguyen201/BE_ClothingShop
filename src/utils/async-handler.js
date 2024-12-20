import express from "express";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

export const wrapAllRoutersWithAsyncHandler = (router) => {
  const originalRouter = express.Router();

  console.log(2);

  router.stack.forEach((layer) => {
    if (layer.name === "router") {
      // layer.handle is an instance of express.Router
      // recursively wrap sub router
      const nestedRouter = wrapAllRoutersWithAsyncHandler(layer.handle);

      // layer.regexp is the path of the router
      originalRouter.use(layer.regexp.source, nestedRouter); // setup prefix for sub router
    } else if (layer.route) {
      const { path: endpoint, methods, stack } = layer.route;

      // stack - array of handler functions
      stack.forEach((handlerFnc, i) => {
        stack[i].handle = asyncHandler(handlerFnc.handle);
      });

      Object.keys(methods).forEach((method) => {
        originalRouter[method](
          endpoint,
          ...stack.map((childLayer) => childLayer.handle)
        );
      });
    }
  });

  return originalRouter;
};
