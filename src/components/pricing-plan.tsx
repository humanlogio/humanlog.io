import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PricingPlan({
  features,
  featured = false,
  name,
  description,
  price,
  cta,
}: {
  features: string[];
  featured?: boolean;
  name: string;
  description: string;
  price: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-base border-2 border-border bg-white p-6 dark:border-darkBorder dark:bg-darkBg">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">{name}</h3>
          {featured && (
            <span className="rounded-base border-2 border-border bg-success px-2 py-0.5 text-sm text-text dark:border-darkBorder">
              Most popular
            </span>
          )}
        </div>
        <p className="mb-3 mt-2 text-slate-500">{description}</p>
        <div>
          <span className="text-3xl font-bold">{price}</span>
          <span>/month</span>
        </div>
        <ul className="mt-8 flex flex-col gap-2">
          {features.map((item) => {
            return (
              <li key={item} className="flex items-center gap-3">
                <Check className="shrink-0" size={18} /> {item}
              </li>
            );
          })}
        </ul>
      </div>
      <Button
        size={featured ? 'lg' : 'default'}
        className={cn('mt-12 w-full', featured && 'bg-success')}
      >
        {cta}
      </Button>
    </div>
  );
}
