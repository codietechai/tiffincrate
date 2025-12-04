"use client";
import React, { useEffect, useState } from "react";
import ConsumerHome from "./customer/customer-home";
import ProviderHome from "./provider/provider-home";
import AdminHome from "./admin/admin-home";
import { AuthService } from "@/services/auth-service";
import { TUser } from "@/types";

const Home = () => {
  const [user, setUser] = useState<TUser | null>(null);
  const checkAuth = async () => {
    try {
      const data = await AuthService.checkAuth();
      setUser(data.data);
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
