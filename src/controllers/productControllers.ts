import { Request, Response } from "express";
import { ShopifyStore } from "../services/ShopifyStore";

async function createNewProduct(req: Request, res: Response) {
  try {
    const pubSubMessage = req.body.message;
    let productData;

    if (process.env.NODE_ENV === "development") {
      productData = pubSubMessage.data;
    }

    if (process.env.NODE_ENV === "production") {
      productData = JSON.parse(
        Buffer.from(pubSubMessage.data, "base64").toString()
      );
    }

    const shouldSyncProductToGlampot =
      ShopifyStore.doesProductCreateWebhookContainTag(productData, "Glampot");

    if (shouldSyncProductToGlampot) {
      console.log("Processing data..");

      const glampotShopifyStore = new ShopifyStore(
        process.env.GLAMPOT_STORE_NAME!,
        process.env.GLAMPOT_STORE_ACCESS_TOKEN!
      );

      // seperately fetching cost information from origin store as it is not included inside webhook
      const oxluxeShopifyStore = new ShopifyStore(
        process.env.OXLUXE_STORE_NAME!,
        process.env.OXLUXE_STORE_ACCESS_TOKEN!
      );
      const variantId = ShopifyStore.getVariantIdFromProductCreateWebhook(productData);      
      const productCost = await oxluxeShopifyStore.findCostOfProductByVariantId(variantId);
      await glampotShopifyStore.createProduct({ ...productData, productCost });
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
