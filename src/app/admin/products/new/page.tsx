import { ProductForm } from "@/features/products/components/product-form";
import { getProductOptions } from "@/features/products/actions/get-product-options";

export default async function NewProductPage() {
  const {
    categories,
    brands,
  } = await getProductOptions();

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          Add Product
        </h1>

        <p className="mt-2 text-muted-foreground">
          Add a new product to AmakTech Connect.
        </p>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
      />
    </div>
  );
}