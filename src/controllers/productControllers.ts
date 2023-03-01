import { Request, Response } from "express";

async function createNewProduct(req: Request, res: Response) {
  try {
    res.send({ message: "product created!!" });
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
}

const productControllers = {
  createNewProduct,
};

export { productControllers };
