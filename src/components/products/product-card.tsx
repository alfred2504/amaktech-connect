import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: unknown;
    compareAtPrice?: unknown;
    images: {
      url: string;
      altText: string | null;
    }[];
    inventory?: {
      stock: number;
      reserved: number;
    } | null;
  };
};

export function ProductCard({
  product,
}: ProductCardProps) {
  const stock =
    (product.inventory?.stock ?? 0) -
    (product.inventory?.reserved ?? 0);

  const image = product.images[0];

  return (
    <Link
      href={`/store/${product.slug}`}
      className="group block overflow-hidden rounded-xl border bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {image ? (
          <Image
            src={image.url}
            alt={
              image.altText ||
              product.name
            }
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 font-medium text-slate-900">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">
            ${Number(product.price).toFixed(2)}
          </span>

          {stock > 0 ? (
            <span className="text-xs text-emerald-600">
              In stock
            </span>
          ) : (
            <span className="text-xs text-red-600">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}