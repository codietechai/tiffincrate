import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CrossIcon, Mic, Search, X } from "lucide-react";

const SearchDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] rounded-lg md:w-auto pt-10 px-3 md:px-4">
        <div className="border-border border-2 rounded-lg relative">
          <Search className="text-[#b7b7b7] absolute top-2 left-3" />
          <div className="h-8 w-[1px] bg-border block absolute top-1 right-[38px]"></div>
          <Mic className="text-[#ff1f01] absolute top-3 right-3 h-4 w-4" />
          <input
            type="text"
            className="border-none outline-none py-2 pl-12 pr-4 w-full bg-transparent"
            placeholder="Search for lunch, non-veg.."
          />
        </div>
        <p className="text-sm text-[#666]">Recently Searched</p>
        <div className="flex gap-2">
          <span className="border border-border items-center text-[#333] flex text-xs rounded-full px-2 py-1 gap-1">
            Bal makhni <X size={12} />
          </span>
        </div>
        <div className="h-[20vh] w-full flex items-center justify-center text-[#666]">
          Search for something...
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
