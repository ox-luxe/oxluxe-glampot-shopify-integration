import { Request, Response } from "express";
import { ShopifyStore } from "../services/ShopifyStore";

async function createNewProduct(req: Request, res: Response) {
  try {
    const pubSubMessage = req.body.message;
    let productWebhook;

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
      console.log("Processing product/create webhook..");

      const glampotShopifyStore = new ShopifyStore(
        process.env.GLAMPOT_STORE_NAME!,
        process.env.GLAMPOT_STORE_ACCESS_TOKEN!
      );

      // seperately fetching cost information from origin store as it is not included inside webhook
      const oxluxeShopifyStore = new ShopifyStore(
        process.env.OXLUXE_STORE_NAME!,
        process.env.OXLUXE_STORE_ACCESS_TOKEN!
      );
        
      const variantId = ShopifyStore.getVariantIdFromProductCreateWebhook(productWebhook);    
      const productCost = await oxluxeShopifyStore.findCostOfProductByVariantId(variantId);
      await glampotShopifyStore.createProduct({ ...productWebhook, productCost });
    }

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
