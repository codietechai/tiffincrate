"use client";
import React, { useEffect, useState } from "react";
import ConsumerHome from "./customer/customer-home";
import ProviderHome from "./provider/provider-home";
import AdminHome from "./admin/admin-home";
import { IUser } from "@/models/User";

const Home = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Auth check error:", error);
      window.location.href = "/auth/login";
    }
  };
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      {user &&
        (user.role === "consumer" ? (
          <ConsumerHome />
        ) : user.role === "provider" ? (
          <ProviderHome />
        ) : (
          <AdminHome />
        ))}
    </>
  );
};

export default Home;
