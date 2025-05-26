"use client"
import React, { useState } from 'react';
import VariationItem from '../components/VariationItem';
import { Plus } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import VariationItemsSkeleton from './components/VariationItemsSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddVariationForm from './components/AddVariationForm';
import { Variation } from '@/types/domains/variation';

export default function VariationSettingsPage() {
    const { items, loading, error } = useAppSelector(state => state.variations);
    const addVariationRef = React.useRef<{ open(): void, close(): void }>(null);
    const editVariationRef = React.useRef<{ open(): void, close(): void }>(null);
    const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);

    return <>
        <div className="h-full space-y-8 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">Variations</h1>
            <div className="max-w-md">
                {loading ?
                    <VariationItemsSkeleton /> :
                    (!error && items.length) && items.map(item => <VariationItem key={item.variationId}
                        variation={item}
                        onEdit={() => {setSelectedVariation(item); editVariationRef.current?.open();}}
                        onDelete={() => { }}
                    />)
                }
                <div className="rounded-md cursor-pointer h-9 hover:bg-accent px-3.5 flex items-center gap-2 text-gray-600"
                    onClick={() => addVariationRef.current?.open()}
                >
                    <Plus className="w-4 h-4" />
                    <div className="font-medium text-base">Add Variation</div>
                </div>
            </div>
        </div>

        <Dialog ref={addVariationRef}>
            <DialogContent className='gap-6' aria-describedby=''>
                <DialogHeader>
                    <DialogTitle>Add Variation</DialogTitle>
                </DialogHeader>
                <AddVariationForm
                    loading={false}
                    onSubmit={data => { }}
                />
            </DialogContent>
        </Dialog>

        <Dialog ref={editVariationRef}>
            <DialogContent className='gap-6' aria-describedby=''>
                <DialogHeader>
                    <DialogTitle>Edit Variation</DialogTitle>
                </DialogHeader>
                <AddVariationForm
                    variation={selectedVariation!}
                    loading={false}
                    onSubmit={(data: Variation) => { }}
                />
            </DialogContent>
        </Dialog>
    </>;
};
