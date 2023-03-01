import express from "express";
import { validateWebhookSource } from "../middleware/validateWebhook";
import { productControllers } from "../controllers/productControllers";
const router = express.Router();

function productRoute() {
  router.route("/glampot").post(validateWebhookSource, productControllers.createNewProduct);
  return router;
}

export { productRoute };
