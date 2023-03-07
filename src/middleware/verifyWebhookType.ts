import { NextFunction, Request, Response } from "express";
import { ShopifyStore } from "../services/ShopifyStore";

export async function verifyWebhookType(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const glampotShopifyStore = new ShopifyStore(
      process.env.GLAMPOT_STORE_NAME!,
      process.env.GLAMPOT_STORE_ACCESS_TOKEN!
    );
    // res.locals.productWebhook came from previous middleware: extractProductWebhookForFurtherProcessing
    let productWebhook = res.locals.productWebhook;
    const sku = ShopifyStore.getSkuNumberFromProductWebhook(productWebhook);
    const correspondingGlampotProductId = await glampotShopifyStore.findProductIdBySku(sku);
    const hasGlampotTag = ShopifyStore.doesProductWebhookContainTag(productWebhook, "Glampot");
    
    console.log(productWebhook.title);
    console.log(correspondingGlampotProductId);
    console.log(hasGlampotTag);

    if (correspondingGlampotProductId && hasGlampotTag) {
      // these variables are used in the updateProduct controller
      res.locals.productWebhookType = "update";
      res.locals.correspondingGlampotProductId = correspondingGlampotProductId;
    }
    if (!correspondingGlampotProductId && hasGlampotTag) {
      res.locals.productWebhookType = "create";
    }
    if (correspondingGlampotProductId && !hasGlampotTag) {
      // these variables are used in the deleteProduct controller
      res.locals.productWebhookType = "delete";
      res.locals.correspondingGlampotProductId = correspondingGlampotProductId;
    }
    if (!correspondingGlampotProductId && !hasGlampotTag) {
      res.status(204).send();
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
}
