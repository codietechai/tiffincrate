"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  Bell,
  CreditCard,
  Clock,
  MapPin,
  Phone,
  Mail,
  Save,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function ProviderSettings() {
  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h2>Settings</h2>
        <p className="text-gray-500 mt-1 text-sm">Manage your settings</p>
      </div>

      <Tabs defaultValue="restaurant" className="space-y-4 md:space-y-6">
        <TabsList className="w-full overflow-x-auto flex justify-start">
          <TabsTrigger value="restaurant" className="flex-shrink-0">
            <Store className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Restaurant Info</span>
            <span className="md:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex-shrink-0">
            <Clock className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Operating Hours</span>
            <span className="md:hidden">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-shrink-0">
            <Bell className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Notifications</span>
            <span className="md:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-shrink-0">
            <CreditCard className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Payments</span>
            <span className="md:hidden">Pay</span>
          </TabsTrigger>
        </TabsList>

        {/* Restaurant Info */}
        <TabsContent value="restaurant">
          <Card>
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-base md:text-lg">
                Tiffin Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-name" className="text-sm">
                    Restaurant Name
                  </Label>
                  <Input
                    id="restaurant-name"
                    defaultValue="Tasty Bites Restaurant"
                    className="h-11 md:h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuisine" className="text-sm">
                    Cuisine Type
                  </Label>
                  <Input
                    id="cuisine"
                    defaultValue="North Indian, Chinese"
                    className="h-11 md:h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm">
                    Description
                  </Label>
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
                    <Label htmlFor="phone" className="text-sm">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      defaultValue="+91 98765 43210"
                      className="h-11 md:h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="restaurant@swiggy.com"
                      className="h-11 md:h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm">
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
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        Use Delivery Partners
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Enable delivery through partners
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        Self Delivery
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Deliver orders yourself
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        Pickup Option
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Allow customers to pick up tiffins
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="flex justify-end sticky bottom-0 bg-white pt-4 pb-2">
                <Button className="bg-orange-500 hover:bg-orange-600 h-11 md:h-10 w-full md:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operating Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-base md:text-lg">
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
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
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-2 sm:w-32">
                    <Switch defaultChecked />
                    <p className="text-gray-900 text-sm md:text-base">{day}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-1 ml-10 sm:ml-0">
                    <Input
                      type="time"
                      defaultValue="09:00"
                      className="w-28 h-10"
                    />
                    <span className="text-gray-500 text-sm">to</span>
                    <Input
                      type="time"
                      defaultValue="23:00"
                      className="w-28 h-10"
                    />
                  </div>
                </div>
              ))}

              <Separator className="my-4 md:my-6" />

              <div className="space-y-4">
                <h3 className="text-base md:text-lg">Special Hours</h3>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm md:text-base">
                      Currently Accepting Orders
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm">
                      Toggle to pause all orders temporarily
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end sticky bottom-0 bg-white pt-4 pb-2">
                <Button className="bg-orange-500 hover:bg-orange-600 h-11 md:h-10 w-full md:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-base md:text-lg">
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
              <div className="space-y-4">
                <h3 className="text-base md:text-lg">Order Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        New Order Alerts
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Get notified when a new order is received
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        Order Cancellation Alerts
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Notify when an order is cancelled
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        Sound Alerts
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Play sound for new orders
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base md:text-lg">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        Daily Summary
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Receive daily sales summary via email
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        Weekly Report
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Get weekly performance reports
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="flex justify-end sticky bottom-0 bg-white pt-4 pb-2">
                <Button className="bg-orange-500 hover:bg-orange-600 h-11 md:h-10 w-full md:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <Card>
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-base md:text-lg">
                Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
              <div className="space-y-4">
                <h3 className="text-base md:text-lg">
                  Accepted Payment Methods
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        Cash on Delivery
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Accept cash payments on delivery
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        Online Payments
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Accept online payments via Swiggy
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm md:text-base">
                        UPI Payments
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        Accept UPI payments
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base md:text-lg">Bank Account Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-holder" className="text-sm">
                      Account Holder Name
                    </Label>
                    <Input
                      id="account-holder"
                      defaultValue="HomeMade Tiffins"
                      className="h-11 md:h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-number" className="text-sm">
                      Account Number
                    </Label>
                    <Input
                      id="account-number"
                      defaultValue="1234567890"
                      type="password"
                      className="h-11 md:h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifsc" className="text-sm">
                      IFSC Code
                    </Label>
                    <Input
                      id="ifsc"
                      defaultValue="SBIN0001234"
                      className="h-11 md:h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank" className="text-sm">
                      Bank Name
                    </Label>
                    <Input
                      id="bank"
                      defaultValue="State Bank of India"
                      className="h-11 md:h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end sticky bottom-0 bg-white pt-4 pb-2">
                <Button className="bg-orange-500 hover:bg-orange-600 h-11 md:h-10 w-full md:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
