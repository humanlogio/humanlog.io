'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import PricingPlan from '@/components/pricing-plan';

const tiers = [
  {
    name: 'Local Dev Ex',
    id: '0',
    href: '/subscribe?plan=starter',
    price: { '1': '$19', '2': '$14' },
    discountPrice: { '1': '', '2': '$199' },
    description: `Save and explore your local development logs.`,
    features: [
      `Single user`,
      `Local development`,
      `10 GiB of history included`,
      `100 MiB/s ingestion included`,
    ],
    featured: false,
    highlighted: false,
    soldOut: false,
    cta: `Get started`,
  },
  {
    name: 'Hosted',
    id: '1',
    href: '/subscribe?plan=pro',
    price: { '1': '$49', '2': '$38' },
    discountPrice: { '1': '', '2': '$499' },
    description: `When you grow, need more power and flexibility.`,
    features: [
      `All in the starter plan plus`,
      `Teams`,
      `2 environments`,
      `100 GiB of history included`,
      `1 GiB/s ingestion included`,
      `Support`,
    ],
    featured: true,
    highlighted: false,
    soldOut: false,
    cta: `Get started`,
  },
  {
    name: 'Commercial Custom',
    id: '2',
    href: '/contact-us',
    price: '',
    discountPrice: { '1': '', '2': '' },
    description: `Custom plans for your needs.`,
    features: [
      `All in the pro plan plus`,
      `Single Sign-on`,
      `Custom history`,
      `Custom environments`,
      `Priority support`,
    ],
    featured: false,
    highlighted: false,
    soldOut: false,
    cta: `Contact us`,
  },
];

export default function Page() {
  const [isAnnually, setIsAnnually] = useState(true);

  return (
    <div className="inset-0 flex w-full flex-col items-center justify-center bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-screen-xl flex-col items-center justify-center px-4 py-8">
        <h1 className="text-center text-4xl font-bold">Pricing</h1>
        <div className="flex flex-none flex-row items-center gap-2 pt-8">
          <Label
            htmlFor="annualy"
            className={cn('transition-colors duration-200', {
              'text-slate-500': isAnnually,
            })}
          >
            Billed Monthly
          </Label>
          <Switch
            id="annualy"
            checked={isAnnually}
            onCheckedChange={(checked) => setIsAnnually(checked)}
          />
          <Label
            htmlFor="annualy"
            className={cn('transition-colors duration-200', {
              'text-slate-500': !isAnnually,
            })}
          >
            Billed Annually
          </Label>
        </div>
        <div className="grid w-full grid-cols-1 gap-8 pt-16 lg:grid-cols-3">
          {tiers.map((tier) => (
            <PricingPlan
              key={tier.id}
              name={tier.name}
              featured={tier.featured}
              price={isAnnually ? tier.price['2'] : tier.price['1']}
              description={tier.description}
              features={tier.features}
              cta={tier.cta}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
