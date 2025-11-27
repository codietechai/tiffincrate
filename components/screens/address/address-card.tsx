"use client";

import { Card } from "@/components/ui/card";
import { Home, Star, Trash2, Pencil } from "lucide-react";

export default function AddressCard({
  address,
  isDefault,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: any;
  isDefault: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  return (
    <Card className="p-4 mb-3">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <Home className="h-5 w-5 text-gray-600 mt-1" />

          <div>
            <p className="font-semibold">
              {address.first_name} {address.last_name}
            </p>
            <p className="text-sm text-gray-600 leading-tight">
              {address.address_line_1}
            </p>
            <p className="text-xs text-gray-500">{address.city}</p>

            {isDefault && (
              <span className="text-xs mt-1 text-green-600 font-medium">
                Default Address
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3 text-gray-400">
          <Star
            className={`h-4 w-4 cursor-pointer ${
              isDefault ? "text-yellow-600" : "hover:text-yellow-500"
            }`}
            onClick={onSetDefault}
          />
          <Pencil
            className="h-4 w-4 cursor-pointer hover:text-blue-600"
            onClick={onEdit}
          />
          <Trash2
            className="h-4 w-4 cursor-pointer hover:text-red-600"
            onClick={onDelete}
          />
        </div>
      </div>
    </Card>
  );
}
