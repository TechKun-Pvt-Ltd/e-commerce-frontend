"use client"

import React, { useCallback, useState, useEffect } from 'react';

import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ShippingForm from './components/ShippingForm';
import { ShippingMethod, ShippingMethodUpdationPayload } from '@/types/domains/shipping_method';
import * as shippingServices from '@/services/shippingMethod';
import useDataFetch from '@/hooks/use-data-fetch';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import ShippingItem from './components/ShippingItem';

// Mock data - replace this with actual API call
const mockShippingData: ShippingMethod[] = [
  {
    "id": 101,
    "seller_id": 555,
    "name": "DHL Worldwide Express",
    "shippingOptions": [
      {
        "id": 201,
        "profile_id": 101,
        "destination_country": "IN",
        "carrier": "DHL Express",
        "cost_first_item": 25.0
      },
      {
        "id": 202,
        "profile_id": 101,
        "destination_country": "TR",
        "carrier": "DHL Express",
        "cost_first_item": 27.0
      }
    ]
  },
  {
    "id": 102,
    "seller_id": 556,
    "name": "FedEx International Priority",
    "shippingOptions": [
      {
        "id": 203,
        "profile_id": 102,
        "destination_country": "US",
        "carrier": "FedEx",
        "cost_first_item": 30.0
      },
      {
        "id": 204,
        "profile_id": 102,
        "destination_country": "UK",
        "carrier": "FedEx",
        "cost_first_item": 32.0
      }
    ]
  },
  {
    "id": 103,
    "seller_id": 557,
    "name": "UPS Worldwide Saver",
    "shippingOptions": [
      {
        "id": 205,
        "profile_id": 103,
        "destination_country": "DE",
        "carrier": "UPS",
        "cost_first_item": 22.5
      },
      {
        "id": 206,
        "profile_id": 103,
        "destination_country": "FR",
        "carrier": "UPS",
        "cost_first_item": 24.0
      }
    ]
  },
  {
    "id": 104,
    "seller_id": 558,
    "name": "Aramex Global Solutions",
    "shippingOptions": [
      {
        "id": 207,
        "profile_id": 104,
        "destination_country": "AE",
        "carrier": "Aramex",
        "cost_first_item": 18.0
      },
      {
        "id": 208,
        "profile_id": 104,
        "destination_country": "SA",
        "carrier": "Aramex",
        "cost_first_item": 20.0
      }
    ]
  },
  {
    "id": 105,
    "seller_id": 559,
    "name": "BlueDart Express India",
    "shippingOptions": [
      {
        "id": 209,
        "profile_id": 105,
        "destination_country": "IN",
        "carrier": "BlueDart",
        "cost_first_item": 10.0
      },
      {
        "id": 210,
        "profile_id": 105,
        "destination_country": "NP",
        "carrier": "BlueDart",
        "cost_first_item": 15.0
      }
    ]
  }
];

export default function ShippingMethodsPage() {
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const addShippingMethodRef = React.useRef<{ open(): void, close(): void }>(null);
    const editShippingMethodRef = React.useRef<{ open(): void, close(): void }>(null);
    const deleteDialogRef = React.useRef<{ open(): void, close(): void }>(null);
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
    const [deletionTarget, setDeletionTarget] = useState<ShippingMethod | null>(null);
    
    const addShippingMethod = useDataFetch(shippingServices.createShippingMethod);
    const editShippingMethod = useDataFetch(shippingServices.updateShippingMethod);
    const deleteShippingMethod = useDataFetch(shippingServices.deleteShippingMethod);


    useEffect(() => {
        const loadShippingMethods = async () => {
            try {
                setLoading(true);
                // Try to fetch from API first
                // const response = await shippingServices.getAllShippingMethods();
                // if (response.success) {
                //     setShippingMethods(response.data);
                // } else {
                //     // If API fails, use mock data
                //     setShippingMethods(mockShippingData);
                // }
                
                // For now, simulate API call and use mock data
                await new Promise(resolve => setTimeout(resolve, 1000));
                setShippingMethods(mockShippingData);
                setError(null);
            } catch (err) {
                console.error('Error loading shipping methods:', err);
                setShippingMethods(mockShippingData);
                setError('Failed to load from API, showing mock data');
            } finally {
                setLoading(false);
            }
        };

        loadShippingMethods();
    }, []);

    const onEdit = useCallback((shippingMethod: ShippingMethod) => {
        setSelectedShippingMethod(shippingMethod);
        editShippingMethodRef.current?.open();
    }, []);

    const onDelete = useCallback((shippingMethod: ShippingMethod) => {
        setDeletionTarget(shippingMethod);
        deleteDialogRef.current?.open();
    }, []);

    return <>
        <div className="h-full space-y-8 flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">Shipping Methods</h1>
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                    {error}
                </div>
            )}
            <div className="max-w-2xl py-2 space-y-2">
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
            <DialogContent className=' gap-6 ' aria-describedby=''>
                <DialogHeader>
                    <DialogTitle>Add Shipping Method</DialogTitle>
                </DialogHeader>
                <ShippingForm
                    loading={addShippingMethod.isLoading}
                    onSubmit={data => addShippingMethod.request({
                            seller_id: 1, // Replace with actual seller_id
                            name: data.name,
                            shippingOptions: data.shippingOptions.map(item => ({
                                destination_country: item.destination_country,
                                carrier: item.carrier,
                                cost_first_item: item.cost_first_item
                            }))
                        }).onSuccess(res => {
                            setShippingMethods(prev => [...prev, res]);
                            addShippingMethodRef.current?.close();
                        })
                    }
                />
            </DialogContent>
        </Dialog>

        <Dialog ref={editShippingMethodRef}>
            <DialogContent  className='gap-6' aria-describedby=''>
                <DialogHeader>
                    <DialogTitle>Edit Shipping Method</DialogTitle>
                </DialogHeader>
                <ShippingForm
                    shippingMethod={selectedShippingMethod!}
                    loading={editShippingMethod.isLoading}
                    onSubmit={(data: ShippingMethodUpdationPayload) => editShippingMethod
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