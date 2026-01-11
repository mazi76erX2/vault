import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { ColorPicker } from "@/components/pickers/color-picker";
import { Loader } from "@/components/feedback/loader";
import { CheckBox } from "@/components/forms/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthContext } from "@/hooks/useAuthContext";
import Api from "@/services/Instance";
import assistantIcon from "@/assets/assistant_icon.png";

interface ThemeSettings {
  userChatBubbleColor: string;
  botChatBubbleColor: string;
  sendButtonAndBox: string;
  font: string;
  userChatFontColor: string;
  botChatFontColor: string;
  logo: string | null;
  botProfilePicture: string | null;
}

interface FontOption {
  id: string;
  value: string;
}

const BusinessThemePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userChatColor, setUserChatColor] = useState("#007bff");
  const [botChatColor, setBotChatColor] = useState("#e5e5ea");
  const [sendButtonColor, setSendButtonColor] = useState("#FF8234");
  const [userChatFontColor, setUserChatFontColor] = useState("#000000");
  const [botChatFontColor, setBotChatFontColor] = useState("#000000");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [botProfilePicPreview, setBotProfilePicPreview] =
    useState<string>(assistantIcon);
  const [selectedFont, setSelectedFont] = useState<FontOption>({
    id: "tahoma",
    value: "Tahoma",
  });
  const [sameAsLogo, setSameAsLogo] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("Some preview text");

  const authContext = useAuthContext();

  const fontOptions: FontOption[] = [
    { id: "arial", value: "Arial" },
    { id: "tahoma", value: "Tahoma" },
    { id: "times", value: "Times New Roman" },
    { id: "verdana", value: "Verdana" },
    { id: "roboto", value: "Roboto" },
  ];

  const messages = [
    { id: 1, text: "Hello! How can I help you today?", sender: "bot" },
    { id: 2, text: "I need information about your services.", sender: "user" },
    { id: 3, text: "I'd be happy to help with that.", sender: "bot" },
  ];

  const addHashIfMissing = (color: string): string => {
    if (!color) return "#000000";
    return color.startsWith("#") ? color : `#${color}`;
  };

  useEffect(() => {
    if (authContext?.user?.user?.id) {
      fetchThemeSettings();
    }
  }, [authContext?.user?.user?.id]);

  const fetchThemeSettings = async () => {
    try {
      setLoading(true);
      const userId = authContext?.user?.user?.id;

      const response = await Api.post("/api/v1/companies/getthemesettings", {
        userid: userId,
      });

      if (response.data?.themesettings) {
        const settings = response.data.themesettings as ThemeSettings;
        setUserChatColor(addHashIfMissing(settings.userChatBubbleColor));
        setBotChatColor(addHashIfMissing(settings.botChatBubbleColor));
        setSendButtonColor(addHashIfMissing(settings.sendButtonAndBox));
        setUserChatFontColor(addHashIfMissing(settings.userChatFontColor));
        setBotChatFontColor(addHashIfMissing(settings.botChatFontColor));
        setSelectedFont(
          fontOptions.find((f) => f.value === settings.font) || {
            id: "tahoma",
            value: "Tahoma",
          }
        );
        setLogoPreview(settings.logo || "");
        setBotProfilePicPreview(settings.botProfilePicture || assistantIcon);
        toast.success("Theme settings loaded.");
      }
    } catch (err) {
      console.error("Error fetching theme settings:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        toast.error("Could not fetch theme settings.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const userId = authContext?.user?.user?.id;

      const logoToSend =
        logoPreview && logoPreview.startsWith("data:image")
          ? logoPreview
          : null;
      const botPicToSend =
        botProfilePicPreview !== assistantIcon &&
        botProfilePicPreview.startsWith("data:image")
          ? botProfilePicPreview
          : null;

      const payload = {
        userchatbubblecolour: userChatColor,
        botchatbubblecolour: botChatColor,
        sendbuttonandbox: sendButtonColor,
        font: selectedFont.value,
        userchatfontcolour: userChatFontColor,
        botchatfontcolour: botChatFontColor,
        logo: logoToSend,
        botprofilepicture: botPicToSend,
      };

      await Api.post("/api/v1/companies/updatethemesettings", {
        userid: userId,
        themesettings: payload,
      });

      toast.success("Theme settings saved successfully.");

      setTimeout(() => {
        fetchThemeSettings();
      }, 1000);
    } catch (err) {
      console.error("Error saving theme settings:", err);
      if (!(err instanceof AxiosError && err.response?.status === 401)) {
        const message =
          err instanceof AxiosError && err.response?.data?.detail
            ? err.response.data.detail
            : "Failed to save theme settings.";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isLogo: boolean
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (isLogo) {
          setLogoPreview(result);
          if (sameAsLogo) {
            setBotProfilePicPreview(result);
          }
        } else {
          setBotProfilePicPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto p-6">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-background/80 z-[1000] flex justify-center items-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-foreground">
        Business Theme Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="text-sm font-semibold mb-2 block text-foreground">
            User Chat Bubble Colour
          </label>
          <ColorPicker
            color={userChatColor}
            onChange={(color) => setUserChatColor(color.hex)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block text-foreground">
            Bot Chat Bubble Colour
          </label>
          <ColorPicker
            color={botChatColor}
            onChange={(color) => setBotChatColor(color.hex)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block text-foreground">
            Send Button Color
          </label>
          <ColorPicker
            color={sendButtonColor}
            onChange={(color) => setSendButtonColor(color.hex)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block text-foreground">
            User Chat Font Colour
          </label>
          <ColorPicker
            color={userChatFontColor}
            onChange={(color) => setUserChatFontColor(color.hex)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block text-foreground">
            Bot Chat Font Colour
          </label>
          <ColorPicker
            color={botChatFontColor}
            onChange={(color) => setBotChatFontColor(color.hex)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block text-foreground">
            Font Family
          </label>
          <select
            value={selectedFont.id}
            onChange={(e) => {
              const font = fontOptions.find((f) => f.id === e.target.value);
              if (font) setSelectedFont(font);
            }}
            className="w-full p-2 border border-border rounded bg-input text-foreground"
          >
            {fontOptions.map((font) => (
              <option key={font.id} value={font.id}>
                {font.value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block text-foreground">
            Logo
          </label>
          <div className="flex gap-2">
            <TextField
              value={logoPreview ? "Image selected" : ""}
              disabled
              placeholder="No file selected"
              className="flex-1"
            />
            <Button variant="outline" asChild>
              <label htmlFor="logo-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Browse
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, true)}
                />
              </label>
            </Button>
          </div>
          {logoPreview && (
            <div className="mt-2 border border-border p-2 inline-block rounded">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="max-w-[200px] max-h-[100px]"
              />
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block text-foreground">
            Bot Profile Picture
          </label>
          <div className="flex gap-2">
            <TextField
              value={
                botProfilePicPreview !== assistantIcon ? "Image selected" : ""
              }
              disabled
              placeholder="No file selected"
              className="flex-1"
            />
            <Button variant="outline" asChild disabled={sameAsLogo}>
              <label htmlFor="bot-pic-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Browse
                <input
                  id="bot-pic-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, false)}
                  disabled={sameAsLogo}
                />
              </label>
            </Button>
          </div>
          <CheckBox
            label="Same as Logo"
            checked={sameAsLogo}
            onChange={(checked) => {
              setSameAsLogo(checked);
              if (checked && logoPreview) {
                setBotProfilePicPreview(logoPreview);
              }
            }}
            className="mt-2"
          />
          {botProfilePicPreview && (
            <div className="mt-2 border border-border p-2 inline-block rounded">
              <img
                src={botProfilePicPreview}
                alt="Bot Profile Preview"
                className="max-w-[200px] max-h-[100px]"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-foreground">Preview</h3>
        <Card className="bg-card text-card-foreground max-w-2xl">
          <CardContent className="p-4">
            <div className="space-y-4 mb-4">
              {messages.map((message) =>
                message.sender === "bot" ? (
                  <div key={message.id} className="flex justify-start">
                    <div
                      className="max-w-[70%] rounded-lg p-4 flex gap-2"
                      style={{
                        backgroundColor: botChatColor,
                        color: botChatFontColor,
                        fontFamily: selectedFont.value,
                      }}
                    >
                      <img
                        src={botProfilePicPreview}
                        alt="Bot"
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{message.text}</span>
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex justify-end">
                    <div
                      className="max-w-[70%] rounded-lg p-4"
                      style={{
                        backgroundColor: userChatColor,
                        color: userChatFontColor,
                        fontFamily: selectedFont.value,
                      }}
                    >
                      {message.text}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="relative">
              <textarea
                value={previewMessage}
                onChange={(e) => setPreviewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3 pr-12 border border-border rounded resize-none bg-input text-foreground"
                style={{
                  fontFamily: selectedFont.value,
                  color: userChatFontColor,
                }}
                rows={2}
              />
              <Button
                className="absolute bottom-2 right-2 p-2"
                style={{ backgroundColor: sendButtonColor }}
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" size="lg">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default BusinessThemePage;
