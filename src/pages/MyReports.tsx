import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ItemCard from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Package, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FoundItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  found_location: string;
  deposit_location: string;
  found_date: string;
  found_time: string;
  status: "found" | "claimed" | "returned";
  created_at: string;
  reporter: {
    full_name: string;
    email: string;
  } | null;
}

export default function MyReports() {
  const { user } = useAuth();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyItems();
    }
  }, [user]);

  const fetchMyItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("found_items")
      .select(`
        *,
        reporter:profiles!found_items_reporter_id_fkey(full_name, email)
      `)
      .eq("reporter_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching items:", error);
    } else {
      setItems(data as unknown as FoundItem[]);
    }
    setLoading(false);
  };

  const handleDelete = async (itemId: string) => {
    setDeletingId(itemId);
    const { error } = await supabase
      .from("found_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete the item. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Item Deleted",
        description: "The item has been removed from the listings.",
      });
      setItems(items.filter((item) => item.id !== itemId));
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Reports</h1>
            <p className="text-muted-foreground">
              Items you've reported as found on campus.
            </p>
          </div>
          <Link to="/report">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Report New Item
            </Button>
          </Link>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't reported any found items yet.
            </p>
            <Link to="/report">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Report Found Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="relative animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ItemCard item={item} />
                {/* Delete Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The item "{item.title}" will be permanently removed from the listings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
