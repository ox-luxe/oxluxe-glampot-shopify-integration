import { NextFunction, Request, Response } from "express";
import getRawBody = require("raw-body");
import crypto from "crypto";

// TODO:
// if endpoint is glampot, webhook origin should be from oxluxe only
// hence we should create a conditional logic to switch secret keys
// e.g. endpoint: glampot: secretkey -> oxluxe's 
// e.g. endpoint: oxluxe: secretkey -> glampot's

const secretKey: string = process.env.OXLUXE_SECRET_KEY!;

export async function validateWebhookSource(req: Request, res: Response, next: NextFunction) {
    const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
    console.log(hmacHeader);
    
  
    //Parse the request Body
    const body = await getRawBody(req);
  
    //Create a hash based on the parsed body
    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(body)
      .digest("base64");
  
    // Compare the created hash with the value of the X-Shopify-Hmac-Sha256 Header
    if (hash === hmacHeader) {
      console.log("Webhook source confirmed. Continue processing");
      const product = JSON.parse(body.toString())
      console.log(product);
      return next();
    } else {
      console.log("Unidentified webhook source. Do not process");
      return res.sendStatus(403);
    }
}