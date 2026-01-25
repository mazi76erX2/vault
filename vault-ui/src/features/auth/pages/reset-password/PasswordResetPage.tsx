import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { TextField } from "@/components/forms";
import Logo from "@/assets/VAULT_LOGO_ORANGE_NEW.svg";
import Map from "@/assets/truechart_map.png";

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isOnResetRequest, setIsOnResetRequest] = useState(true);
  const [buttonText, setButtonText] = useState("REQUEST PASSWORD RESET");
  const [queryKey, setQueryKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/password-reset-request", { email });
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error("Failed to send password reset link");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!email || !password || !passwordConfirmation) {
      toast.error("All fields are required");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/password-reset", {
        email,
        key: queryKey,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success("Password updated successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const key = searchParams.get("key");
    const emailValue = searchParams.get("email");

    if (key && emailValue) {
      setIsOnResetRequest(false);
      setButtonText("UPDATE PASSWORD");
      setQueryKey(key);
      setEmail(emailValue);
    } else {
      setIsOnResetRequest(true);
      setButtonText("REQUEST PASSWORD RESET");
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[44%_56%] h-screen">
      <div className="bg-tertiary h-screen flex flex-col justify-center p-10 md:p-4 lg:p-10">
        <div className="flex justify-center mb-8">
          <img src={Logo} alt="Logo" className="w-[400px]" />
        </div>

        <h1 className="text-tertiary-foreground text-2xl md:text-[25px] text-center mb-14 font-bold -mt-4">
          MANAGEMENT CONSOLE
        </h1>

        <h2 className="text-tertiary-foreground text-2xl md:text-[25px] mb-8 font-bold">
          PASSWORD RESET
        </h2>

        <TextField
          id="email"
          type="text"
          label="EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-6"
          startIcon={<User className="w-5 h-5" />}
          disabled={!isOnResetRequest}
        />

        {!isOnResetRequest && (
          <>
            <TextField
              id="password"
              type="password"
              label="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-6"
              startIcon={<Lock className="w-5 h-5" />}
            />

            <TextField
              id="password-confirm"
              type="password"
              label="CONFIRM PASSWORD"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="mb-6"
              startIcon={<Lock className="w-5 h-5" />}
            />
          </>
        )}

        <Button
          className="mt-2"
          onClick={isOnResetRequest ? handleResetRequest : handlePasswordUpdate}
          disabled={loading}
          size="sm"
        >
          {loading ? "Please wait..." : buttonText}
        </Button>

        <span
          className="mt-2.5 text-tertiary-foreground cursor-pointer hover:underline"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </span>
      </div>

      <div className="hidden md:block h-screen">
        <img src={Map} alt="Map" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default PasswordResetPage;
