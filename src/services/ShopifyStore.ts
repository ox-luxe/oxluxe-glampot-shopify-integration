import { ProductCreateWebhook } from "../interface/productCreateWebhook.interface";
import Shopify from "@shopify/shopify-api";

interface ProductData extends ProductCreateWebhook {
  productCost: string;
}

export class ShopifyStore {
  storeUrl: string;
  accessToken: string;

  constructor(storeUrl: string, accessToken: string) {
    this.storeUrl = storeUrl;
    this.accessToken = accessToken;
  }

  static doesProductCreateWebhookContainTag(
    webhookData: ProductCreateWebhook,
    tag: string
  ) {
    return webhookData.tags
      .split(",")
      .map((x) => x.toLowerCase().trim())
      .includes(tag);
  }

  static getVariantIdFromProductCreateWebhook(
    webhookData: ProductCreateWebhook
  ) {
    return webhookData.variants[0].id;
  }

  convertProductCreateWebhookIntoProductInput(productData: ProductData) {
    const { title, body_html, vendor, product_type, status, tags, images, variants, productCost } = productData;
    
    return {
      title: title,
      descriptionHtml: body_html,
      productType: product_type,
      vendor: vendor,
      status: status.toUpperCase(),
      tags: [tags],
      images: images.map(function(img) {
        return { src: img.src }
       }),
      variants: variants.map(function(variant) {
        return {
          price: variant.price,
          sku: variant.sku,
          inventoryManagement: variant.inventory_management.toUpperCase(),
          inventoryItem: { cost: productCost, tracked: true },
          inventoryQuantities: {
            availableQuantity: 1,
            locationId: `gid://shopify/Location/${process.env.GLAMPOT_STORE_LOCATION_ID}`,          
          }
        }
      }),
    };
  }

  async findCostOfProductByVariantId(productVariantId: string) {
    const client = new Shopify.Clients.Graphql(this.storeUrl, this.accessToken);
    console.log(productVariantId);

    const QUERY_STRING = `{
      productVariant(id: "gid://shopify/ProductVariant/${productVariantId}") {
              title
              createdAt
              inventoryItem {
              unitCost {
                  amount
              }
          }
      }
  }`
  console.log(QUERY_STRING);
  
    try {
      const res = await client.query({
        data: {
          query: QUERY_STRING,
        },
      });
      // @ts-ignore
      const cost: string = res.body.data.productVariant.inventoryItem.unitCost.amount;
      return cost;
    } catch (error) {
      console.log(error);
    }
  }
  async createProduct(productData: ProductData) {
    const client = new Shopify.Clients.Graphql(this.storeUrl, this.accessToken);
    const productAttributes =
      this.convertProductCreateWebhookIntoProductInput(productData);

    try {
      const res = await client.query({
        data: {
          query: `mutation productCreate($input: ProductInput!) {
            productCreate(input: $input) {
              product {
                title
                id
              }
            }
          }`,
          variables: {
            input: productAttributes,
          },
        },
      });
      // console.log(res.body);
      
    } catch (error) {
      console.log(error);
    }
  }
}
