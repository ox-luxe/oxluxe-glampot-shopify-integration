import express from "express";
import { verifyPubsubMessage } from "../middleware/verifyPubsubMessage";
import { productControllers } from "../controllers/productControllers";
import { verifyIfWebhookIsToBeProcessed } from "../middleware/verifyIfWebhookIsToBeProcessed";
const router = express.Router();

function productRoute() {

  router.use(verifyIfWebhookIsToBeProcessed);

  router
    .route("/glampot")
    .post(verifyPubsubMessage, productControllers.createNewProduct);

  router
  .route("/glampot/update")
  .post(verifyPubsubMessage, productControllers.updateProduct)
  return router;
}

export { productRoute };
