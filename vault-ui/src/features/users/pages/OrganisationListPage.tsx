import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, Save, X, Plus, Trash2, Search, ArrowLeft } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/ThemeContext";

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
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showDirectoryBrowser, setShowDirectoryBrowser] = useState(false);
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUserDTO[]>([]);
  const [selectedDirectoryUsers, setSelectedDirectoryUsers] = useState<
    string[]
  >([]);

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
        return;
      }

      // FIX: Use company_id instead of user.id
      const companyId = authContext?.user?.company_id;

      if (!companyId) {
        toast.error("No company ID found");
        return;
      }

      const response = await Api.get(`/api/users/company/${companyId}`);
      setUsers(response.data.users || response.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      // toast already handled by Api instance
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectoryUsers = async () => {
    try {
      setLoading(true);
      const companyId = authContext?.user?.company_id;
      const response = await Api.get(`/api/ldap/directory/users/${companyId}`);
      setDirectoryUsers(response.data || []);
      setShowDirectoryBrowser(true);
    } catch (err) {
      console.error("Error fetching directory users:", err);
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
      const companyId = authContext?.user?.company_id;

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
    } finally {
      setLoading(false);
    }
  };

  const handleImportDirectoryUsers = async () => {
    try {
      setLoading(true);
      const companyId = authContext?.user?.company_id;

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

  if (authContext.isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background pb-12">
      {loading && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-[2px] z-[100] flex justify-center items-center">
          <Loader />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                User Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your team member access and directory sync.
              </p>
            </div>
            {!showAddUser && !showDirectoryBrowser && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={fetchDirectoryUsers}
                  variant="outline"
                  className="rounded-full border-primary/20 hover:bg-primary/5 text-primary"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Directory
                </Button>
                <Button
                  onClick={handleAddUser}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            )}
          </div>

          {!showAddUser && !showDirectoryBrowser && (
            <Card className="rounded-2xl border-border/50 bg-surface shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="font-semibold py-4">User</TableHead>
                      <TableHead className="font-semibold py-4">
                        Contact Info
                      </TableHead>
                      <TableHead className="font-semibold py-4">
                        Roles
                      </TableHead>
                      <TableHead className="font-semibold py-4 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-40 text-center text-muted-foreground"
                        >
                          {loading ? "Loading team..." : "No users found."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow
                          key={user.id}
                          className="hover:bg-muted/20 cursor-pointer transition-colors border-border/50"
                          onClick={() => handleEditUser(user)}
                        >
                          <TableCell className="py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                @{user.username}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-sm text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role) => (
                                <span
                                  key={role}
                                  className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider border border-primary/10"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteUser(user.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          {showAddUser && (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => setShowAddUser(false)}
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to team
              </button>

              <Card className="p-8 rounded-3xl border-border/50 bg-surface shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {selectedUser ? "Edit User Details" : "Create New Member"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Fill in the information below.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold ml-1">
                        Username
                      </Label>
                      <TextField
                        className="rounded-xl border-border/60"
                        placeholder="jdoe"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold ml-1">
                        Email
                      </Label>
                      <TextField
                        className="rounded-xl border-border/60"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold ml-1">
                        First Name
                      </Label>
                      <TextField
                        className="rounded-xl border-border/60"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold ml-1">
                        Last Name
                      </Label>
                      <TextField
                        className="rounded-xl border-border/60"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-sm font-semibold ml-1">
                        Password{" "}
                        {selectedUser && (
                          <span className="text-[10px] text-muted-foreground">
                            (Leave blank to keep current)
                          </span>
                        )}
                      </Label>
                      <TextField
                        className="rounded-xl border-border/60"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Label className="text-sm font-semibold mb-4 block ml-1">
                      Access Roles
                    </Label>
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
                      {availableRoles.map((role) => (
                        <div
                          key={role}
                          className="flex items-center space-x-3 hover:bg-background/50 p-2 rounded-lg transition-colors cursor-pointer"
                          onClick={() => toggleRole(role)}
                        >
                          <Checkbox
                            id={role}
                            checked={formData.roles.includes(role)}
                            onCheckedChange={() => toggleRole(role)}
                          />
                          <Label
                            htmlFor={role}
                            className="cursor-pointer text-sm font-medium"
                          >
                            {role}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                    <Button
                      variant="ghost"
                      className="rounded-full px-6"
                      onClick={() => setShowAddUser(false)}
                    >
                      Discard
                    </Button>
                    <Button
                      onClick={handleSaveUser}
                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-lg shadow-primary/20"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {selectedUser ? "Update Profile" : "Create User"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {showDirectoryBrowser && (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => {
                  setShowDirectoryBrowser(false);
                  setSelectedDirectoryUsers([]);
                }}
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to team
              </button>

              <Card className="p-8 rounded-3xl border-border/50 bg-surface shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        Import from Directory
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Select users to import into Vault.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                    <span className="text-xs font-bold text-primary">
                      {selectedDirectoryUsers.length} selected
                    </span>
                  </div>
                </div>

                <Card className="rounded-2xl border-border/50 bg-muted/20 overflow-hidden mb-8">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border/50">
                          <TableHead className="w-12 py-4">
                            <Checkbox
                              checked={
                                directoryUsers.length > 0 &&
                                selectedDirectoryUsers.length ===
                                  directoryUsers.length
                              }
                              onCheckedChange={(checked) => {
                                setSelectedDirectoryUsers(
                                  checked
                                    ? directoryUsers.map((u) => u.id)
                                    : [],
                                );
                              }}
                            />
                          </TableHead>
                          <TableHead className="py-4">Username</TableHead>
                          <TableHead className="py-4">Display Name</TableHead>
                          <TableHead className="py-4">Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {directoryUsers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="h-40 text-center text-muted-foreground"
                            >
                              No directory users available.
                            </TableCell>
                          </TableRow>
                        ) : (
                          directoryUsers.map((user) => (
                            <TableRow
                              key={user.id}
                              className="hover:bg-background/50 border-border/50 transition-colors"
                            >
                              <TableCell className="py-3">
                                <Checkbox
                                  checked={selectedDirectoryUsers.includes(
                                    user.id,
                                  )}
                                  onCheckedChange={() =>
                                    toggleDirectoryUser(user.id)
                                  }
                                />
                              </TableCell>
                              <TableCell className="py-3 font-mono text-sm">
                                @{user.username}
                              </TableCell>
                              <TableCell className="py-3">
                                {user.displayName}
                              </TableCell>
                              <TableCell className="py-3 text-sm text-muted-foreground">
                                {user.email}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                <div className="flex justify-end gap-3 pt-6 border-t border-border/40">
                  <Button
                    variant="ghost"
                    className="rounded-full px-6"
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
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 shadow-lg shadow-primary/20"
                  >
                    Import Selected Members
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganisationListPage;
