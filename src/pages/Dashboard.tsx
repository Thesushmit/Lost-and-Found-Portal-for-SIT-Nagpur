import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ItemCard from "@/components/ItemCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Package } from "lucide-react";

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

export default function Dashboard() {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("found_items")
      .select(`
        *,
        reporter:profiles!found_items_reporter_id_fkey(full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching items:", error);
    } else {
      setItems(data as unknown as FoundItem[]);
    }
    setLoading(false);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.found_location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Found Items</h1>
          <p className="text-muted-foreground">
            Browse through items that have been found on campus. Claim yours if you find it!
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-focus"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] input-focus">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="found">Available</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No items have been reported yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && items.length > 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {items.filter((i) => i.status === "found").length}
              </div>
              <div className="text-sm text-muted-foreground">Available Items</div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="text-3xl font-bold text-accent mb-1">
                {items.filter((i) => i.status === "claimed").length}
              </div>
              <div className="text-sm text-muted-foreground">Claimed Items</div>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div className="text-3xl font-bold text-success mb-1">
                {items.filter((i) => i.status === "returned").length}
              </div>
              <div className="text-sm text-muted-foreground">Returned Items</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
