import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { AddToCart } from '@/components/add-to-cart';
import { ReviewForm } from '@/components/ReviewForm';
import Link from 'next/link';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      reviews: {
        where: { status: 'APPROVED' },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!product) notFound();

  const image = product.images[0];
  return (
    <div className="container section product-detail">
      <div className="breadcrumbs">
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / {product.category.name}
      </div>
      <div className="detail-grid">
        <div className="detail-image">
          {image ? <img src={image.url} alt={image.alt || product.name} /> : <div className="image-placeholder">AmakTech Connect</div>}
        </div>
        <div className="detail-info">
          <small className="eyebrow">{product.category.name}</small>
          <h1>{product.name}</h1>
          <div className="price-row detail-price">
            <strong>USD {product.price.toString()}</strong>
            {product.comparePrice && <del>USD {product.comparePrice.toString()}</del>}
          </div>
          <p className="detail-description">{product.description}</p>
          <p className={product.stock > 0 ? 'stock' : 'out-stock'}>
            {product.stock > 0 ? `${product.stock} available in stock` : 'Out of stock'}
          </p>
          {product.stock > 0 && (
            <AddToCart
              product={{
                id: product.id,
                name: product.name,
                price: Number(product.price),
                currency: 'USD',
                imageUrl: image?.url,
                slug: product.slug,
              }}
            />
          )}
          <div className="detail-assurance">Secure checkout · Product availability confirmed at checkout</div>
        </div>
      </div>
      <section className="description-block">
        <h2>Product details</h2>
        <p>{product.description}</p>
        {product.metadata && <pre>{JSON.stringify(product.metadata, null, 2)}</pre>}
      </section>
      <section className="description-block">
        <h2>Customer reviews</h2>
        {product.reviews.length
          ? product.reviews.map(review => (
            <article key={review.id}>
              <strong>{review.rating}/5{review.title ? ` · ${review.title}` : ''}</strong>
              <p>{review.comment}</p>
              <small>{review.user.name || 'Customer'} · {review.createdAt.toLocaleDateString()}</small>
            </article>
          ))
          : <p>No approved reviews yet.</p>}
        <ReviewForm productId={product.id} />
      </section>
    </div>
  );
}
