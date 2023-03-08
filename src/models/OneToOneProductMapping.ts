import { db } from "../config/db";

export class OneToOneProductMapping {
  constructor() {
  }

  async save() {
    try {
      
    } catch (error) {
      console.log(error);
    }
  }

  static async find(productId: string) {
    try {
      let sql = `select * from one_to_one_product_mapping where oxluxe_product_id=${productId};`;
      let result = await db.execute(sql);
      // @ts-ignore
      return result[0].length > 0 ? result[0][0] : undefined;
      
    } catch (error) {
      console.log(error);
    }
  }
}
