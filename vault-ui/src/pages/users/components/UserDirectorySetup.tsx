import React, { useState, useEffect } from "react";
import { Box, Checkbox, FormControlLabel } from "@mui/material";
import {
  HCTextField,
  HCButton,
  success,
  error as showError,
} from "generic-components";
import { useAuthContext } from "../../../hooks/useAuthContext";
import axios from "axios";
import { VAULT_API_URL } from "../../../config";
import { DirectoryFormData } from "../types";
import {
  FormSection,
  FormBox,
  TabContainer,
  Tab,
} from "../OrganisationDetailsPage";
import {
  Title,
  Subtitle,
  FieldLabel,
  InfoIconText,
  ButtonContainer,
} from "../styles";

interface UserDirectorySetupProps {
  onBack: () => void;
}

const UserDirectorySetup: React.FC<UserDirectorySetupProps> = ({ onBack }) => {
  const [activeDirectoryTab, setActiveDirectoryTab] = useState<
    "server" | "user" | "group"
  >("server");
  const authContext = useAuthContext();

  // Directory form data state
  const [directoryFormData, setDirectoryFormData] = useState<DirectoryFormData>(
    {
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
    }
  );

  const handleSaveDirectoryConfig = async () => {
    if (!authContext?.isLoggedIn) {
      showError("You must be logged in to continue");
      return;
    }

    try {
      const dataToSend = {
        ...directoryFormData,
        user_id: authContext.user?.user.id,
      };

      await axios.post(
        `${VAULT_API_URL}/api/ldap/directory/config`,
        dataToSend
      );
      success("Directory configuration saved successfully");
    } catch (err) {
      console.error("Error saving directory config:", err);
      showError("Failed to save directory configuration");
    }
  };

  return (
    <>
      <Title>SETUP USER DIRECTORY SERVICE</Title>

      <HCTextField
        type="text"
        label="Directory Type"
        value={directoryFormData.directoryType}
        onChange={(e) =>
          setDirectoryFormData({
            ...directoryFormData,
            directoryType: e.target.value,
          })
        }
        disabled
      />

      <TabContainer sx={{ borderBottom: "1px solid #e66334" }}>
        <Tab
          active={activeDirectoryTab === "server"}
          onClick={() => setActiveDirectoryTab("server")}
        >
          Server Settings
        </Tab>
        <Tab
          active={activeDirectoryTab === "user"}
          onClick={() => setActiveDirectoryTab("user")}
        >
          User Schema
        </Tab>
        <Tab
          active={activeDirectoryTab === "group"}
          onClick={() => setActiveDirectoryTab("group")}
        >
          Group Schema
        </Tab>
      </TabContainer>

      {activeDirectoryTab === "server" && (
        <>
          <Subtitle>
            Server Settings
            <InfoIconText>ⓘ</InfoIconText>
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
                value={directoryFormData.name}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    name: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Domain</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.domain}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    domain: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Host</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.host}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    host: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Port</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.port}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    port: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Username</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.username}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    username: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Password</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.password}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    password: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Sync interval (in min)</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.syncInterval}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    syncInterval: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Search timeout (in sec)</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.searchTimeout}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    searchTimeout: e.target.value,
                  })
                }
              />
            </Box>
          </Box>

          <Subtitle>
            LDAP schema
            <InfoIconText>ⓘ</InfoIconText>
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
                value={directoryFormData.baseDN}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    baseDN: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>User DN (optional)</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.userDN}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    userDN: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Group DN (optional)</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.groupDN}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    groupDN: e.target.value,
                  })
                }
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="sslConnection"
                    checked={directoryFormData.sslConnection}
                    onChange={(e) =>
                      setDirectoryFormData({
                        ...directoryFormData,
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

      {activeDirectoryTab === "user" && (
        <>
          <Subtitle>
            User Schema
            <InfoIconText>ⓘ</InfoIconText>
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
                value={directoryFormData.userObject}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    userObject: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>User Filter</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.userFilter}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    userFilter: e.target.value,
                  })
                }
              />
            </Box>
          </Box>

          <Subtitle>
            User Schema : Attributes
            <InfoIconText>ⓘ</InfoIconText>
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
                value={directoryFormData.userName}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    userName: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>User Object RDN</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.userObjectRDN}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    userObjectRDN: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>First Name</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.firstName}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    firstName: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Last Name</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.lastName}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    lastName: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Display Name</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.displayName}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    displayName: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Principal Name</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.principalName}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    principalName: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Email</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.email}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    email: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Unique ID</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.uniqueId}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    uniqueId: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>User Groups</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.userGroups}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    userGroups: e.target.value,
                  })
                }
              />
            </Box>
          </Box>
        </>
      )}

      {activeDirectoryTab === "group" && (
        <>
          <Subtitle>
            Group Schema
            <InfoIconText>ⓘ</InfoIconText>
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
                value={directoryFormData.groupObject}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    groupObject: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Group Filter</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.groupFilter}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
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
                    name="fetchRecursively"
                    checked={directoryFormData.fetchRecursively}
                    onChange={(e) =>
                      setDirectoryFormData({
                        ...directoryFormData,
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
            Group Schema
            <InfoIconText>ⓘ</InfoIconText>
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
                value={directoryFormData.groupUniqueId}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    groupUniqueId: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Name</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.groupName}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    groupName: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Description</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.groupDescription}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
                    groupDescription: e.target.value,
                  })
                }
              />
            </Box>
            <Box>
              <FieldLabel>Members</FieldLabel>
              <HCTextField
                type="text"
                value={directoryFormData.groupMembers}
                onChange={(e) =>
                  setDirectoryFormData({
                    ...directoryFormData,
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
          sx={{ mt: 2 }}
          hcVariant="secondary"
          size="large"
          text="BACK"
          onClick={onBack}
        />
        <HCButton
          sx={{
            mt: 2,
            background: "#e66334",
            ":hover": { background: "#FF8234" },
          }}
          hcVariant="primary"
          size="large"
          text="SAVE"
          onClick={handleSaveDirectoryConfig}
        />
      </ButtonContainer>
    </>
  );
};

export default UserDirectorySetup;
