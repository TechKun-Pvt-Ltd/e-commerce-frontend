import Link from "next/link";

const ProductListing = () => {
  const products = [
    { id: "1", name: "Product A" },
    { id: "2", name: "Product B" },
    { id: "3", name: "Product C" },
  ];

  return (
    <div>
      <h1>Product Listing</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link href={`/products/${product.id}`}>
              {product.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductListing;
