"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingPage } from "@/components/ui/loading";
import TitleHeader from "@/components/common/title-header";
import PersonalTab from "./personal-tab";
import { Settings, LogOut } from "lucide-react";

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchProfile();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) router.push("/auth/login");
    } catch (error) {
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
          cuisine: data.cuisine.split(",").map((c: string) => c.trim()).filter(Boolean),
          deliveryAreas: data.deliveryAreas.split(",").map((a: string) => a.trim()).filter(Boolean),
          operatingHours: data.operatingHours,
        };
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <TitleHeader
            title="Profile Settings"
            description="Manage your account information and preferences"
            icon={<Settings />}
          />
          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              {profile?.user.role === "provider" && (
                <TabsTrigger value="business">Business Information</TabsTrigger>
              )}
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  {/* Business Tab Here */}
                </TabsContent>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
