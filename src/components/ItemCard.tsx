import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, User, Package } from "lucide-react";

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    found_location: string;
    deposit_location: string;
    found_date: string;
    found_time: string;
    status: "found" | "claimed" | "returned";
    reporter: {
      full_name: string;
      email: string;
    } | null;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  const getStatusBadge = () => {
    switch (item.status) {
      case "found":
        return (
          <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">
            Available
          </Badge>
        );
      case "claimed":
        return (
          <Badge className="bg-primary text-primary-foreground">
            Claimed
          </Badge>
        );
      case "returned":
        return (
          <Badge className="bg-success text-success-foreground">
            Returned
          </Badge>
        );
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "h:mm a");
  };

  return (
    <div className="item-card group">
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute top-3 right-3">{getStatusBadge()}</div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{item.found_location}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{format(new Date(item.found_date), "MMM d, yyyy")}</span>
            <Clock className="w-4 h-4 flex-shrink-0 ml-2" />
            <span>{formatTime(item.found_time)}</span>
          </div>

          {item.reporter && (
            <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t border-border">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">Reported by {item.reporter.full_name}</span>
            </div>
          )}
        </div>

        {/* Deposit Location */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Pick up at:</p>
          <p className="text-sm font-medium">{item.deposit_location}</p>
        </div>
      </div>
    </div>
  );
}
