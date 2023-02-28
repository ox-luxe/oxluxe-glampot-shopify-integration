import express from "express";

import { productControllers } from "../controllers/productControllers";
const router = express.Router();

function productRoute() {
  // need to verify authenticity of webhook's origin (i.e. if webhook data came from glampot)
  router.route("/glampot").post(productControllers.createNewProduct);
  return router;
}

export { productRoute };
