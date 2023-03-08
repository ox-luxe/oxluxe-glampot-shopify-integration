import express from "express";
import { verifyPubsubMessage } from "../middleware/verifyPubsubMessage";
import { verifyWebhookType } from "../middleware/verifyWebhookType";
import { productControllers } from "../controllers/productControllers";
import { OneToOneProductMapping } from "../models/OneToOneProductMapping";
import { ShopifyStore } from "../services/ShopifyStore"; 
import { extractProductWebhookForFurtherProcessing } from "../middleware/extractProductWebhookForFurtherProcessing";
const router = express.Router();

function productRoute() {
  router.use(
    extractProductWebhookForFurtherProcessing, // ends here if product is not tagged with "Glampot"
    verifyPubsubMessage, // ends here if webhook does not have expected shape
  );

  router
    .route("/")
    .post(
      verifyWebhookType,
      productControllers.createNewProduct,
      productControllers.updateProduct,
      productControllers.deleteProduct,
    );

  router
    .route("/delete")
    .post(async (req, res) => {
      let productWebhook = res.locals.productWebhook;
      console.log(productWebhook.id);
      console.log('DELETING PRODUCT');
      // all we have in the productWebhook is the id

      // if the product is deleted, we will not be able to find the product listing anymore hence no tag info

      // we will then proceed to find if there is an associated glampot product id in the DB

      // if there is, delete the corresponding glampot product

      // if there isn't, do nothing.
      res.status(204).send();
    })

  return router;
}

export { productRoute };
