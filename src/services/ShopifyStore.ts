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
      .includes("glampot");
  }

  static getVariantIdFromProductCreateWebhook(
    webhookData: ProductCreateWebhook
  ) {
    return webhookData.variants[0].id;
  }

  convertProductCreateWebhookIntoProductInput(productData: ProductData) {
    return {
      title: "Example T-Shirt!!",
      descriptionHtml: "<h1>An example T-Shirt<h1>",
      productType: "Shirts",
      vendor: "Acme",
      status: "DRAFT",
      tags: ["Ox Luxe's Product"],
      images: [
        {
          src: "https://cdn.shopify.com/shopifycloud/shopify/assets/shopify_shirt-39bb555874ecaeed0a1170417d58bbcf792f7ceb56acfe758384f788710ba635.png",
        },
      ],
      variants: [
        {
          price: "19.99",
          sku: "example-shirt-s",
          inventoryManagement: "SHOPIFY",
          inventoryItem: { cost: productData.productCost, tracked: true },
          inventoryQuantities: {
            availableQuantity: 1,
            locationId: `gid://shopify/Location/${process.env.GLAMPOT_STORE_LOCATION_ID}`,
          },
        },
      ],
    };
  }

  async findCostOfProductByVariantId(productVariantId: string) {
    const client = new Shopify.Clients.Graphql(this.storeUrl, this.accessToken);

    try {
      const res = await client.query({
        data: {
          query: `{
                productVariant(id: "gid://shopify/ProductVariant/${productVariantId}") {
                        title
                        createdAt
                        inventoryItem {
                        unitCost {
                            amount
                        }
                    }
                }
            }`,
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
    } catch (error) {
      console.log(error);
    }
  }
}
