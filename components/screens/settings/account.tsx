"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Trash2, TriangleAlert as AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const Account = ({
  setError,
}: {
  setError: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const router = useRouter();
  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      alert(
        "Account deletion requested. You will receive a confirmation email."
      );
    } catch (error) {
      setError("Failed to delete account");
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await fetch("/api/auth/logout-all", { method: "POST" });
      router.push("/auth/login");
    } catch (error) {
      setError("Failed to logout from all devices");
    }
  };
  return (
    <TabsContent value="account" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
          <CardDescription>
            Manage your account security and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Security Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" onClick={handleLogoutAllDevices}>
                  Logout from all devices
                </Button>
                <p className="text-sm text-gray-500">
                  This will log you out from all devices and you'll need to sign
                  in again
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2 text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </h4>
              <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h5 className="font-medium text-red-800">Delete Account</h5>
                  <p className="text-sm text-red-600 mb-2">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default Account;
