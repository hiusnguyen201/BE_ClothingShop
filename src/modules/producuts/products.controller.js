export const createProductController = async (req, res) => {
  const newProduct = await ProductModel.create(req.body);
};
