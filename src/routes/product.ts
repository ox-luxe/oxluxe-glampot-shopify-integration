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
  return router;
}

export { productRoute };
