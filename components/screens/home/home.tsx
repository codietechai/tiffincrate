"use client";
import Header from "@/components/common/header";
import { Clock, IndianRupee, Star } from "lucide-react";
import Image from "next/image";
import React from "react";
import HomeHeader from "./home-header";

const Home = () => {
  const mockTiffins = [
    {
      id: 1,
      name: "Gujarati Thali",
      provider: "Shree Krishna Tiffin",
      price: 120,
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1589778655375-3e622a9fc91c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwbWVhbHN8ZW58MXx8fHwxNzU5NTU1MTYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 2,
      name: "Punjabi Combo",
      provider: "Amritsari Kitchen",
      price: 140,
      rating: 4.3,
      image:
        "https://images.unsplash.com/photo-1589778655375-3e622a9fc91c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwbWVhbHN8ZW58MXx8fHwxNzU5NTU1MTYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      id: 3,
      name: "South Indian Meals",
      provider: "Chennai Express",
      price: 100,
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1589778655375-3e622a9fc91c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmb29kJTIwdGlmZmluJTIwbWVhbHN8ZW58MXx8fHwxNzU5NTU1MTYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  const renderConsumerHome = () => (
    <div>
      <div className="mb-5">
        <h3 className="mb-3">Popular Tiffins Near You</h3>
        {mockTiffins.map((tiffin) => (
          <div
            key={tiffin.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-md border border-[#f0f0f0]"
          >
            <div className="flex gap-3">
              <Image
                src={tiffin.image}
                alt={tiffin.name}
                height={80}
                width={80}
                className="h-[80px] w-[80px] rounded-lg object-cover"
              />
              <div style={{ flex: 1 }}>
                <h4 className="mb-1">{tiffin.name}</h4>
                <p className="text-[#666] text-sm mb-1">{tiffin.provider}</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <Star size={14} fill="#ffd700" color="#ffd700" />
                  <span style={{ fontSize: "12px" }}>{tiffin.rating}</span>
                  <Clock size={14} color="#666" />
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    25-30 mins
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IndianRupee size={14} />
                    <span>{tiffin.price}</span>
                  </div>
                  <button
                    style={{
                      backgroundColor: "#ff1f01",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div>
      <HomeHeader />
      <div className="mt-5 px-2">{renderConsumerHome()}</div>
      <div className="mt-5 px-2">{renderConsumerHome()}</div>
    </div>
  );
};

export default Home;
