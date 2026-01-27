import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Upload, X, Image as ImageIcon, Send } from "lucide-react";

export default function ReportFoundItem() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    foundLocation: "",
    depositLocation: "",
    foundDate: new Date().toISOString().split("T")[0],
    foundTime: new Date().toTimeString().slice(0, 5),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from("found-items")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data } = supabase.storage
      .from("found-items")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to report an item.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          throw new Error("Failed to upload image");
        }
      }

      const { error } = await supabase.from("found_items").insert({
        reporter_id: user.id,
        title: formData.title,
        description: formData.description,
        found_location: formData.foundLocation,
        deposit_location: formData.depositLocation,
        found_date: formData.foundDate,
        found_time: formData.foundTime,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "Item Reported!",
        description: "Thank you for helping reunite this item with its owner.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error reporting item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to report the item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Report Found Item</h1>
          <p className="text-muted-foreground">
            Help someone find their lost belonging by providing details about the item you found.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Item Photo</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer py-8"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">Click to upload a photo</p>
                  <p className="text-sm text-muted-foreground/70">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Item Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Item Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Blue Water Bottle, iPhone 14, Student ID Card"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-focus"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the item in detail (color, brand, any distinguishing features...)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-focus min-h-[100px]"
            />
          </div>

          {/* Found Location */}
          <div className="space-y-2">
            <Label htmlFor="foundLocation">Where was it found? *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="foundLocation"
                placeholder="e.g., Main Library, 2nd Floor"
                value={formData.foundLocation}
                onChange={(e) => setFormData({ ...formData, foundLocation: e.target.value })}
                className="pl-10 input-focus"
                required
              />
            </div>
          </div>

          {/* Deposit Location */}
          <div className="space-y-2">
            <Label htmlFor="depositLocation">Where is it deposited now? *</Label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="depositLocation"
                placeholder="e.g., Lost & Found Office, Admin Building"
                value={formData.depositLocation}
                onChange={(e) => setFormData({ ...formData, depositLocation: e.target.value })}
                className="pl-10 input-focus"
                required
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foundDate">Date Found *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="foundDate"
                  type="date"
                  value={formData.foundDate}
                  onChange={(e) => setFormData({ ...formData, foundDate: e.target.value })}
                  className="pl-10 input-focus"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="foundTime">Time Found *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="foundTime"
                  type="time"
                  value={formData.foundTime}
                  onChange={(e) => setFormData({ ...formData, foundTime: e.target.value })}
                  className="pl-10 input-focus"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              "Submitting..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Report Found Item
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
