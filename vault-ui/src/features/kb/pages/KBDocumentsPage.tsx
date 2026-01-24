import React, { useEffect, useState } from "react";
import { FileText, Trash2, Calendar, User, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import Api from "@/services/Instance";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Document {
  id: string;
  title: string;
  author: string;
  department?: string;
  created_at: string;
  level: number;
  doc_type?: string;
}

const KBDocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await Api.get("/api/v1/kb/documents");
      setDocuments(response.data.documents || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await Api.delete(`/api/v1/kb/documents/${docId}`);
      toast.success("Document deleted");
      fetchDocuments();
    } catch (error: any) {
      toast.error("Failed to delete document");
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base Documents</h1>
          <p className="text-muted-foreground mt-1">
            {documents.length} documents indexed
          </p>
        </div>
        <Button onClick={() => navigate("/knowledge-base/Upload")}>
          <Upload className="w-4 h-4 mr-2" />
          Upload New
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-card border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <FileText className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">{doc.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {doc.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                  {doc.department && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                      {doc.department}
                    </span>
                  )}
                  {doc.doc_type && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs uppercase">
                      {doc.doc_type}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-xs">
                    Level {doc.level}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(doc.id)}
              className="flex-shrink-0"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "No documents match your search"
              : "No documents yet"}
          </p>
          {!searchQuery && (
            <Button onClick={() => navigate("/knowledge-base/Upload")}>
              Upload First Document
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default KBDocumentsPage;
