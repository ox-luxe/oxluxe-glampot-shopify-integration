import express from "express";
import { verifyPubsubMessage } from "../middleware/verifyPubsubMessage";
import { verifyWebhookType } from "../middleware/verifyWebhookType";
import { productControllers } from "../controllers/productControllers";
import { extractProductWebhookForFurtherProcessing } from "../middleware/extractProductWebhookForFurtherProcessing";
const router = express.Router();

function productRoute() {
  router.use(
    extractProductWebhookForFurtherProcessing, // ends here if product is not tagged with "Glampot"
    verifyPubsubMessage, // ends here if webhook does not have expected shape
    verifyWebhookType // assigns webhook to be either processed by createNewProduct / updateProduct controller
  );

  router
    .route("/glampot")
    .post(
      productControllers.createNewProduct,
      productControllers.updateProduct,
      (req, res) => {
        if (res.locals.productWebhookType === "delete") {
          console.log("product deleted.");
          
          res.status(204).send();
        }
      }
    );

  return router;
}

export { productRoute };
