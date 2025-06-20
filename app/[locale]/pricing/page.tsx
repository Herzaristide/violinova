import Pricing from '@/components/Pricing';
import {
  getSession,
  getSubscription,
  getActiveProductsWithPrices
} from '@/app/supabase-server';

export default async function PricingPage({
  params: { locale }
}: {
  params: any;
}) {
  const [session, products, subscription] = await Promise.all([
    getSession(),
    getActiveProductsWithPrices(),
    getSubscription()
  ]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2	flex flex-col items-center">
      {/* <Pricing
        session={session}
        user={session?.user}
        products={products}
        subscription={subscription}
      /> */}
    </div>
  );
}
