import { Separator } from "@/components/ui/separator";

interface BillDetailsProps {
  itemTotal: number;
  deliveryFee: number;
  platformFee: number;
  gst: number;
  discount: number;
  deliveryDiscount?: number;
}

export function BillDetails({
  itemTotal,
  deliveryFee,
  platformFee,
  gst,
  discount,
  deliveryDiscount = 0,
}: BillDetailsProps) {
  const totalBeforeTax =
    itemTotal + deliveryFee + platformFee - discount - deliveryDiscount;
  const totalToPay = totalBeforeTax + gst;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="mb-4">Bill Details</h3>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Item Total</span>
          <span>₹{itemTotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <div className="text-right">
            {deliveryDiscount > 0 && (
              <span className="line-through text-gray-400 mr-2">
                ₹{deliveryFee.toFixed(2)}
              </span>
            )}
            <span className={deliveryDiscount > 0 ? "text-green-600" : ""}>
              ₹{(deliveryFee - deliveryDiscount).toFixed(2)}
            </span>
          </div>
        </div>

        {deliveryDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Delivery Discount</span>
            <span>-₹{deliveryDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Platform Fee</span>
          <span>₹{platformFee.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">GST and Restaurant Charges</span>
          <span>₹{gst.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between">
          <span>TO PAY</span>
          <span>₹{totalToPay.toFixed(2)}</span>
        </div>

        {(discount > 0 || deliveryDiscount > 0) && (
          <div className="bg-green-50 border border-green-200 rounded p-2 mt-3">
            <p className="text-sm text-green-700">
              You saved ₹{(discount + deliveryDiscount).toFixed(2)} on this
              order!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
