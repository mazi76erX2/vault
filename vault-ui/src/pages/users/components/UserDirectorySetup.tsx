import React, { useState } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/hooks/useAuthContext";
import Api from "@/services/Instance";

interface DirectoryFormData {
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
  groupObject: string;
  groupFilter: string;
  fetchRecursively: boolean;
  groupUniqueId: string;
  groupName: string;
  groupDescription: string;
  groupMembers: string;
}

interface UserDirectorySetupProps {
  onBack: () => void;
}

const UserDirectorySetup: React.FC<UserDirectorySetupProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"server" | "user" | "group">(
    "server",
  );
  const authContext = useAuthContext();

  const [formData, setFormData] = useState<DirectoryFormData>({
    directoryType: "Active Directory - Legacy",
    name: "HC-GROUP",
    domain: "hc-group",
    host: "ldaps://ldap-ssl.highcoordination.de",
    port: "636",
    username: "hc-group",
    password: "",
    syncInterval: "60",
    searchTimeout: "60",
    baseDN: "DC=hc-group,DC=local",
    userDN: "OU=HC-GROUP",
    groupDN: "OU=HC-GROUP",
    sslConnection: true,
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
    groupObject: "group",
    groupFilter: "(&(objectCategory=Group)(name=*))",
    fetchRecursively: true,
    groupUniqueId: "objectGUID",
    groupName: "cn",
    groupDescription: "description",
    groupMembers: "member",
  });

  const handleSave = async () => {
    try {
      const userId = authContext?.user?.user?.id;
      await Api.post("/api/ldap/directoryconfig", {
        userid: userId,
        ...formData,
      });
      toast.success("Directory configuration saved successfully");
    } catch (err) {
      console.error("Error saving directory config:", err);
      toast.error("Failed to save directory configuration");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">SETUP USER DIRECTORY SERVICE</h2>

      <TextField
        label="Directory Type"
        value={formData.directoryType}
        onChange={(e) =>
          setFormData({ ...formData, directoryType: e.target.value })
        }
        disabled
      />

      {/* Tabs */}
      <div className="flex gap-0.5 border border-[#e66334] rounded-t bg-[#d3d3d3]">
        <button type="button"
          className={`px-5 py-2.5 cursor-pointer rounded-t transition-colors ${
            activeTab === "server"
              ? "bg-[#e66334] text-white"
              : "bg-[#d3d3d3] text-black hover:bg-[#c3c3c3]"
          }`}
          onClick={() => setActiveTab("server")}
        >
          Server Settings
        </button>
        <button type="button"
          className={`px-5 py-2.5 cursor-pointer rounded-t transition-colors ${
            activeTab === "user"
              ? "bg-[#e66334] text-white"
              : "bg-[#d3d3d3] text-black hover:bg-[#c3c3c3]"
          }`}
          onClick={() => setActiveTab("user")}
        >
          User Schema
        </button>
        <button type="button"
          className={`px-5 py-2.5 cursor-pointer rounded-t transition-colors ${
            activeTab === "group"
              ? "bg-[#e66334] text-white"
              : "bg-[#d3d3d3] text-black hover:bg-[#c3c3c3]"
          }`}
          onClick={() => setActiveTab("group")}
        >
          Group Schema
        </button>
      </div>

      <Card className="bg-[#d3d3d3] p-6">
        {activeTab === "server" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Server Settings</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">
                  Name
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Domain
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Host
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.host}
                  onChange={(e) =>
                    setFormData({ ...formData, host: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Port
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.port}
                  onChange={(e) =>
                    setFormData({ ...formData, port: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Username
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Password
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Sync interval (in min)
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.syncInterval}
                  onChange={(e) =>
                    setFormData({ ...formData, syncInterval: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Search timeout (in sec)
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.searchTimeout}
                  onChange={(e) =>
                    setFormData({ ...formData, searchTimeout: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <h3 className="text-lg font-semibold">LDAP Schema</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">
                  Base DN
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.baseDN}
                  onChange={(e) =>
                    setFormData({ ...formData, baseDN: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">User DN (optional)</Label>
                <TextField
                  value={formData.userDN}
                  onChange={(e) =>
                    setFormData({ ...formData, userDN: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">Group DN (optional)</Label>
                <TextField
                  value={formData.groupDN}
                  onChange={(e) =>
                    setFormData({ ...formData, groupDN: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sslConnection"
                  checked={formData.sslConnection}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      sslConnection: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="sslConnection">SSL Connection?</Label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "user" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">User Schema</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">
                  User Object
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.userObject}
                  onChange={(e) =>
                    setFormData({ ...formData, userObject: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  User Filter
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.userFilter}
                  onChange={(e) =>
                    setFormData({ ...formData, userFilter: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <h3 className="text-lg font-semibold">User Schema Attributes</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">
                  User Name
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData({ ...formData, userName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  User Object RDN
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.userObjectRDN}
                  onChange={(e) =>
                    setFormData({ ...formData, userObjectRDN: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  First Name
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Last Name
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Display Name
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Principal Name
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.principalName}
                  onChange={(e) =>
                    setFormData({ ...formData, principalName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Email
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Unique ID
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.uniqueId}
                  onChange={(e) =>
                    setFormData({ ...formData, uniqueId: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  User Groups
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.userGroups}
                  onChange={(e) =>
                    setFormData({ ...formData, userGroups: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "group" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Group Schema</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">
                  Group Object
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.groupObject}
                  onChange={(e) =>
                    setFormData({ ...formData, groupObject: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Group Filter
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.groupFilter}
                  onChange={(e) =>
                    setFormData({ ...formData, groupFilter: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2 flex items-center space-x-2">
                <Checkbox
                  id="fetchRecursively"
                  checked={formData.fetchRecursively}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      fetchRecursively: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="fetchRecursively">
                  Fetch group members recursively
                </Label>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <h3 className="text-lg font-semibold">Group Schema Attributes</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-bold">
                  Unique ID
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.groupUniqueId}
                  onChange={(e) =>
                    setFormData({ ...formData, groupUniqueId: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Name
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.groupName}
                  onChange={(e) =>
                    setFormData({ ...formData, groupName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Description
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.groupDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      groupDescription: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label className="font-bold">
                  Members
                  <span className="text-red-500">*</span>
                </Label>
                <TextField
                  value={formData.groupMembers}
                  onChange={(e) =>
                    setFormData({ ...formData, groupMembers: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-center gap-5 mt-8">
        <Button variant="outline" size="lg" onClick={onBack}>
          BACK
        </Button>
        <Button
          size="lg"
          onClick={handleSave}
          className="bg-[#e66334] hover:bg-[#FF8234]"
        >
          SAVE
        </Button>
      </div>
    </div>
  );
};

export default UserDirectorySetup;
