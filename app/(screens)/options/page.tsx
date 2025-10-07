import {
  ArrowBigLeftDashIcon,
  MapPin,
  EllipsisIcon,
  CreditCardIcon,
  Wallet,
  UserIcon,
  Heart,
  Bell,
  LogOut,
  MessageSquareIcon,
} from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div>
      <div className="h-[20vh] py-4 bg-[#ffc3bb] rounded-b-xl  lg:rounded-b-[80px] px-4 md:px-10">
        <div className="max-w-[1100px] mx-auto flex flex-col justify-between h-full">
          <div className="flex justify-between items-center">
            <ArrowBigLeftDashIcon className="text-white cursor-pointer" />
            <div className="flex items-center gap-3">
              <button className="bg-white px-3 py-1 text-xs text-[#ff1f01] rounded-full">
                Help
              </button>
              <div className="rotate-90">
                <EllipsisIcon className="text-white" size={20} />
              </div>
            </div>
          </div>
          <div className="">
            <h2 className="text-xl font-extrabold">Navnoor Singh</h2>
            <p className="text-xs text-[#3b3b3b]">+91-6280524351</p>
            <p className="text-xs text-[#3b3b3b]">
              navnoorsinghthind135@gmail.com
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 md:px-10">
        <div className="max-w-[1100px] mx-auto">
          <h1 className=" text-2xl font-bold mt-10">Settings</h1>
          <div className="grid grid-cols-3 gap-3 py-5">
            <div className="rounded-lg border-border border-2 px-3 py-2 flex flex-col lg:flex-row gap-2 items-center">
              <MapPin className="h-5 w-5" />
              <p className="text-xs lg:text-base text-center text-foreground">
                Saved <br className="md:hidden" />
                Address
              </p>
            </div>
            <div className="rounded-lg border-border border-2 px-3 py-2 flex flex-col lg:flex-row gap-2 items-center">
              <CreditCardIcon className="h-5 w-5" />
              <p className="text-xs lg:text-base text-center text-foreground">
                Payment
                <br className="md:hidden" /> Mode
              </p>
            </div>
            <div className="rounded-lg border-border border-2 px-3 py-2 flex flex-col lg:flex-row gap-2 items-center">
              <Wallet className="h-5 w-5" />
              <p className="text-xs lg:text-base text-center text-foreground">
                Tiffini
                <br className="md:hidden" /> Wallet
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 md:px-10">
        <div className="max-w-[1100px] mx-auto py-3 space-y-3 border border-border rounded-xl">
          <div className="flex gap-5 text-sm items-center border-b border-border pb-2 px-3">
            <UserIcon className="h-4 w-4" />
            Profile
          </div>
          <div className="flex gap-5 text-sm items-center border-b border-border pb-2 px-3">
            <Heart className="h-4 w-4" />
            Favouaites
          </div>
          <div className="flex gap-5 text-sm items-center border-b border-border pb-2 px-3">
            <Bell className="h-4 w-4" />
            Notifications
          </div>
          <div className="flex gap-5 text-sm items-center border-b border-border pb-2 px-3">
            <MessageSquareIcon className="h-4 w-4" />
            Help & Support
          </div>
          <div className="flex gap-5 text-sm items-center border-b border-border pb-2 px-3">
            <UserIcon className="h-4 w-4" />
            Account Settings
          </div>
          <div className="flex gap-5 text-sm items-center border-b border-border pb-2 px-3">
            <LogOut className="h-4 w-4" />
            Logout
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
