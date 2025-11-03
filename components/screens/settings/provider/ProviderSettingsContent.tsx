"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, Phone, Mail, MapPin } from "lucide-react";

type Props = {
  tab: "restaurant" | "hours" | "notifications" | "payments";
};

export function ProviderSettingsContent({ tab }: Props) {
  if (tab === "restaurant") {
    return (
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Tiffin Service Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input
                  id="restaurant-name"
                  defaultValue="Tasty Bites Restaurant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Input id="cuisine" defaultValue="North Indian, Chinese" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue="We provide fresh homemade tiffin service with healthy and hygienic meals."
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-base md:text-lg">Contact Information</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input id="phone" defaultValue="+91 98765 43210" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="restaurant@swiggy.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Full Address
                  </Label>
                  <Textarea
                    id="address"
                    defaultValue="123, MG Road, Bangalore, Karnataka - 560001"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-base md:text-lg">Service Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p>Use Delivery Partners</p>
                    <p className="text-xs text-gray-500">
                      Enable delivery through partners
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p>Self Delivery</p>
                    <p className="text-xs text-gray-500">
                      Deliver orders yourself
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p>Pickup Option</p>
                    <p className="text-xs text-gray-500">
                      Allow customers to pick up tiffins
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tab === "hours") {
    return (
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center gap-3 border-b pb-3 last:border-none"
              >
                <div className="flex items-center gap-2 sm:w-32">
                  <Switch defaultChecked />
                  <p>{day}</p>
                </div>
                <div className="flex items-center gap-2 flex-1 ml-10 sm:ml-0">
                  <Input type="time" defaultValue="09:00" className="w-28" />
                  <span className="text-gray-500 text-sm">to</span>
                  <Input type="time" defaultValue="23:00" className="w-28" />
                </div>
              </div>
            ))}

            <Separator />

            <div className="space-y-4">
              <h3 className="text-base md:text-lg">Special Hours</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p>Currently Accepting Orders</p>
                  <p className="text-xs text-gray-500">
                    Toggle to pause all orders temporarily
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tab === "notifications") {
    return (
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base md:text-lg">Order Notifications</h3>

              {[
                {
                  title: "New Order Alerts",
                  desc: "Get notified when a new order is received",
                  checked: true,
                },
                {
                  title: "Order Cancellation Alerts",
                  desc: "Notify when an order is cancelled",
                  checked: true,
                },
                {
                  title: "Sound Alerts",
                  desc: "Play sound for new orders",
                  checked: true,
                },
              ].map((n) => (
                <div
                  key={n.title}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p>{n.title}</p>
                    <p className="text-xs text-gray-500">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.checked} />
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-base md:text-lg">Email Notifications</h3>

              {[
                {
                  title: "Daily Summary",
                  desc: "Receive daily sales summary via email",
                  checked: true,
                },
                {
                  title: "Weekly Report",
                  desc: "Get weekly performance reports",
                  checked: false,
                },
              ].map((n) => (
                <div
                  key={n.title}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p>{n.title}</p>
                    <p className="text-xs text-gray-500">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.checked} />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tab === "payments") {
    return (
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-base md:text-lg">Accepted Payment Methods</h3>

              {[
                {
                  title: "Cash on Delivery",
                  desc: "Accept cash payments on delivery",
                  checked: true,
                },
                {
                  title: "Online Payments",
                  desc: "Accept online payments via Swiggy",
                  checked: true,
                },
                {
                  title: "UPI Payments",
                  desc: "Accept UPI payments",
                  checked: true,
                },
              ].map((p) => (
                <div
                  key={p.title}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p>{p.title}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                  <Switch defaultChecked={p.checked} />
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-base md:text-lg">Bank Account Details</h3>

              <div className="space-y-2">
                <Label htmlFor="account-holder">Account Holder Name</Label>
                <Input id="account-holder" defaultValue="HomeMade Tiffins" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  defaultValue="1234567890"
                  type="password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifsc">IFSC Code</Label>
                <Input id="ifsc" defaultValue="SBIN0001234" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank">Bank Name</Label>
                <Input id="bank" defaultValue="State Bank of India" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
