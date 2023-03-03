import express from "express";
import { productControllers } from "../controllers/productControllers";
const router = express.Router();

function productRoute() {
  router.route("/glampot").post(productControllers.createNewProduct);
  return router;
}

export { productRoute };
