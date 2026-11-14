import { SellerProductForm } from '@/components/seller/product-form';

export default function EditSellerProductPage({ params }: { params: { id: string } }) {
  return <SellerProductForm productId={params.id} />;
}
