"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/Navbar";
import { LoadingPage } from "@/components/ui/loading";
import { User, Phone, MapPin, Mail, Lock, Store, Settings } from "lucide-react";
import TitleHeader from "@/components/common/title-header";
import PersonalTab from "./personal-tab";
import BussinessTab from "../settings/provider/bussiness-details";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      description: "",
      cuisine: "",
      deliveryAreas: "",
      operatingHours: {
        start: "09:00",
        end: "21:00",
      },
    },
  });

  useEffect(() => {
    checkAuth();
    fetchProfile();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth/login");
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);

        reset({
          name: data.profile.user.name || "",
          phone: data.profile.user.phone || "",
          address: data.profile.user.address || "",
          password: "",
          confirmPassword: "",
          businessName: data.profile.serviceProvider?.businessName || "",
          description: data.profile.serviceProvider?.description || "",
          cuisine: data.profile.serviceProvider?.cuisine?.join(", ") || "",
          deliveryAreas:
            data.profile.serviceProvider?.deliveryAreas?.join(", ") || "",
          operatingHours: data.profile.serviceProvider?.operatingHours || {
            start: "09:00",
            end: "21:00",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    setError("");
    setMessage("");

    if (data.password && data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      setSaving(false);
      return;
    }

    try {
      const payload: any = { ...data };

      if (!data.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }

      if (profile.user.role === "provider") {
        payload.serviceProvider = {
          businessName: data.businessName,
          description: data.description,
          cuisine: data.cuisine
            .split(",")
            .map((c: string) => c.trim())
            .filter(Boolean),
          deliveryAreas: data.deliveryAreas
            .split(",")
            .map((a: string) => a.trim())
            .filter(Boolean),
          operatingHours: data.operatingHours,
        };
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        setMessage("Profile updated successfully");
        reset({ ...data, password: "", confirmPassword: "" });
        fetchProfile();
      } else {
        setError(resData.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TitleHeader
          title=" Profile Settings"
          description="Manage your account information and preferences"
          icon={<Settings />}
        />

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            {profile?.user.role === "provider" && (
              <TabsTrigger value="business">Business Information</TabsTrigger>
            )}
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TabsContent value="personal" className="space-y-6">
              <PersonalTab
                message={message}
                error={error}
                errors={errors}
                register={register}
                profile={profile}
                watch={watch}
              />
            </TabsContent>

            {profile?.user.role === "provider" && (
              <TabsContent value="business" className="space-y-6">
                {/* <BussinessTab errors={errors} register={register} /> */}
              </TabsContent>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
}
