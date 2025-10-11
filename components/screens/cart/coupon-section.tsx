import { useState } from "react";
import { Tag, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CouponSectionProps {
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
}

export function CouponSection({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CouponSectionProps) {
  const [couponInput, setCouponInput] = useState("");

  const handleApply = () => {
    if (couponInput.trim()) {
      onApplyCoupon(couponInput.trim().toUpperCase());
      setCouponInput("");
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-5 w-5" />
        <span>Apply Coupon</span>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <Badge variant="secondary" className="uppercase">
              {appliedCoupon}
            </Badge>
            <span className="text-sm text-green-700">applied</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveCoupon}
            className="h-8 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            className="uppercase"
          />
          <Button onClick={handleApply} variant="outline">
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}
