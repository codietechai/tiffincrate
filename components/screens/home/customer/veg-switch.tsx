"use client";
import { motion } from "framer-motion";
import { Leaf, Drumstick } from "lucide-react";

interface VegNonVegSwitchProps {
  filters: { isVegetarian: boolean };
  setFilters: React.Dispatch<React.SetStateAction<{ isVegetarian: boolean }>>;
}

export default function VegNonVegSwitch({
  filters,
  setFilters,
}: VegNonVegSwitchProps) {
  const isVeg = filters.isVegetarian;

  const toggleSwitch = () => {
    setFilters((prev) => ({
      ...prev,
      isVegetarian: !prev.isVegetarian,
    }));
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-xs text-black font-medium">{isVeg ? "Veg" : ""}</div>
      <div
        onClick={toggleSwitch}
        className={`relative w-12 h-6 flex items-center rounded-full cursor-pointer transition-colors duration-300 ${
          isVeg ? "bg-green-500" : "bg-red-500"
        }`}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center ${
            isVeg ? "left-1" : "right-1"
          }`}
        >
          {isVeg ? (
            <Leaf className="text-green-600 h-3 w-3" />
          ) : (
            <Drumstick className="text-red-600 h-3 w-3" />
          )}
        </motion.div>
      </div>
      <div className="text-xs text-black font-medium">
        {!isVeg ? "Non-veg" : ""}
      </div>
    </div>
  );
}
