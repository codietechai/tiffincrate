import { useState } from "react";
import { ShoppingBag, ChevronRight, MapPin } from "lucide-react";
import { CartItem } from "../screens/cart/cart-item";
import { OfferCard } from "../screens/cart/offer-card";
import { CouponSection } from "../screens/cart/coupon-section";
import { BillDetails } from "../screens/cart/bill-details";
import { FloatingCartButton } from "../screens/menu-item/floating-cart-button";
import { MenuItemDetail } from "../screens/menu-item/menu-item-detail";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

interface CartItemType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

type View = "cart" | "menu-item";

const INITIAL_CART_ITEMS: CartItemType[] = [
  {
    id: "1",
    name: "Paneer Butter Masala",
    description: "Rich and creamy cottage cheese curry",
    price: 280,
    quantity: 2,
    isVeg: true,
  },
  {
    id: "2",
    name: "Chicken Biryani",
    description: "Fragrant basmati rice with tender chicken pieces",
    price: 350,
    quantity: 1,
    isVeg: false,
  },
  {
    id: "3",
    name: "Garlic Naan",
    description: "Soft bread with garlic and butter",
    price: 60,
    quantity: 3,
    isVeg: true,
  },
  {
    id: "4",
    name: "Gulab Jamun",
    description: "Traditional Indian dessert",
    price: 80,
    quantity: 1,
    isVeg: true,
  },
];

const AVAILABLE_OFFERS = [
  {
    title: "60% OFF up to ₹120",
    description: "Use code PARTY for orders above ₹500",
    code: "PARTY",
    type: "discount" as const,
  },
  {
    title: "Free Delivery",
    description: "Get free delivery on orders above ₹199",
    code: "FREEDEL",
    type: "freebie" as const,
  },
  {
    title: "Flat ₹50 OFF",
    description: "Use code FEAST50 for orders above ₹300",
    code: "FEAST50",
    type: "discount" as const,
  },
];

const COUPON_DISCOUNTS: {
  [key: string]: { discount: number; freeDelivery: boolean };
} = {
  PARTY: { discount: 120, freeDelivery: false },
  FREEDEL: { discount: 0, freeDelivery: true },
  FEAST50: { discount: 50, freeDelivery: false },
  WELCOME100: { discount: 100, freeDelivery: false },
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>("menu-item");
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
    // toast.success("Item removed from cart");
  };

  const addToCart = (item: any) => {
    setCartItems((items) => {
      const existingItem = items.find((i) => i.id === item.id);
      if (existingItem) {
        return items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...items, item];
    });
  };

  const applyCoupon = (code: string) => {
    if (COUPON_DISCOUNTS[code]) {
      setAppliedCoupon(code);
      //   toast.success(`Coupon ${code} applied successfully!`);
    } else {
      //   toast.error("Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    // toast.info("Coupon removed");
  };

  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = 40;
  const platformFee = 5;
  const gstRate = 0.05;
  const gst = itemTotal * gstRate;

  const couponData = appliedCoupon ? COUPON_DISCOUNTS[appliedCoupon] : null;
  const discount = couponData?.discount || 0;
  const deliveryDiscount = couponData?.freeDelivery ? deliveryFee : 0;

  const totalItemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalBeforeTax =
    itemTotal + deliveryFee + platformFee - discount - deliveryDiscount;
  const totalAmount = totalBeforeTax + gst;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-orange-600" />
              <h1>Your Cart</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentView("menu-item")}
              >
                Add More Items
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Deliver to Home</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2>Spice Garden Restaurant</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Connaught Place, New Delhi
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">
                      {cartItems.length} items
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              {cartItems.length > 0 ? (
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      {...item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-gray-600 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Add items to get started
                  </p>
                  <Button
                    onClick={() => setCurrentView("menu-item")}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Browse Menu
                  </Button>
                </div>
              )}
            </Card>

            {/* Offers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3>Available Offers</h3>
                <button className="text-orange-600 text-sm flex items-center gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {AVAILABLE_OFFERS.map((offer) => (
                  <OfferCard
                    key={offer.code}
                    {...offer}
                    onApply={applyCoupon}
                  />
                ))}
              </div>
            </div>

            <Card className="p-4">
              <h3 className="mb-3">Any cooking requests? (Optional)</h3>
              <textarea
                className="w-full border rounded-lg p-3 resize-none"
                rows={3}
                placeholder="e.g., Don't ring the bell, make it less spicy..."
              />
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <CouponSection
                appliedCoupon={appliedCoupon}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
              />

              <BillDetails
                itemTotal={itemTotal}
                deliveryFee={deliveryFee}
                platformFee={platformFee}
                gst={gst}
                discount={discount}
                deliveryDiscount={deliveryDiscount}
              />

              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                Proceed to Checkout
              </Button>

              <div className="text-xs text-gray-500 text-center">
                By placing this order, you agree to our Terms & Conditions and
                Privacy Policy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
