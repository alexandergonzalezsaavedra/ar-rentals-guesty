'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PropertyFilters, { type PropertyFiltersValues } from './PropertyFilters';

interface HomeSearchFormProps {
  cities: string[];
}

const HomeSearchForm = ({ cities }: HomeSearchFormProps) => {
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);

  const handleSubmit = (values: PropertyFiltersValues) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        params.set(key, value);
      }
    }

    const query = params.toString();
    router.push(`/propiedades${query ? `?${query}` : ''}`);
  };

  const handleClear = () => setResetKey((key) => key + 1);

  return (
    <PropertyFilters
      key={resetKey}
      cities={cities}
      onSubmit={handleSubmit}
      onClear={handleClear}
      variant='glass'
    />
  );
};

export default HomeSearchForm;
