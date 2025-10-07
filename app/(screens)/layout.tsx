import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
import React from "react";

const layout = ({ children }: { children: React.ReactElement }) => {
  return (
    <div>
      {children}
      <Footer />
    </div>
  );
};

export default layout;
