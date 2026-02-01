"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CronScheduler from "@/components/admin/cron-scheduler";
import { LoadingPage } from "@/components/ui/loading";

export default function AdminCronPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch("/api/auth/me");
            if (response.ok) {
                const data = await response.json();
                if (data.data.role !== "admin") {
                    router.push("/");
                    return;
                }
                setUser(data.data);
            } else {
                router.push("/auth/login");
            }
        } catch (error) {
            console.error("Auth check error:", error);
            router.push("/auth/login");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingPage />;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <CronScheduler />
            </div>
        </div>
    );
}