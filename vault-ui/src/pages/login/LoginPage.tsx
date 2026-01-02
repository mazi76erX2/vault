import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { Loader } from "@/components/feedback/loader";
import { toast } from "sonner";
import { useAuthContext } from "@/hooks/useAuthContext";
import Api from "@/services/Instance";
import { AxiosError } from "axios";
import Logo from "@/assets/VAULT_LOGO_ORANGE_NEW.svg";
import Map from "@/assets/truechart_map.png";
import { User, Lock } from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authContext = useAuthContext();

  if (!authContext) {
    return <Loader />;
  }

  const { contextLogin, isLoadingUser, user } = authContext;

  const onLogin = async () => {
    if (!email || !password) {
      toast.error("Login details are required.");
      return;
    }

    try {
      const loginData = { email, password };
      await contextLogin(loginData);

      if (user && user.user && user.user.id) {
        try {
          const response = await Api.post("/api/auth/check-first-login", {
            userid: user.user.id,
          });

          if (response.data.require_password_change) {
            navigate("/password-reset");
            return;
          }
        } catch (err) {
          console.warn(
            "First-login check failed, proceeding to dashboard",
            err
          );
        }

        toast.success("Login successful.");
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      console.error("Login error occurred", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please check your credentials.";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        onLogin();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [email, password]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[44%_56%] h-screen">
      <div className="bg-gray-800 h-screen flex flex-col justify-center p-10 md:p-4 lg:p-10">
        <div className="flex justify-center mb-8">
          <img src={Logo} alt="Logo" className="w-[400px]" />
        </div>

        <h1 className="text-white text-2xl md:text-[25px] text-center mb-14 font-bold -mt-4">
          MANAGEMENT CONSOLE
        </h1>

        <h2 className="text-white text-2xl md:text-[25px] mb-8 font-bold">
          LOGIN
        </h2>

        <TextField
          id="email"
          type="text"
          label="EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-6 bg-transparent text-white"
          startIcon={<User className="w-5 h-5" />}
        />

        <TextField
          id="password"
          type="password"
          label="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 bg-transparent text-white"
          startIcon={<Lock className="w-5 h-5" />}
        />

        <Button
          className="mt-2 bg-[#e66334] hover:bg-[#FF8234]"
          onClick={onLogin}
          disabled={isLoadingUser}
          size="sm"
        >
          Login
        </Button>

        <span
          className="mt-2.5 text-white cursor-pointer"
          onClick={() => navigate("/password-reset")}
        >
          Forgot Password?
        </span>
      </div>

      <div className="hidden md:block h-screen">
        <img src={Map} alt="Map" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

export default LoginPage;
