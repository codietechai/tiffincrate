"use client";

import { Card } from "@/components/ui/card";
import { Home, Star, Trash2, Pencil } from "lucide-react";

interface Address {
  _id: string;
  name: string;
  address_line_1: string;
  city: string;
  is_default: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <Card className="p-4 mb-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-start">
          <div className="bg-gray-100 rounded-xl p-3 flex items-center justify-center">
            <Home className="h-5 w-5 text-gray-700" />
          </div>

          <div>
            <p className="font-semibold text-base">{address.name}</p>
            <p className="text-sm text-gray-600 mt-0.5">
              {address.address_line_1}
            </p>
            <p className="text-xs text-gray-500">{address.city}</p>

            {address.is_default && (
              <span className="text-xs inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-md">
                Default Address
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Default Button */}
          <IconSquare
            onClick={() => onSetDefault(address._id)}
            active={address.is_default}
            activeColor="text-yellow-600 bg-yellow-100"
          >
            <Star
              className={`h-4 w-4 ${
                address.is_default ? "fill-yellow-600" : ""
              }`}
            />
          </IconSquare>

          <IconSquare onClick={() => onEdit(address._id)}>
            <Pencil className="h-4 w-4" />
          </IconSquare>

          <IconSquare
            onClick={() => onDelete(address._id)}
            hoverColor="hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </IconSquare>
        </div>
      </div>
    </Card>
  );
}

function IconSquare({
  children,
  onClick,
  active = false,
  activeColor = "",
  hoverColor = "hover:bg-gray-200 hover:text-black",
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  hoverColor?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`h-9 w-9 flex items-center justify-center cursor-pointer rounded-lg border border-gray-200 transition-all 
      ${active ? activeColor : "text-gray-600"}
      ${hoverColor}
      hover:scale-105
      bg-white`}
    >
      {children}
    </div>
  );
}
