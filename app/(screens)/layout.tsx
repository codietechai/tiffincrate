import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
import React from "react";

const layout = ({ children }: { children: React.ReactElement }) => {
  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-[900px] mx-auto relative">
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default layout;
