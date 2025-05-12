import { Hero } from '@/components/sections/hero';
import { Categories } from '@/components/sections/categories';
import { Testimonials } from '@/components/sections/testimonials';
import { Newsletter } from '@/components/sections/newsletter';
import { PromoSection } from '@/components/sections/promo-section';
import { AuthBenefits } from '@/components/sections/auth-benefits';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-8">
      <Hero />
      <AuthBenefits />
      <Categories />
      <Testimonials />
      <PromoSection />
      <Newsletter />
    </div>
  );
}