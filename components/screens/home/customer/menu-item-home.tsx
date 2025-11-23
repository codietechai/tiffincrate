"use client";
import { IndianRupee, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePathname, useRouter } from "next/navigation";
import { TMenu } from "@/types";

const MenuItemHome = ({ menu }: { menu: TMenu }) => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <Card
      key={menu._id}
      className="bg-background border border-border rounded-xl shadow-sm"
    >
      <CardContent className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="flex gap-3">
          <Image
            src={menu.image || "/placeholder.jpg"}
            alt={menu.name}
            height={50}
            width={50}
            className="h-[50px] w-[50px] rounded-lg object-cover"
          />
          <div className="lg:hidden">
            <h3 className="font-semibold mb-1">
              {menu.name}{" "}
              {/* {pathname.includes("home") &&
                `by ${menu.providerId?.businessName}`} */}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {menu.description}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="hidden lg:block">
            <h3 className="font-semibold mb-1">
              {menu.name}{" "}
              {pathname.includes("home") && `by ${menu?.providerName}`}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {menu.description}
            </p>
          </div>
          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
            <Star size={14} fill="#FFD700" color="#FFD700" />
            <span>
              {menu.rating} ({menu.userRatingCount} reviews)
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline">{menu.category}</Badge>
            <Badge variant={menu.isVegetarian ? "success" : "destructive"}>
              {menu.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
            </Badge>
            <Badge variant="secondary">{menu.weekType}</Badge>
            <Badge variant={menu.isAvailable ? "default" : "outline"}>
              {menu.isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>

          <Separator className="my-2" />

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-sm font-medium">
                <IndianRupee size={14} />
                <span>{menu.basePrice}</span>
                <span className="text-muted-foreground ml-1">per meal</span>
              </div>
              <div className="flex items-center gap-1  text-sm font-medium">
                <IndianRupee size={12} />
                <span>
                  {menu.monthlyPlanPrice}{" "}
                  <span className="text-muted-foreground ml-1">/ month</span>
                </span>
              </div>
            </div>

            <Button
              size="sm"
              className="bg-primary text-primary-foreground"
              onClick={() => router.push(`/new-menu-item/${menu._id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuItemHome;
