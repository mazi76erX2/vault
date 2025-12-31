import React from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material";
import { DancingBotGridComponent } from "../../../components/DancingBotGridComponent";
import { HeaderContainer, WelcomeText } from "../../../components";

const Container = styled("div")({});

const ActionContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  justifyContent: "center",
});

const ActionCard = styled("div")({
  backgroundColor: "#d3d3d3",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  flex: 1,
  textAlign: "center",
  cursor: "pointer",
  transition: "transform 0.2s",
  width: "500px",
  margin: "0 auto",
});

const CollectorMainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      {/* Right Part (Welcome & Action Cards) */}
      <DancingBotGridComponent botState={"greeting"}>
        {/* Welcome Header */}
        <HeaderContainer>
          <WelcomeText>
            Welcome to <br /> Vault Collector Chat.
          </WelcomeText>
        </HeaderContainer>

        {/* Action Cards */}
        <ActionContainer>
          <ActionCard
            onClick={() =>
              navigate("/applications/collector/CollectorResumePage")
            }
          >
            <h3>
              Continue <br /> an existing session
            </h3>
            <p>Click here to select one of your unfinished interviews.</p>
          </ActionCard>

          <ActionCard
            onClick={() =>
              navigate("/applications/collector/CollectorStartPage")
            }
          >
            <h3>
              Start <br /> a new session
            </h3>
            <p>Click here to start a new interview.</p>
          </ActionCard>

          <ActionCard
            onClick={() =>
              navigate("/applications/collector/CollectorDocumentsStatusPage")
            }
          >
            <h3>Previous sessions</h3>
            <p>Click here to view the status of previous sessions.</p>
          </ActionCard>
        </ActionContainer>
      </DancingBotGridComponent>
    </Container>
  );
};

export default CollectorMainPage;
