import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { CheckBox } from "@/components/forms/checkbox";
import { Loader } from "@/components/feedback/loader";
import { Card } from "@/components/ui/card";
import { SegmentTabs } from "@/components/layout/segment-tabs";
import { useAuthContext } from "@/hooks/useAuthContext";
import Api from "@/services/Instance";

interface UserData {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  isAdmin: boolean;
  isCollector: boolean;
  isHelper: boolean;
  isValidator: boolean;
  isExpert: boolean;
}

const UserDirectoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authContext = useAuthContext();

  const [userData, setUserData] = useState<UserData>({
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    isAdmin: false,
    isCollector: false,
    isHelper: false,
    isValidator: false,
    isExpert: false,
  });

  const tabs = [
    { label: "Create User", value: 0 },
    { label: "Import Users", value: 1 },
  ];

  const handleInputChange = (
    field: keyof UserData,
    value: string | boolean,
  ) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !userData.email ||
      !userData.firstname ||
      !userData.lastname ||
      !userData.password
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (
      !userData.isAdmin &&
      !userData.isCollector &&
      !userData.isHelper &&
      !userData.isValidator &&
      !userData.isExpert
    ) {
      toast.error("Please select at least one role for the user.");
      return;
    }

    try {
      setLoading(true);
      const userId = authContext?.user?.id;

      const roles: string[] = [];
      if (userData.isAdmin) roles.push("Administrator");
      if (userData.isCollector) roles.push("Collector");
      if (userData.isHelper) roles.push("Helper");
      if (userData.isValidator) roles.push("Validator");
      if (userData.isExpert) roles.push("Expert");

      await Api.post("/api/v1/admin/createuser", {
        userid: userId,
        email: userData.email,
        firstname: userData.firstname,
        lastname: userData.lastname,
        password: userData.password,
        roles,
      });

      toast.success("User created successfully.");

      // Reset form
      setUserData({
        email: "",
        firstname: "",
        lastname: "",
        password: "",
        isAdmin: false,
        isCollector: false,
        isHelper: false,
        isValidator: false,
        isExpert: false,
      });
    } catch (err) {
      console.error("Error creating user:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        const message =
          err instanceof AxiosError && err.response?.data?.detail
            ? err.response.data.detail
            : "Failed to create user.";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-white/80 z-[1000] flex justify-center items-center">
          <Loader />
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        <div>
          <h1 className="text-2xl font-bold mb-6 text-center">
            User Directory
          </h1>

          <SegmentTabs
            tabs={tabs}
            value={activeTab}
            onChange={setActiveTab}
            className="mb-6"
          />

          {activeTab === 0 && (
            <form onSubmit={handleSubmit}>
              <Card className="bg-[#d3d3d3] p-6 shadow-md space-y-6">
                <TextField
                  label="Email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="user@example.com"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="First Name"
                    value={userData.firstname}
                    onChange={(e) =>
                      handleInputChange("firstname", e.target.value)
                    }
                    required
                  />

                  <TextField
                    label="Last Name"
                    value={userData.lastname}
                    onChange={(e) =>
                      handleInputChange("lastname", e.target.value)
                    }
                    required
                  />
                </div>

                <TextField
                  label="Password"
                  type="password"
                  value={userData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Minimum 8 characters"
                  required
                />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Roles</h3>
                  <div className="space-y-2">
                    <CheckBox
                      label="Administrator"
                      checked={userData.isAdmin}
                      onChange={(checked) =>
                        handleInputChange("isAdmin", checked)
                      }
                    />
                    <CheckBox
                      label="Collector"
                      checked={userData.isCollector}
                      onChange={(checked) =>
                        handleInputChange("isCollector", checked)
                      }
                    />
                    <CheckBox
                      label="Helper"
                      checked={userData.isHelper}
                      onChange={(checked) =>
                        handleInputChange("isHelper", checked)
                      }
                    />
                    <CheckBox
                      label="Validator"
                      checked={userData.isValidator}
                      onChange={(checked) =>
                        handleInputChange("isValidator", checked)
                      }
                    />
                    <CheckBox
                      label="Expert"
                      checked={userData.isExpert}
                      onChange={(checked) =>
                        handleInputChange("isExpert", checked)
                      }
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCancel}
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#e66334] hover:bg-[#FF8234]"
                  size="lg"
                >
                  Create User
                </Button>
              </div>
            </form>
          )}

          {activeTab === 1 && (
            <Card className="bg-[#d3d3d3] p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Import Users from CSV
              </h3>
              <p className="text-gray-600 mb-4">
                Upload a CSV file to import multiple users at once.
              </p>
              <input type="file" accept=".csv" className="mb-4" />
              <div className="flex justify-end">
                <Button className="bg-[#e66334] hover:bg-[#FF8234]" size="lg">
                  Import
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDirectoryPage;
