"use client";

import { useState, useEffect } from "react";
import { AddressService } from "@/services/address-service";
import { AddressCard } from "./address-card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { TAddress } from "@/types/address";

interface AddressListProps {
    onEdit: (id: string) => void;
    onDelete?: (id: string) => void;
    onSetDefault?: (id: string) => void;
    chooseAnother?: () => void;
    refreshTrigger?: number;
}

export function AddressList({
    onEdit,
    onDelete,
    onSetDefault,
    chooseAnother,
    refreshTrigger = 0,
}: AddressListProps) {
    const [addresses, setAddresses] = useState<TAddress[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAddresses = async () => {
        setIsLoading(true);
        try {
            const data = await AddressService.fetchAll();
            setAddresses(data.data);
        } catch (err: any) {
            console.error("Error fetching addresses:", err);
            toast.error(err.message || "Failed to fetch addresses");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, [refreshTrigger]);

    const handleDelete = async (addressId: string) => {
        if (onDelete) {
            try {
                await onDelete(addressId);
                setAddresses(addresses.filter((a) => a._id !== addressId));
                toast.success("Address deleted successfully");
            } catch (error: any) {
                toast.error(error.message || "Failed to delete address");
            }
        }
    };

    const handleSetDefault = async (addressId: string) => {
        if (onSetDefault) {
            try {
                await onSetDefault(addressId);
                if (!chooseAnother) {
                    // Only refresh if not in choose-another mode (it will navigate back)
                    fetchAddresses();
                    toast.success("Default address updated");
                }
            } catch (error: any) {
                toast.error(error.message || "Failed to update default address");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array(3)
                    .fill(0)
                    .map((_, i) => (
                        <Skeleton key={i} className="h-[130px] rounded-xl" />
                    ))}
            </div>
        );
    }

    if (addresses.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No addresses saved yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                    Add your first address to get started
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {addresses.map((address) => (
                <AddressCard
                    key={address._id}
                    address={address}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                    chooseAnother={chooseAnother}
                />
            ))}
        </div>
    );
}