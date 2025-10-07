import { ArrowLeft, Bell, User } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = ({
  heading,
  showback,
}: {
  heading: string;
  showback?: boolean;
}) => {
  const router = useRouter();
  return (
    <div className="px-4 py-3 bg-[#ff1f01] text-white flex items-center justify-between shadow-md">
      <div style={{ display: "flex", alignItems: "center" }}>
        {showback && (
          <ArrowLeft
            size={20}
            style={{ marginRight: "12px", cursor: "pointer" }}
          />
        )}
        <h1 style={{ fontSize: "18px", margin: 0 }}>{heading}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Bell
          size={20}
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/notifications")}
        />
        <User size={20} style={{ cursor: "pointer" }} />
      </div>
    </div>
  );
};

export default Header;
