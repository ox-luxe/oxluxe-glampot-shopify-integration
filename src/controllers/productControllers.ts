import { Request, Response } from "express";

async function createNewProduct(req: Request, res: Response) {
  try {
    if (!req.body) {
      const msg = "no Pub/Sub message received";
      console.error(`error: ${msg}`);
      res.status(400).send(`Bad Request: ${msg}`);
      return;
    }
    if (!req.body.message) {
      const msg = "invalid Pub/Sub message format";
      console.error(`error: ${msg}`);
      res.status(400).send(`Bad Request: ${msg}`);
      return;
    }

    const pubSubMessage = req.body.message;
    
    const name = pubSubMessage.data
      ? Buffer.from(pubSubMessage.data, "base64").toString().trim()
      : "World";

    console.log(Buffer.from(pubSubMessage.data, "base64"));
    console.log(`Hello ${name}!`);
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
