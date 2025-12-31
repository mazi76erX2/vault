import React, { useState, useEffect } from "react";
import { styled, FormControlLabel, Checkbox, Box } from "@mui/material";
import {
  HCButton,
  HCTextField,
  HCLoader,
  success,
  error as showError,
} from "generic-components";
import { useAuthContext } from "../../hooks/useAuthContext";
import { VAULT_API_URL } from "../../config";
import { DancingBotGridComponent } from "../../components/DancingBotGridComponent";
import { LoaderContainer } from "../../components";
import {
  FormSection,
  FormBox,
  TabContainer,
  Tab,
} from "./OrganisationDetailsPage";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Container = styled("div")({
  width: "100%",
  margin: "0 auto",
  padding: "0 20px",
});

const Title = styled("h2")({
  marginBottom: "20px",
  fontWeight: "bold",
});

const Subtitle = styled("h3")({
  marginTop: "30px",
  marginBottom: "15px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
});

const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  gap: "20px",
  marginTop: "20px",
});

const FieldLabel = styled("div")({
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "5px",
  "&::after": {
    content: '"*"',
    color: "red",
    marginLeft: "2px",
  },
});

const InfoIcon = styled("span")({
  color: "#888",
  cursor: "pointer",
  fontSize: "18px",
  marginLeft: "5px",
});

interface DirectoryFormData {
  // Server Settings Tab
  directoryType: string;
  name: string;
  domain: string;
  host: string;
  port: string;
  username: string;
  password: string;
  syncInterval: string;
  searchTimeout: string;
  baseDN: string;
  userDN: string;
  groupDN: string;
  sslConnection: boolean;

  // User Schema Tab
  userObject: string;
  userFilter: string;
  userName: string;
  userObjectRDN: string;
  firstName: string;
  lastName: string;
  displayName: string;
  principalName: string;
  email: string;
  uniqueId: string;
  userGroups: string;

  // Group Schema Tab
  groupObject: string;
  groupFilter: string;
  fetchRecursively: boolean;
  groupUniqueId: string;
  groupName: string;
  groupDescription: string;
  groupMembers: string;
}

const UserDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"server" | "user" | "group">(
    "server"
  );
  const [loading, setLoading] = useState(false);
  const authContext = useAuthContext();

  const [formData, setFormData] = useState<DirectoryFormData>({
    // Server Settings
    directoryType: "Active Directory - Legacy",
    name: "-GROUP",
    domain: "-group",
    host: "ldaps://ldap-ssl.highcoordination.de",
    port: "636",
    username: "-group\\service",
    password: "••••••••••••••••••",
    syncInterval: "60",
    searchTimeout: "60",
    baseDN: "DC=-group, DC=local",
    userDN: "OU=-GROUP",
    groupDN: "OU=-GROUP",
    sslConnection: true,

    // User Schema
    userObject: "user",
    userFilter: "(&(objectCategory=Person)(sAMAccountName=*))",
    userName: "sAMAccountName",
    userObjectRDN: "cn",
    firstName: "givenName",
    lastName: "sn",
    displayName: "displayName",
    principalName: "userPrincipalName",
    email: "mail",
    uniqueId: "objectGUID",
    userGroups: "memberOf",

    // Group Schema
    groupObject: "group",
    groupFilter: "(&(objectCategory=Group)(name=*))",
    fetchRecursively: true,
    groupUniqueId: "objectGUID",
    groupName: "cn",
    groupDescription: "description",
    groupMembers: "member",
  });

  useEffect(() => {
    fetchDirectoryConfig();
  }, []);

  const fetchDirectoryConfig = async () => {
    try {
      setLoading(true);
      // Note: company_id property may not exist on UserDTO, using optional chaining
      const companyId = (authContext?.user?.user as any)?.company_id;
      if (!companyId) {
        console.warn("Company ID not available on user object");
        return;
      }
      const response = await axios.get(
        `${VAULT_API_URL}/api/ldap/directory/config/${companyId}`
      );

      if (response.data.exists) {
        setFormData(response.data);
      }
    } catch (err) {
      console.error("Error fetching directory config:", err);
      // Don't show error to user since configuration might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!authContext?.isLoggedIn) {
      showError("You must be logged in to continue");
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        user_id: authContext.user?.user.id,
      };

      await axios.post(
        `${VAULT_API_URL}/api/ldap/directory/config`,
        dataToSend
      );
      success("Directory configuration saved successfully");
      navigate(-1);
    } catch (err) {
      console.error("Error saving directory config:", err);
      showError("Failed to save directory configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${VAULT_API_URL}/api/ldap/directory/test-connection`,
        formData
      );

      if (response.data.error) {
        showError(response.data.error);
      } else {
        success(response.data.message || "Connection successful");
      }
    } catch (err) {
      console.error("Error testing connection:", err);
      showError("Failed to test connection");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDirectory = async () => {
    const companyId = (authContext?.user?.user as any)?.company_id;
    if (!companyId) {
      showError("Company ID not available");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${VAULT_API_URL}/api/ldap/directory/sync/${companyId}`
      );

      if (response.data.error) {
        showError(response.data.error);
      } else {
        success(response.data.message || "Directory synchronized successfully");
      }
    } catch (err) {
      console.error("Error syncing directory:", err);
      showError("Failed to synchronize directory");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container>
      {loading && (
        <LoaderContainer>
          <HCLoader />
        </LoaderContainer>
      )}
      <DancingBotGridComponent botState={"default"}>
        <Title>SETUP USER DIRECTORY SERVICE</Title>

        <HCTextField
          type="text"
          label="Directory Type"
          value={formData.directoryType}
          onChange={(e) =>
            setFormData({ ...formData, directoryType: e.target.value })
          }
          disabled
        />

        <TabContainer
          sx={{
            border: "1px solid #e66334",
            borderRadius: "4px 4px 0 0",
            backgroundColor: "#d3d3d3",
          }}
        >
          <Tab
            active={activeTab === "server"}
            onClick={() => setActiveTab("server")}
          >
            Server Settings
          </Tab>
          <Tab
            active={activeTab === "user"}
            onClick={() => setActiveTab("user")}
          >
            User Schema
          </Tab>
          <Tab
            active={activeTab === "group"}
            onClick={() => setActiveTab("group")}
          >
            Group Schema
          </Tab>
        </TabContainer>

        <FormSection>
          <FormBox>
            {activeTab === "server" && (
              <>
                <Subtitle>
                  Server Settings
                  <InfoIcon>ⓘ</InfoIcon>
                </Subtitle>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <Box>
                    <FieldLabel>Name</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Domain</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Domain"
                      value={formData.domain}
                      onChange={(e) =>
                        setFormData({ ...formData, domain: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Host</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Host"
                      value={formData.host}
                      onChange={(e) =>
                        setFormData({ ...formData, host: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Port</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Port"
                      value={formData.port}
                      onChange={(e) =>
                        setFormData({ ...formData, port: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Username</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Password</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Sync interval (in min)</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Sync Interval"
                      value={formData.syncInterval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          syncInterval: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Search timeout (in sec)</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Search Timeout"
                      value={formData.searchTimeout}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          searchTimeout: e.target.value,
                        })
                      }
                    />
                  </Box>
                </Box>

                <Subtitle>
                  LDAP schema
                  <InfoIcon>ⓘ</InfoIcon>
                </Subtitle>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <Box>
                    <FieldLabel>Base DN</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Base DN"
                      value={formData.baseDN}
                      onChange={(e) =>
                        setFormData({ ...formData, baseDN: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>User DN (optional)</FieldLabel>
                    <HCTextField
                      type="text"
                      label="User DN"
                      value={formData.userDN}
                      onChange={(e) =>
                        setFormData({ ...formData, userDN: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Group DN (optional)</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Group DN"
                      value={formData.groupDN}
                      onChange={(e) =>
                        setFormData({ ...formData, groupDN: e.target.value })
                      }
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.sslConnection}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sslConnection: e.target.checked,
                            })
                          }
                        />
                      }
                      label="SSL Connection?"
                    />
                  </Box>
                </Box>
              </>
            )}

            {activeTab === "user" && (
              <>
                <Subtitle>
                  User Schema
                  <InfoIcon>ⓘ</InfoIcon>
                </Subtitle>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <Box>
                    <FieldLabel>User Object</FieldLabel>
                    <HCTextField
                      type="text"
                      label="User Object"
                      value={formData.userObject}
                      onChange={(e) =>
                        setFormData({ ...formData, userObject: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>User Filter</FieldLabel>
                    <HCTextField
                      type="text"
                      label="User Filter"
                      value={formData.userFilter}
                      onChange={(e) =>
                        setFormData({ ...formData, userFilter: e.target.value })
                      }
                    />
                  </Box>
                </Box>

                <Subtitle>
                  User Schema : Attributes
                  <InfoIcon>ⓘ</InfoIcon>
                </Subtitle>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <Box>
                    <FieldLabel>USER NAME</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Username Attribute"
                      value={formData.userName}
                      onChange={(e) =>
                        setFormData({ ...formData, userName: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>User Object RDN</FieldLabel>
                    <HCTextField
                      type="text"
                      label="User Object RDN"
                      value={formData.userObjectRDN}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          userObjectRDN: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>First Name</FieldLabel>
                    <HCTextField
                      type="text"
                      label="First Name Attribute"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Last Name</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Last Name Attribute"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Display Name</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Display Name Attribute"
                      value={formData.displayName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayName: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Principal Name</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Principal Name Attribute"
                      value={formData.principalName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          principalName: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Email</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Email Attribute"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Unique ID</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Unique ID Attribute"
                      value={formData.uniqueId}
                      onChange={(e) =>
                        setFormData({ ...formData, uniqueId: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>User Groups</FieldLabel>
                    <HCTextField
                      type="text"
                      label="User Groups Attribute"
                      value={formData.userGroups}
                      onChange={(e) =>
                        setFormData({ ...formData, userGroups: e.target.value })
                      }
                    />
                  </Box>
                </Box>
              </>
            )}

            {activeTab === "group" && (
              <>
                <Subtitle>
                  Group Schema
                  <InfoIcon>ⓘ</InfoIcon>
                </Subtitle>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <Box>
                    <FieldLabel>Group Object</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Group Object"
                      value={formData.groupObject}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groupObject: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Group Filter</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Group Filter"
                      value={formData.groupFilter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groupFilter: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gridColumn: "1 / span 2",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.fetchRecursively}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fetchRecursively: e.target.checked,
                            })
                          }
                        />
                      }
                      label="Fetch group members recursively"
                    />
                  </Box>
                </Box>

                <Subtitle>
                  Group Schema Attributes
                  <InfoIcon>ⓘ</InfoIcon>
                </Subtitle>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <Box>
                    <FieldLabel>Unique ID</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Group Unique ID Attribute"
                      value={formData.groupUniqueId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groupUniqueId: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Name</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Group Name Attribute"
                      value={formData.groupName}
                      onChange={(e) =>
                        setFormData({ ...formData, groupName: e.target.value })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Description</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Group Description Attribute"
                      value={formData.groupDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groupDescription: e.target.value,
                        })
                      }
                    />
                  </Box>
                  <Box>
                    <FieldLabel>Members</FieldLabel>
                    <HCTextField
                      type="text"
                      label="Group Members Attribute"
                      value={formData.groupMembers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          groupMembers: e.target.value,
                        })
                      }
                    />
                  </Box>
                </Box>
              </>
            )}

            <ButtonContainer>
              <HCButton
                hcVariant="secondary"
                size="large"
                text="BACK"
                onClick={handleBack}
              />
              <HCButton
                hcVariant="secondary"
                size="large"
                text="TEST CONNECTION"
                onClick={handleTestConnection}
              />
              {(authContext?.user?.user as any)?.company_id && (
                <HCButton
                  hcVariant="secondary"
                  size="large"
                  text="SYNC NOW"
                  onClick={handleSyncDirectory}
                />
              )}
              <HCButton
                hcVariant="primary"
                size="large"
                text="SAVE"
                onClick={handleSave}
              />
            </ButtonContainer>
          </FormBox>
        </FormSection>
      </DancingBotGridComponent>
    </Container>
  );
};

export default UserDirectoryPage;
