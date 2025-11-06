import { Bell } from "lucide-react";
import React from "react";

export const ElseComponent = ({
  icon,
  heading,
  description,
  button,
}: {
  icon: React.ReactElement;
  heading: string;
  description: string;
  button?: React.ReactElement;
}) => {
  return (
    <div className="text-center py-12 space-y-2">
      {React.cloneElement(icon, {
        className: "h-10 w-10 mx-auto text-primary",
      })}
      <h3 className="font-medium text-gray-900">{heading}</h3>
      <p className="text-gray-600 text-sm lg:text-base">{description}</p>
      {!!button && <div className="pt-3">{button}</div>}
    </div>
  );
};
