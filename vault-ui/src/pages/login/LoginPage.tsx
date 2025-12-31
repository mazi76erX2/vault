// LoginPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ThemeProvider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  HCButton,
  HCTextField,
  error,
  success,
  HCIcon,
  HCLoader,
} from "generic-components";
import Map from "../../assets/truechart_map.png";
import Logo from "../../assets/_VAULT_LOGO_ORANGE_NEW.svg";
import { PasswordInput } from "../../components/PasswordInput/PasswordInput";
import { useAuthContext } from "../../hooks/useAuthContext";
import Api from "../../services/Instance";
import { AxiosError } from "axios";
import { LoginRequestDTO } from "../../types/LoginResponseDTO";

function LoginPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const authContext = useAuthContext();

  // Handle case where context might be undefined during initial renders or if not wrapped properly
  if (!authContext) {
    // Optional: Render a loader or a specific message, or null
    return <HCLoader />; // Or return a more specific loading/error component
  }

  const { login: contextLogin, isLoadingUser, user } = authContext;

  const onLogin = async () => {
    if (!email || !password) {
      error({ message: "Login details are required." });
      return;
    }

    try {
      console.log("Login attempt starting...");
      console.log(
        "API URL:",
        process.env.NODE_ENV === "development"
          ? "Check config.ts"
          : "Production mode"
      );

      const loginData: LoginRequestDTO = { email, password };
      console.log("Calling contextLogin...");
      await contextLogin(loginData);
      console.log("contextLogin completed");

      // Use user data from context after login, which should be updated by the login process
      console.log("Checking user from context:", user);
      if (user && user.user && user.user.id) {
        console.log("User found in context, proceeding with first-login check");
        try {
          const response = await Api.post("/api/auth/check-first-login", {
            user_id: user.user.id,
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
          if (!(err instanceof AxiosError && err.response?.status === 401)) {
            // Handle other errors if needed
          }
        }
        success({ message: "Login successful." });
        window.location.href = "/dashboard";
      } else {
        // If context user is still not available after login, wait a bit and try getCurrentUser
        console.log(
          "User not found in context, waiting and checking localStorage..."
        );
        await new Promise((resolve) => setTimeout(resolve, 200));
        const currentUser = (
          await import("../../services/auth/Auth.service")
        ).getCurrentUser();

        console.log("User from localStorage:", currentUser);
        if (currentUser && currentUser.user && currentUser.user.id) {
          console.log(
            "User found in localStorage, proceeding with first-login check"
          );
          try {
            const response = await Api.post("/api/auth/check-first-login", {
              user_id: currentUser.user.id,
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
            if (!(err instanceof AxiosError && err.response?.status === 401)) {
              // Handle other errors if needed
            }
          }
          success({ message: "Login successful." });
          window.location.href = "/dashboard";
        } else {
          console.error(
            "No user data found anywhere. Context user:",
            user,
            "localStorage user:",
            currentUser
          );
          error({
            message:
              "Login process completed, but user data not found. Please try again.",
          });
        }
      }
    } catch (err) {
      console.error("Login error occurred:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please check your credentials.";
      error({ message: errorMessage });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password, contextLogin]); // Added contextLogin to dependencies

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isMobile ? "100%" : "44% 56%",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            background: "gray",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 10,
            [theme.breakpoints.down("md")]: { p: 2 },
            [theme.breakpoints.down("lg")]: { p: 4 },
          }}
        >
          <Box style={{ display: "flex", justifyContent: "center" }}>
            <img style={{ width: 400 }} src={Logo} alt={""} />
          </Box>
          <Typography
            sx={{
              color: "#fff",
              fontSize: isMobile ? 24 : 25,
              marginTop: "-16px",
              textAlign: "center",
              mb: "56.4px",
              fontWeight: "bold",
            }}
          >
            MANAGEMENT CONSOLE
          </Typography>
          <Typography
            sx={{
              color: "#fff",
              fontSize: isMobile ? 24 : 25,
              mb: "32px",
              fontWeight: "bold",
            }}
          >
            LOGIN
          </Typography>

          <HCTextField
            id="email"
            type="text"
            label="EMAIL"
            value={email}
            textColor="#fff"
            inputProps={{ startAdornment: <HCIcon icon="Profile" /> }}
            formControlSx={{ mb: "24px" }}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            id="password"
            type="text"
            label="PASSWORD"
            value={password}
            textColor="#fff"
            inputProps={{ startAdornment: <HCIcon icon="Lock" /> }}
            formControlSx={{ mb: "24px" }}
            onChange={(e) => setPassword(e.target.value)}
          />

          <HCButton
            sx={{
              mt: 2,
              background: "#e66334",
              ":hover": { background: "#FF8234" },
            }}
            text="Login"
            hcVariant="primary"
            size="small"
            onClick={onLogin}
            disabled={isLoadingUser}
          />

          <span
            style={{
              marginTop: "10px",
              color: "#FFF",
              cursor: "pointer",
            }}
            onClick={() => navigate("/password-reset")}
          >
            Forgot Password?
          </span>
        </Box>
        {!isMobile && (
          <Box sx={{ height: "100vh" }}>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              src={Map}
              alt="Map"
            />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default LoginPage;
