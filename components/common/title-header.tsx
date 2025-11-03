import React from "react";

const TitleHeader = ({
  icon,
  title,
  description,
  rightComponent,
}: {
  icon: React.ReactElement;
  title: string;
  description: string;
  rightComponent?: React.ReactElement;
}) => {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {React.cloneElement(icon, {
            className: "h-5 w-5 lg:h-8 lg:w-8",
          })}
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      {rightComponent}
    </div>
  );
};

export default TitleHeader;
