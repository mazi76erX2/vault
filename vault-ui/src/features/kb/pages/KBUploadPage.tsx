import React, { useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Loader2,
  Globe,
  Image as ImageIcon,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useAuthContext } from "@/hooks/useAuthContext";
import Api from "@/services/Instance";

const KBUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [accessLevel, setAccessLevel] = useState("1");
  const [department, setDepartment] = useState("");
  const [tags, setTags] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "url">("file");
  const [url, setUrl] = useState("");

  const authContext = useAuthContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        setTitle(e.target.files[0].name);
      }
    }
  };

  const handleUpload = async () => {
    if (uploadType === "file" && !file) {
      toast.error("Please select a file");
      return;
    }

    if (uploadType === "url" && !url) {
      toast.error("Please enter a URL");
      return;
    }

    const formData = new FormData();

    if (uploadType === "file" && file) {
      formData.append("file", file);
      formData.append("title", title || file.name);
    } else if (uploadType === "url") {
      formData.append("url", url);
      formData.append("title", title || url);
    }

    formData.append("access_level", accessLevel);
    if (department) formData.append("department", department);
    if (tags) formData.append("tags", tags);

    try {
      setUploading(true);

      const endpoint =
        uploadType === "file" ? "/api/v1/kb/upload" : "/api/v1/kb/scrape";

      const response = await Api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        `${uploadType === "file" ? "File" : "Website"} uploaded! ${
          response.data.chunks
        } chunks indexed.`
      );

      // Reset form
      setFile(null);
      setTitle("");
      setDepartment("");
      setTags("");
      setUrl("");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const supportedFormats = [
    { icon: FileText, label: "PDF", ext: ".pdf" },
    { icon: FileText, label: "Word", ext: ".docx, .doc" },
    { icon: FileText, label: "PowerPoint", ext: ".pptx" },
    { icon: FileText, label: "Text", ext: ".txt, .md" },
    { icon: FileText, label: "CSV", ext: ".csv" },
    { icon: FileText, label: "Excel", ext: ".xlsx, .xls" },
    { icon: ImageIcon, label: "Images (OCR)", ext: ".png, .jpg" },
    { icon: Mic, label: "Audio", ext: ".mp3, .wav" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Upload to Knowledge Base</h1>
        <p className="text-muted-foreground">
          Add documents, images, audio, or websites to your company's knowledge
          base
        </p>
      </div>

      {/* Upload Type Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={uploadType === "file" ? "default" : "outline"}
          onClick={() => setUploadType("file")}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
        <Button
          variant={uploadType === "url" ? "default" : "outline"}
          onClick={() => setUploadType("url")}
          className="flex-1"
        >
          <Globe className="w-4 h-4 mr-2" />
          Scrape Website
        </Button>
      </div>

      {/* Upload Form */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="space-y-4">
          {uploadType === "file" ? (
            <div>
              <label className="block text-sm font-medium mb-2">File</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.pptx,.txt,.md,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.mp3,.wav"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {file && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background"
                placeholder="https://example.com/docs"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-background"
              placeholder="Document title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Access Level
              </label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background"
              >
                <option value="1">Level 1 - Public</option>
                <option value="2">Level 2 - Internal</option>
                <option value="3">Level 3 - Confidential</option>
                <option value="4">Level 4 - Restricted</option>
                <option value="5">Level 5 - Top Secret</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background"
                placeholder="e.g., Engineering, HR"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border rounded-md px-3 py-2 bg-background"
              placeholder="e.g., onboarding, security, deployment"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          <Button
            onClick={handleUpload}
            disabled={
              (uploadType === "file" && !file) ||
              (uploadType === "url" && !url) ||
              uploading
            }
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload to Knowledge Base
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-4 text-lg">Supported Formats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {supportedFormats.map((format) => (
            <div
              key={format.label}
              className="flex items-center gap-2 p-3 bg-background rounded-md border"
            >
              <format.icon className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{format.label}</p>
                <p className="text-xs text-muted-foreground">{format.ext}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KBUploadPage;
