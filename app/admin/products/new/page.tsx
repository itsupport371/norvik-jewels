import ProductForm, { emptyProductForm } from '../product-form';

export default function NewProductPage() {
  return <ProductForm initial={emptyProductForm} />;
}
