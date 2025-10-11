"use client";
import React from "react";
import { MenuItemDetail } from "./menu-item-detail";
import { FloatingCartButton } from "./floating-cart-button";

const MenuItem = () => {
  const addToCart = (item: any) => {
    // setCartItems((items) => {
    //   const existingItem = items.find((i) => i.id === item.id);
    //   if (existingItem) {
    //     return items.map((i) =>
    //       i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
    //     );
    //   }
    //   return [...items, item];
    // });
  };
  const dummyMenuData = {
    name: "Healthy Indian Tiffin",
    description:
      "A balanced home-style Indian meal served fresh daily. Includes dal, sabzi, rice, and roti options that change every day.",
    category: "Lunch",
    basePrice: 249,
    rating: 4.6,
    reviewCount: 128,
    prepTime: "30 mins",
    calories: 550,
    isVegetarian: true,
    isBestseller: true,
    mustTry: true,
    imageUrl:
      "https://images.unsplash.com/photo-1601050690597-4e61e7d3b0d5?auto=format&fit=crop&w=1080&q=80",
    weeklyItems: {
      monday: {
        name: "Rajma Chawal",
        description: "Comforting kidney beans curry served with basmati rice.",
      },
      tuesday: {
        name: "Aloo Gobi & Roti",
        description: "Dry spiced cauliflower and potato curry with 3 rotis.",
      },
      wednesday: {
        name: "Chole Bhature",
        description: "Tangy chickpea curry served with fluffy bhaturas.",
      },
      thursday: {
        name: "Mix Veg & Jeera Rice",
        description: "Colorful vegetable curry with fragrant cumin rice.",
      },
      friday: {
        name: "Paneer Butter Masala",
        description: "Rich and creamy paneer curry with butter naan.",
      },
      saturday: {
        name: "Kadhi Pakora & Rice",
        description: "Gram flour dumplings simmered in yogurt-based curry.",
      },
      sunday: {
        name: "Veg Biryani with Raita",
        description: "Aromatic spiced rice dish served with fresh curd.",
      },
    },
  };

  return (
    <>
      <MenuItemDetail onAddToCart={addToCart} />
      <FloatingCartButton itemCount={2} totalAmount={100} />
    </>
  );
};

export default MenuItem;
