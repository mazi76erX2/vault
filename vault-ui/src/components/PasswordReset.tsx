import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isEmail } from "../utils";

const PasswordReset: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    if (!isEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        toast.success(
          "If the email exists, a password reset link has been sent.",
        );
      } else {
        toast.error(
          data.detail || "Failed to request password reset. Please try again.",
        );
      }
    } catch (err) {
      console.error("Error requesting password reset:", err);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-24 p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              If an account exists with the email you provided, we've sent
              instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full mt-4" onClick={() => navigate("/login")}>
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you instructions to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block text-sm font-medium mb-1"
              >
                Email
              </label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Request Password Reset"}
            </Button>
          </form>
          <div className="text-center mt-6">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;
