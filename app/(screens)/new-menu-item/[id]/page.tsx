import MenuItem from "@/components/screens/menu-item/menu-item";
import React from "react";

const page = ({ params }: { params: { id: string } }) => {
  return <MenuItem params={params}/>;
};

export default page;
