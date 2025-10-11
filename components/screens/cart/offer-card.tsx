import { Badge } from "@/components/ui/badge";
import { Percent, Tag, Gift } from "lucide-react";

interface OfferCardProps {
  title: string;
  description: string;
  code: string;
  type: "discount" | "freebie" | "cashback";
  onApply: (code: string) => void;
}

export function OfferCard({
  title,
  description,
  code,
  type,
  onApply,
}: OfferCardProps) {
  const getIcon = () => {
    switch (type) {
      case "discount":
        return <Percent className="h-5 w-5 text-orange-600" />;
      case "freebie":
        return <Gift className="h-5 w-5 text-green-600" />;
      case "cashback":
        return <Tag className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="border rounded-lg p-4 flex gap-3 hover:border-orange-500 transition-colors cursor-pointer">
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1">
        <h4>{title}</h4>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
        <div className="flex items-center justify-between mt-3">
          <Badge variant="secondary" className="uppercase text-xs">
            {code}
          </Badge>
          <button
            className="text-orange-600 text-sm uppercase"
            onClick={() => onApply(code)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
