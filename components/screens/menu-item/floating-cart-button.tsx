import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingCartButtonProps {
  itemCount: number;
  totalAmount: number;
}

export function FloatingCartButton({
  itemCount,
  totalAmount,
}: FloatingCartButtonProps) {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-50">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <Button
          className="w-full bg-orange-600 hover:bg-orange-700 shadow-lg h-14 text-base"
          size="lg"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <span>View Cart • ₹{totalAmount.toFixed(2)}</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
