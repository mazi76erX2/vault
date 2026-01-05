import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { Loader } from "@/components/feedback/loader";
import { Card } from "@/components/ui/card";
import { SegmentTabs } from "@/components/layout/segment-tabs";
import { useAuthContext } from "@/hooks/useAuthContext";
import Api from "@/services/Instance";

interface OrganisationDetails {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  company: string;
  registeredSince: string;
}

const OrganisationDetailsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const authContext = useAuthContext();

  const [formData, setFormData] = useState<OrganisationDetails>({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    company: "",
    registeredSince: new Date().toISOString().split("T")[0],
  });

  const tabs = [
    { label: "Details", value: 0 },
    { label: "License", value: 1 },
  ];

  useEffect(() => {
    if (authContext?.user?.user?.id) {
      fetchCompanyContactDetails(authContext.user.user.id);
    }
  }, [authContext?.user]);

  const fetchCompanyContactDetails = async (userId: string) => {
    try {
      setLoading(true);
      const response = await Api.post(
        "/api/v1/companies/getcompanycontactdetails",
        {
          userid: userId,
        },
      );

      if (response.data) {
        setFormData({
          firstName: response.data.firstname || "",
          lastName: response.data.lastname || "",
          email: response.data.email || "",
          telephone: response.data.telephone || "",
          company: response.data.companyname || "",
          registeredSince:
            response.data.registeredsince || formData.registeredSince,
        });
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error("Failed to load company details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const userId = authContext?.user?.user?.id;

      await Api.post("/api/v1/companies/updatecompanycontactdetails", {
        userid: userId,
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        telephone: formData.telephone,
        companyname: formData.company,
      });

      toast.success("Company details updated successfully.");
    } catch (err) {
      console.error("Error saving company details:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error("Failed to save company details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (authContext?.user?.user?.id) {
      fetchCompanyContactDetails(authContext.user.user.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-white/80 z-[1000] flex justify-center items-center">
          <Loader />
        </div>
      )}

      <SegmentTabs
        tabs={tabs}
        value={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      <form onSubmit={handleSubmit}>
        <Card className="bg-[#d3d3d3] p-6 shadow-md">
          {activeTab === 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">
                Organisation Contact Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />

                <TextField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <TextField
                label="Telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                required
              />

              <TextField
                label="Company Name"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                required
              />

              <TextField
                label="Registered Since"
                type="date"
                value={formData.registeredSince}
                onChange={(e) =>
                  setFormData({ ...formData, registeredSince: e.target.value })
                }
                disabled
              />
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">License Information</h3>
              <p className="text-gray-600">
                License information will be displayed here.
              </p>
            </div>
          )}
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            type="reset"
            onClick={handleReset}
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
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrganisationDetailsPage;
