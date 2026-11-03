import products from "./products.json";
import { assetUrl } from "../utils/assets";
export default products.map((product) => ({
  ...product,
  images: product.images.map(assetUrl),
}));
