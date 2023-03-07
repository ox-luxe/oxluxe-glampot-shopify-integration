import { NextFunction, Request, Response } from "express";
import { ShopifyStore } from "../services/ShopifyStore";

export async function verifyIfWebhookIsToBeProcessed(req: Request, res: Response, next: NextFunction) {
  try {
    const pubSubMessage = req.body.message;
    let productWebhook;

    console.log(productWebhook);
    

    if (process.env.NODE_ENV === "development") {
      productWebhook = pubSubMessage.data;
    }

    if (process.env.NODE_ENV === "production") {
      productWebhook = JSON.parse(
        Buffer.from(pubSubMessage.data, "base64").toString()
      );
    }

    const shouldSyncProductToGlampot = ShopifyStore.doesProductCreateWebhookContainTag(productWebhook, "Glampot");
    if (shouldSyncProductToGlampot) {
      res.locals.productWebhook = productWebhook;

      console.log("Processing product/create webhook..");
      return next();
    }
    res.status(204).send();

  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
}

