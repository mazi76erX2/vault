import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox/checkbox";
import { TextField } from "@/components/forms";
import { Card } from "@/components/ui/card/card";
import { Label } from "@/components/ui/label/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import { useAuthContext } from "@/hooks/useAuthContext";
import Api from "@/services/Instance";
import { Loader } from "@/components/ui/loader/loader";

interface UserDTO {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  isActive: boolean;
}

interface DirectoryUserDTO {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

const OrganisationListPage: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showDirectoryBrowser, setShowDirectoryBrowser] = useState(false);
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUserDTO[]>([]);
  const [selectedDirectoryUsers, setSelectedDirectoryUsers] = useState<
    string[]
  >([]);

  if (authContext.isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // Form state for adding/editing user
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roles: [] as string[],
  });

  const availableRoles = ["Administrator", "Collector", "Helper", "Validator"];

  useEffect(() => {
    if (!authContext.isLoadingUser && authContext.isLoggedIn) {
      fetchUsers();
    }
  }, [authContext.isLoadingUser, authContext.isLoggedIn]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      if (authContext.isLoadingUser) {
        console.log("Auth still loading...");
        return;
      }

      const companyId = authContext?.user?.id;

      console.log("Company ID:", companyId);

      if (!companyId) {
        toast.error("No company ID found");
        return;
      }

      const response = await Api.get(`/api/users/company/${companyId}`);
      setUsers(response.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectoryUsers = async () => {
    try {
      setLoading(true);
      const companyId = authContext?.user?.id;
      const response = await Api.get(`/api/ldap/directory/users/${companyId}`);
      setDirectoryUsers(response.data || []);
      setShowDirectoryBrowser(true);
    } catch (err) {
      console.error("Error fetching directory users:", err);
      toast.error("Failed to fetch directory users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roles: [],
    });
    setShowAddUser(true);
  };

  const handleEditUser = (user: UserDTO) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      roles: user.roles || [],
    });
    setShowAddUser(true);
  };

  const handleSaveUser = async () => {
    try {
      setLoading(true);
      const companyId = authContext?.user?.id;

      if (selectedUser) {
        // Update existing user
        await Api.put(`/api/users/${selectedUser.id}`, {
          ...formData,
          companyId,
        });
        toast.success("User updated successfully");
      } else {
        // Create new user
        await Api.post("/api/users", {
          ...formData,
          companyId,
        });
        toast.success("User created successfully");
      }

      setShowAddUser(false);
      fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      toast.error("Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setLoading(true);
      await Api.delete(`/api/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleImportDirectoryUsers = async () => {
    try {
      setLoading(true);
      const companyId = authContext?.user?.id;

      await Api.post("/api/users/import-directory", {
        companyId,
        userIds: selectedDirectoryUsers,
      });

      toast.success("Users imported successfully");
      setShowDirectoryBrowser(false);
      setSelectedDirectoryUsers([]);
      fetchUsers();
    } catch (err) {
      console.error("Error importing users:", err);
      toast.error("Failed to import users");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const toggleDirectoryUser = (userId: string) => {
    setSelectedDirectoryUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-white/80 z-[1000] flex justify-center items-center">
          <Loader />
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto p-5">
        <div>
          <h2 className="text-2xl font-bold mb-5 text-center">
            USER MANAGEMENT
          </h2>

          {!showAddUser && !showDirectoryBrowser && (
            <>
              <div className="flex gap-3 mb-6 justify-end">
                <Button
                  onClick={fetchDirectoryUsers}
                  className="bg-[#e66334] hover:bg-[#FF8234]"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Add from Directory
                </Button>
                <Button
                  onClick={handleAddUser}
                  className="bg-[#e66334] hover:bg-[#FF8234]"
                >
                  Add User
                </Button>
              </div>

              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEditUser(user)}
                      >
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.roles.join(", ")}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user.id);
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}

          {showAddUser && (
            <Card className="p-6 bg-[#d3d3d3] max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">
                {selectedUser ? "Edit User" : "Add New User"}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      Email
                      <span className="text-red-500">*</span>
                    </Label>
                    <TextField
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
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
                        setFormData({
                          ...formData,
                          firstName: e.target.value,
                        })
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

                  <div className="col-span-2">
                    <Label className="font-bold">
                      Password
                      {!selectedUser && <span className="text-red-500">*</span>}
                    </Label>
                    <TextField
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={
                        selectedUser ? "Leave blank to keep current" : ""
                      }
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Roles</h4>
                  <div className="flex flex-wrap gap-4">
                    {availableRoles.map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={role}
                          checked={formData.roles.includes(role)}
                          onCheckedChange={() => toggleRole(role)}
                        />
                        <Label htmlFor={role}>{role}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddUser(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveUser}
                    className="bg-[#e66334] hover:bg-[#FF8234]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {showDirectoryBrowser && (
            <Card className="p-6 bg-[#d3d3d3] max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">
                Import from Directory
              </h3>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedDirectoryUsers.length ===
                            directoryUsers.length
                          }
                          onCheckedChange={(checked) => {
                            setSelectedDirectoryUsers(
                              checked ? directoryUsers.map((u) => u.id) : [],
                            );
                          }}
                        />
                      </TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {directoryUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedDirectoryUsers.includes(user.id)}
                            onCheckedChange={() => toggleDirectoryUser(user.id)}
                          />
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.displayName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDirectoryBrowser(false);
                    setSelectedDirectoryUsers([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportDirectoryUsers}
                  disabled={selectedDirectoryUsers.length === 0}
                  className="bg-[#e66334] hover:bg-[#FF8234]"
                >
                  Import Selected ({selectedDirectoryUsers.length})
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganisationListPage;
