import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CartItemProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({
  id,
  name,
  description,
  price,
  quantity,
  isVeg,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-3 py-4">
      <div className="flex-shrink-0">
        <div
          className={`w-5 h-5 border-2 flex items-center justify-center ${
            isVeg ? "border-green-600" : "border-red-600"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isVeg ? "bg-green-600" : "bg-red-600"
            }`}
          />
        </div>
      </div>

      <div className="flex-1">
        <h3>{name}</h3>
        {description && (
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (quantity === 1) {
                  onRemove(id);
                } else {
                  onUpdateQuantity(id, quantity - 1);
                }
              }}
            >
              {quantity === 1 ? (
                <Trash2 className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
            </Button>
            <span className="w-6 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(id, quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <span>₹{(price * quantity).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
