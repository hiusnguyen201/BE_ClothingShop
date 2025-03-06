import HttpStatus from "http-status-codes";

export const createOrderDetailController = async (req, res) => {
  return {
    statusCode: HttpStatus.OK,
    message: "Create Order Detail successfully",
    data: { newOrderDetail },
  };
};
