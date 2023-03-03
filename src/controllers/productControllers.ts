import { Request, Response } from "express";

async function createNewProduct(req: Request, res: Response) {
  try {
    
    const pubSubMessage = req.body.message;
    let productData;

    if (process.env.NODE_ENV === "development") {
      productData = pubSubMessage.data;
    }

    if (process.env.NODE_ENV === "production") {
      productData = JSON.parse(Buffer.from(pubSubMessage.data, "base64").toString());
    }
    console.log(productData);
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
}

const productControllers = {
  createNewProduct,
};

export { productControllers };
