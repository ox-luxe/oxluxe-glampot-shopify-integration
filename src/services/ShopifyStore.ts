import { ProductCreateWebhook } from "../interface/productCreateWebhook.interface";
import Shopify from "@shopify/shopify-api";

interface ProductData extends ProductCreateWebhook {
  productCost: string;
  correspondingGlampotProductId?: string;
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
      .includes(tag.toLowerCase());
  }

  static getVariantIdFromProductCreateWebhook(
    webhookData: ProductCreateWebhook
  ) {
    return webhookData.variants[0].id;
  }

  static getSkuNumberFromProductWebhook(
    webhookData: ProductCreateWebhook
  ) {
    return webhookData.variants[0].sku;
  }

  convertProductWebhookIntoProductInput(productData: ProductData) {
    const { title, body_html, vendor, product_type, status, tags, images, variants, productCost, id } = productData;

    let productInput = {
      id: `gid://shopify/Product/${id}`, // this id exists for productUpdates
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
            availableQuantity: variant.inventory_quantity,
            locationId: `gid://shopify/Location/${process.env.GLAMPOT_STORE_LOCATION_ID}`,          
          }
        }
      }),
    };
    return productInput;
  }

  async findCostOfProductByVariantId(productVariantId: string) {
    const client = new Shopify.Clients.Graphql(this.storeUrl, this.accessToken);
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
    const productAttributes = this.convertProductWebhookIntoProductInput(productData);

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
  async updateProduct(productData: ProductData) {
    const client = new Shopify.Clients.Graphql(this.storeUrl, this.accessToken);
    const productAttributes = this.convertProductWebhookIntoProductInput(productData);

    // we want to update corresponding glampot product and not the origin product, hence updating the product id attribute. 
    productAttributes.id = productData.correspondingGlampotProductId!;
    
    try {
      const res = await client.query({
        data: {
          query: `mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
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
  async findProductIdBySku(skuNumber: string) {
    const client = new Shopify.Clients.Graphql(this.storeUrl, this.accessToken);
    const QUERY_STRING = `{
      productVariants(first: 1, query: "${skuNumber}") {
        edges {
          node {
            id
            product {
              id
            }
            inventoryItem {
              id
            }
          }
        }
      }
    }`
 
    try {
      const res = await client.query({
        data: {
          query: QUERY_STRING,
        },
      });
      // @ts-ignore
      const productId: string = res.body.data.productVariants.edges[0]?.node.product.id;
      
      return productId;
    } catch (error) {
      console.log(error);
    }
  }
}
