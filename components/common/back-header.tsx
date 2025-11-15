"use client";
import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackHeader = () => {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-gray-700"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Button>
      </div>
    </div>
  );
};

export default BackHeader;
