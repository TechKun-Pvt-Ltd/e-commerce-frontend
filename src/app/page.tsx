import ProductDetail from "./components/product-detail";

export default function Home() {
  console.log(process.env.SERVER_URL)
  return (
   <ProductDetail/>
  );
}