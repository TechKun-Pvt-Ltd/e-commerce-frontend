"use client"

import React, { useCallback, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ShippingForm from './components/ShippingForm';
import { ShippingMethod, ShippingMethodDTO } from '@/types/domains/shipping_method';
import * as shippingServices from '@/services/shippingMethod';
import useDataFetch from '@/hooks/use-data-fetch';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import ShippingItem from './components/ShippingItem';

export default function ShippingMethodsPage() {
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

    const addShippingMethodRef = React.useRef<{ open(): void, close(): void }>(null);
    const editShippingMethodRef = React.useRef<{ open(): void, close(): void }>(null);
    const deleteDialogRef = React.useRef<{ open(): void, close(): void }>(null);
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
    const [deletionTarget, setDeletionTarget] = useState<ShippingMethod | null>(null);
    
    const shippingMethodsData = useDataFetch(shippingServices.getAllShippingMethods);
    const addShippingMethod = useDataFetch(shippingServices.createShippingMethod);
    const editShippingMethod = useDataFetch(shippingServices.updateShippingMethod);
    const deleteShippingMethod = useDataFetch(shippingServices.deleteShippingMethod);

    useEffect(() => {
        shippingMethodsData.request().onSuccess((data) => {
            setShippingMethods(data);
        });
    }, []);

    const onEdit = useCallback((shippingMethod: ShippingMethod) => {
        setSelectedShippingMethod(shippingMethod);
        editShippingMethodRef.current?.open();
    }, []);

    const onDelete = useCallback((shippingMethod: ShippingMethod) => {
        setDeletionTarget(shippingMethod);
        deleteDialogRef.current?.open();
    }, []);

    const loading = shippingMethodsData.isLoading;
    const error = shippingMethodsData.hasError ? "Failed to load shipping methods" : null;

    return <>
        <div className="h-full space-y-8 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">Shipping Methods</h1>
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                    {error}
                </div>
            )}
            <div className="max-w-4xl py-2 space-y-2">
                {loading ?
                    <div className="space-y-2">
                        <div className="border rounded-md h-9 bg-gray-100 animate-pulse"></div>
                        <div className="border rounded-md h-9 bg-gray-100 animate-pulse"></div>
                        <div className="border rounded-md h-9 bg-gray-100 animate-pulse"></div>
                    </div> :
                    (!error && shippingMethods.length) ? shippingMethods.map(item => <ShippingItem key={item.id}
                        shippingMethod={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />):
                    <div className="border rounded-md h-9 bg-background px-3.5 flex items-center text-gray-400">
                        No shipping methods created! Click the button below to create one now.
                    </div>
                }
                <div className="rounded-md cursor-pointer h-9 hover:bg-accent px-3.5 flex items-center gap-2 text-gray-600"
                    onClick={() => addShippingMethodRef.current?.open()}
                >
                    <Plus className="w-4 h-4" />
                    <div className="font-medium text-base">Add Shipping Method</div>
                </div>
            </div>
        </div>

        <Dialog ref={addShippingMethodRef}>
            <DialogContent className='gap-6 sm:max-w-5xl' aria-describedby=''>
                <DialogHeader>
                    <DialogTitle>Add Shipping Method</DialogTitle>
                </DialogHeader>
                <ShippingForm
                    loading={addShippingMethod.isLoading}
                    onSubmit={data => addShippingMethod.request(data)
                        .onSuccess(res => {
                            setShippingMethods(prev => [...prev, res]);
                            addShippingMethodRef.current?.close();
                        })
                    }
                />
            </DialogContent>
        </Dialog>

        <Dialog ref={editShippingMethodRef}>
            <DialogContent className=' gap-6 sm:max-w-5xl ' aria-describedby=''>
                <DialogHeader>
                    <DialogTitle>Edit Shipping Method</DialogTitle>
                </DialogHeader>
                <ShippingForm
                    shippingMethod={selectedShippingMethod ? {
                        name: selectedShippingMethod.name,
                        originCountry: selectedShippingMethod.originCountry,
                        originPostalCode: selectedShippingMethod.originPostalCode,
                        processingTimeMin: selectedShippingMethod.processingTimeMin,
                        processingTimeMax: selectedShippingMethod.processingTimeMax,
                        shippingOptions: selectedShippingMethod.shippingOptions
                    } : undefined}
                    loading={editShippingMethod.isLoading}
                    onSubmit={(data: ShippingMethodDTO) => editShippingMethod
                        .request(selectedShippingMethod!.id, data)
                        .onSuccess(res => {
                            setShippingMethods(prev => prev.map(item => item.id === res.id ? res : item));
                            setSelectedShippingMethod(null);
                            editShippingMethodRef.current?.close();
                        })
                    }
                />
            </DialogContent>
        </Dialog>

        <Dialog ref={deleteDialogRef}>
            <DialogContent aria-describedby="">
                <DialogHeader>
                    <DialogTitle>Delete Shipping Method</DialogTitle>
                </DialogHeader>
                <div>Are you sure you want to delete this shipping method? It will delete all its shipping options too.</div>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => deleteDialogRef.current?.close()}>No</Button>
                    <Button onClick={() => {
                        deleteShippingMethod.request(deletionTarget!.id)
                            .onSuccess(() => {
                                setShippingMethods(prev => prev.filter(item => item.id !== deletionTarget!.id));
                                setDeletionTarget(null);
                                deleteDialogRef.current?.close();
                            });
                    }}>
                        {deleteShippingMethod.isLoading && <Spinner />}
                        Yes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </>;
};