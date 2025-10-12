import SingleProvider from "@/components/screens/single-provider/single-provider";
import React from "react";

const page = ({ params }: { params: { id: string } }) => {
  return <SingleProvider id={params.id} />;
};

export default page;
