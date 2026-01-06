import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { Loader } from "@/components/feedback/loader";
import { useAuthContext } from "@/hooks/useAuthContext";
import { setCurrentUser } from "@/services/auth/Auth.service";
import instance from "@/services/Instance";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = useCallback(
    async (emailParam: string, passwordParam: string) => {
      setLoading(true);
      try {
        const response = await instance.post("/api/auth/login", {
          email: emailParam,
          password: passwordParam,
        });

        // Handle both backend response styles (snake_case vs camelCase/legacy) [file:3]
        const accessToken =
          response.data?.access_token ??
          response.data?.accesstoken ??
          response.data?.token;

        const refreshToken =
          response.data?.refresh_token ??
          response.data?.refreshtoken ??
          response.data?.refreshToken;

        if (!accessToken) {
          console.error("Login response data:", response.data);
          toast.error("Login failed: missing access token.");
          return;
        }

        setCurrentUser({
          token: accessToken,
          refreshToken: refreshToken ?? null,
          user: response.data?.user ?? null,
        });

        await authContext?.login({
          token: accessToken,
          refreshToken: refreshToken ?? null,
          user: response.data?.user ?? null,
        });

        toast.success("Login successful!");
        navigate("/dashboard");
      } catch (error) {
        console.error("Login failed:", error);
        toast.error("Login failed. Please check your credentials.");
      } finally {
        setLoading(false);
      }
    },
    [authContext, navigate]
  );

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) navigate("/dashboard");
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") onLogin(email, password);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [email, password, onLogin]);

  if (!authContext) return <div>Loading...</div>;
  if (loading) return <Loader />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

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
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
