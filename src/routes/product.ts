import express from "express";
import { verifyPubsubMessage } from "../middleware/verifyPubsubMessage";
import { productControllers } from "../controllers/productControllers";
const router = express.Router();

function productRoute() {
  router
    .route("/glampot")
    .post(verifyPubsubMessage, productControllers.createNewProduct);
  return router;
}

export { productRoute };
