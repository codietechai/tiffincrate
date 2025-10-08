"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChefHat, Mail, Lock, Apple, Eye, EyeOff } from "lucide-react";
import { AuthService } from "@/services/authService";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit: SubmitHandler<LoginFormValues> = async (payload) => {
    setServerError("");
    setLoading(true);

    try {
      const { user } = await AuthService.signin(payload);

      switch (user.role) {
        case "admin":
          router.push("/dashboard/admin");
          break;
        case "provider":
          router.push("/dashboard/provider");
          break;
        case "consumer":
          router.push("/dashboard/consumer");
          break;
        case "delivery_partner":
          router.push("/dashboard/delivery");
          break;
        default:
          router.push("/");
      }
    } catch (err: any) {
      setServerError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 shadow-xl rounded-lg overflow-hidden">
        {/* Left promotional panel (visible on mobile, stacked above form) */}
        <div className="flex flex-col justify-center items-center md:items-start p-8 md:p-12 bg-gradient-to-tr from-red-500 to-red-400 text-white">
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="h-10 w-10 text-white/95" />
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">
                TiffinCrate
              </h2>
              <p className="text-xs md:text-sm opacity-90">
                Delicious meals delivered daily
              </p>
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-bold mb-2 text-center md:text-left">
            Welcome back
          </h3>
          <p className="md:max-w-xs text-sm mb-4 text-center md:text-left opacity-90">
            Manage orders, menus and deliveries — all from your dashboard. Sign
            in to continue.
          </p>

          <ul className="space-y-3 mt-4 w-full md:w-auto">
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                🍽️
              </div>
              <div>
                <div className="text-sm font-medium">Fresh daily menus</div>
                <div className="text-xs opacity-90">Curated by top chefs</div>
              </div>
            </li>
            <li className="flex items-center gap-3 justify-center md:justify-start">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                🚚
              </div>
              <div>
                <div className="text-sm font-medium">Fast delivery</div>
                <div className="text-xs opacity-90">On-time, always</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Right form panel */}
        <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <ChefHat className="h-10 w-10 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold">Sign in to TiffinCrate</h1>
                <p className="text-sm text-gray-500">
                  Enter your account details below
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10"
                    {...register("email", { required: "Email is required" })}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    className="pl-10 pr-10"
                    {...register("password", {
                      required: "Password is required",
                    })}
                  />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>

                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="#"
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex-1 h-px bg-gray-200" />
                <span>or</span>
                <span className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="flex flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center"
                  aria-label="Sign in with Google"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M30.0014 16.3109C30.0014 15.1598 29.9061 14.3198 29.6998 13.4487H16.2871V18.6442H24.1601C24.0014 19.9354 23.1442 21.8798 21.2394 23.1864L21.2127 23.3604L25.4536 26.58L25.7474 26.6087C28.4458 24.1665 30.0014 20.5731 30.0014 16.3109Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M16.2863 29.9998C20.1434 29.9998 23.3814 28.7553 25.7466 26.6086L21.2386 23.1863C20.0323 24.0108 18.4132 24.5863 16.2863 24.5863C12.5086 24.5863 9.30225 22.1441 8.15929 18.7686L7.99176 18.7825L3.58208 22.127L3.52441 22.2841C5.87359 26.8574 10.699 29.9998 16.2863 29.9998Z"
                      fill="#34A853"
                    />
                    <path
                      d="M8.15964 18.769C7.85806 17.8979 7.68352 16.9645 7.68352 16.0001C7.68352 15.0356 7.85806 14.1023 8.14377 13.2312L8.13578 13.0456L3.67083 9.64746L3.52475 9.71556C2.55654 11.6134 2.00098 13.7445 2.00098 16.0001C2.00098 18.2556 2.55654 20.3867 3.52475 22.2845L8.15964 18.769Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M16.2864 7.4133C18.9689 7.4133 20.7784 8.54885 21.8102 9.4978L25.8419 5.64C23.3658 3.38445 20.1435 2 16.2864 2C10.699 2 5.8736 5.1422 3.52441 9.71549L8.14345 13.2311C9.30229 9.85555 12.5086 7.4133 16.2864 7.4133Z"
                      fill="#EB4335"
                    />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center"
                  aria-label="Sign in with Apple"
                >
                  <svg
                    fill="#000000"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                  </svg>
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600 mt-2">
                New to TiffinCrate?{" "}
                <Link
                  href="/auth/register"
                  className="text-red-500 font-medium"
                >
                  Create an account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
