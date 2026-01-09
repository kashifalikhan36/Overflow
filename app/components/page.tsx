import React from 'react';
import { DefaultDemo as ExpandableDefault, CustomColorDemo as ExpandableCustom } from '@/components/ui/expandable-tabs-demo';
import { MeteorsDemo } from '@/components/ui/meteors-demo';

export default function ComponentsIndex() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Component Demos</h1>

      <section className="mb-12">
        <h2 className="text-xl font-medium mb-4">Expandable Tabs</h2>
        <div className="space-y-4">
          <ExpandableDefault />
          <ExpandableCustom />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-4">Meteors (decorative effect)</h2>
        <MeteorsDemo />
      </section>
    </div>
  );
}
