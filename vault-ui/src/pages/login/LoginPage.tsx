import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { Loader } from "@/components/feedback/loader";
import { useAuthContext } from "@/hooks/useAuthContext";
import instance from "@/services/Instance";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async (emailParam: string, passwordParam: string) => {
    setLoading(true);
    try {
      const response = await instance.post("/api/auth/login", {
        email: emailParam,
        password: passwordParam,
      });

      if (response.data.access_token) {
        console.log("Login successful:", response.data);
        localStorage.setItem("token", response.data.access_token);
        await authContext?.login(response.data);
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Move BOTH useEffects BEFORE early return
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && authContext?.user) {
      navigate("/");
    }
  }, [navigate, authContext?.user]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        onLogin(email, password);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [email, password, onLogin]);

  // NOW the early return (after ALL hooks)
  if (!authContext) {
    return <div>Loading...</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign In</h2>
          <p className="mt-2 text-gray-600">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>

            <button
              type="button"
              className="cursor-pointer text-sm text-blue-600 hover:text-blue-500"
              onClick={() => navigate("/reset-password")}
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="cursor-pointer text-blue-600 hover:text-blue-500"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
