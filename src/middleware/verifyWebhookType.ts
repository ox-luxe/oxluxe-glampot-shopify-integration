import { NextFunction, Request, Response } from "express";
import { ShopifyStore } from "../services/ShopifyStore";

export async function verifyWebhookType(req: Request, res: Response, next: NextFunction) {
  try {
    const glampotShopifyStore = new ShopifyStore(
      process.env.GLAMPOT_STORE_NAME!,
      process.env.GLAMPOT_STORE_ACCESS_TOKEN!
    );
    // res.locals.productWebhook came from previous middleware: verifyIfWebhookIsToBeProcessed
    let productWebhook = res.locals.productWebhook;
    const sku = ShopifyStore.getSkuNumberFromProductWebhook(productWebhook);
    const correspondingGlampotProductId = await glampotShopifyStore.findProductIdBySku(sku);

    if (correspondingGlampotProductId) {
      // these variables are used in the updateProduct controller
      res.locals.productWebhookType = "update";
      res.locals.correspondingGlampotProductId = correspondingGlampotProductId;
    } else {
      res.locals.productWebhookType = "create";
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
}
