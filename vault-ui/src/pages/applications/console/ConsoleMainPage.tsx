import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { VAULT_API_URL } from "../../../config";
import { HCLoader } from "generic-components";
import { LoginResponseDTO } from "../../../types/LoginResponseDTO";
import { DancingBotGridComponent } from "../../../components/DancingBotGridComponent";
import {
  HeaderContainer,
  LoaderContainer,
  WelcomeText,
} from "../../../components";
import { Box, Typography } from "@mui/material";

const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: "100vh",
  backgroundColor: "#f5f5f5",
  padding: "20px",
}));

const Subtitle = styled("h3")({
  fontSize: "16px",
  margin: "10px 0 5px 0",
  textAlign: "center",
});

const CardContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  margin: "10px 0",
  width: "100%",
  maxWidth: "600px",
});

const ActionContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  justifyContent: "center",
  alignItems: "center",
});

const ActionCard = styled("div")({
  backgroundColor: "#d3d3d3",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
  width: "100%",
  maxWidth: "500px",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  },
});

const ContentWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  gap: "20px",
});

const ConsoleMainPage: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useAuthContext();
  const [loading, setLoading] = useState(false);

  // We store the boolean from the table
  const [isValidator, setIsValidator] = useState<boolean | null>(null);
  const [isExpert, setIsExpert] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authContext?.user || authContext?.isLoadingUser) return;

    const loadUserInfo = async () => {
      try {
        const response = await fetch(
          `${VAULT_API_URL}/api/console-main/user-info/${authContext.user?.user.id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.statusText}`);
        }

        const userInfo = await response.json();
        setIsValidator(userInfo.is_validator);
        setIsExpert(userInfo.is_expert);
      } catch (error) {
        console.error("Error fetching user info from the Python API: " + error);
      }
    };
    setLoading(false);

    loadUserInfo();
  }, [authContext?.user, authContext?.isLoadingUser]);

  return (
    <Container>
      {loading && (
        <LoaderContainer>
          <HCLoader />
        </LoaderContainer>
      )}

      <DancingBotGridComponent botState={"greeting"}>
        <ContentWrapper>
          <HeaderContainer style={{ textAlign: "center" }}>
            <WelcomeText>
              Welcome to
              <br /> Vault Validator!
            </WelcomeText>
          </HeaderContainer>

          {isValidator === true && (
            <CardContainer>
              <Subtitle>Validator</Subtitle>
              <ActionContainer>
                <ActionCard
                  onClick={() =>
                    navigate("/applications/console/ValidatorStartPage")
                  }
                >
                  <h3>Validator Packages</h3>
                  <p>Review Data packages from the Collector.</p>
                </ActionCard>

                <ActionCard
                  onClick={() =>
                    navigate(
                      "/applications/console/ValidatorStartExpertReviewPage"
                    )
                  }
                >
                  <h3>
                    Collector
                    <br />
                    Packages in Expert review
                  </h3>
                  <p>List of Data packages sent for review by Experts.</p>
                </ActionCard>

                <ActionCard
                  onClick={() =>
                    navigate(
                      "/applications/console/ValidatorStartCompletedPage"
                    )
                  }
                >
                  <h3>
                    Validator
                    <br />
                    completed Packages
                  </h3>
                  <p>Review completed Data packages from the Collector.</p>
                </ActionCard>
              </ActionContainer>
            </CardContainer>
          )}

          {isExpert === true && (
            <CardContainer>
              <Subtitle>Expert</Subtitle>
              <ActionContainer>
                <ActionCard
                  onClick={() =>
                    navigate("/applications/console/ExpertStartPage")
                  }
                >
                  <h3>Reviews Pending</h3>
                  <p>
                    List of Data packages you have been selected to review as an
                    Expert on the matter.
                  </p>
                </ActionCard>

                <ActionCard
                  onClick={() =>
                    navigate("/applications/console/ExpertPreviousReviewsPage")
                  }
                >
                  <h3>Previous Reviews</h3>
                  <p>List of finalized Data packages.</p>
                </ActionCard>
              </ActionContainer>
            </CardContainer>
          )}
        </ContentWrapper>
      </DancingBotGridComponent>
    </Container>
  );
};

export default ConsoleMainPage;
