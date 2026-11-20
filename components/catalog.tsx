'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  comparePrice: number | string | null;
  stock: number;
  isFeatured: boolean;
  images: Array<{ url: string; alt: string | null; sortOrder: number }>;
  category: Category;
};

const money = (value: number | string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(value));

export function Catalog({
  initialProducts,
  initialCategories,
  initialQuery = '',
  initialCategory = '',
}: {
  initialProducts: CatalogProduct[];
  initialCategories: Category[];
  initialQuery?: string;
  initialCategory?: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [categories] = useState(initialCategories);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('featured');
  const [error, setError] = useState('');

  useEffect(() => {
    const url = new URL('/api/products', window.location.origin);
    if (query) url.searchParams.set('q', query);
    if (category) url.searchParams.set('category', category);
    fetch(url)
      .then(async response => {
        if (!response.ok) throw new Error('Catalog request failed');
        setProducts(await response.json());
        setError('');
      })
      .catch(() => setError('Catalog is unavailable. Check the database setup.'));
  }, [query, category]);

  const sorted = [...products].sort((a, b) =>
    sort === 'price-low' ? Number(a.price) - Number(b.price)
      : sort === 'price-high' ? Number(b.price) - Number(a.price)
        : sort === 'name' ? a.name.localeCompare(b.name)
          : Number(b.isFeatured) - Number(a.isFeatured));

  return (
    <section className="catalog">
      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Search size={17} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products..." />
        </div>
        <div className="toolbar-right">
          <SlidersHorizontal size={18} />
          <select value={category} onChange={event => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map(item => <option value={item.slug} key={item.id}>{item.name}</option>)}
          </select>
          <select value={sort} onChange={event => setSort(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>
      {error && <p className="notice">{error}</p>}
      <div className="product-grid">
        {sorted.map(product => {
          const image = product.images[0];
          return (
            <Link className="product-card" href={`/products/${product.slug}`} key={product.id}>
              <div className="product-image">
                {image ? <img src={image.url} alt={image.alt || product.name} /> : <div className="image-placeholder">AmakTech<br />Connect</div>}
                {product.isFeatured && <span className="featured-badge">Featured</span>}
              </div>
              <div className="product-meta">
                <small>{product.category.name || 'Marketplace'}</small>
                <h3>{product.name}</h3>
                <div className="price-row">
                  <strong>{money(product.price)}</strong>
                  {product.comparePrice && Number(product.comparePrice) > Number(product.price) && <del>{money(product.comparePrice)}</del>}
                </div>
                <span className={product.stock > 0 ? 'stock' : 'out-stock'}>
                  {product.stock > 0 ? 'In stock' : 'Out of stock'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      {!error && !sorted.length && (
        <div className="empty">
          <h3>No products found</h3>
          <p>Try another search or browse all categories.</p>
          <button className="button outline" onClick={() => { setQuery(''); setCategory(''); }}>Clear filters</button>
        </div>
      )}
    </section>
  );
}
