import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, Typography } from "@mui/material";
import { HCButton, HCTextField, error, success } from "generic-components";
import { isEmail } from "../utils";

const PasswordReset: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const onSubmit = async () => {
    if (!email) {
      error({ message: "Please enter your email address" });
      return;
    }
    if (!isEmail(email)) {
      error({ message: "Please enter a valid email address" });
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
        success({
          message: "If the email exists, a password reset link has been sent.",
        });
      } else {
        error({
          message:
            data.detail ||
            "Failed to request password reset. Please try again.",
        });
      }
    } catch (err) {
      console.error("Error requesting password reset:", err);
      error({
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Box
        sx={{
          maxWidth: 500,
          mx: "auto",
          mt: 10,
          p: 2,
        }}
      >
        <Card sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Check Your Email
          </Typography>
          <Typography sx={{ mb: 2 }}>
            If an account exists with the email you provided, we&apos;ve sent
            instructions to reset your password.
          </Typography>
          <Box textAlign="center">
            <HCButton
              text="Return to Login"
              hcVariant="primary"
              onClick={() => navigate("/login")}
              sx={{ mt: 2, minWidth: 200 }}
            />
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 10,
        p: 2,
      }}
    >
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Reset Your Password
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Enter your email address and we&apos;ll send you instructions to reset
          your password.
        </Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <HCTextField
            id="reset-email"
            label="Email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            formControlSx={{ mb: 2 }}
          />
          <HCButton
            text={loading ? "Sending..." : "Request Password Reset"}
            hcVariant="primary"
            onClick={onSubmit}
            disabled={loading}
            sx={{ width: "100%" }}
          />
        </Box>
        <Box textAlign="center" mt={2}>
          <Typography
            variant="body2"
            sx={{ cursor: "pointer", color: "primary.main" }}
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default PasswordReset;
