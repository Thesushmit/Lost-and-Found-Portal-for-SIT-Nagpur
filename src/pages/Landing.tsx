import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Clock, CheckCircle, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Search,
      title: "Report Found Items",
      description: "Quickly upload details and photos of items you've found on campus.",
    },
    {
      icon: MapPin,
      title: "Track Location",
      description: "Know exactly where items were found and where they're stored.",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get instant notifications when your lost item is reported.",
    },
    {
      icon: CheckCircle,
      title: "Easy Claims",
      description: "Simple verification process to reunite items with owners.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Lost Something?
                <br />
                <span className="text-accent">We'll Help You Find It</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0">
                The campus-wide platform for reporting and finding lost belongings. 
                Join our community and help reunite items with their owners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground btn-accent-glow">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                    Browse Found Items
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="flex-1 animate-slide-up">
              <div className="relative">
                <div className="w-72 h-72 md:w-96 md:h-96 mx-auto bg-primary-foreground/10 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                  <Search className="w-32 h-32 md:w-48 md:h-48 text-accent" />
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent rounded-2xl flex items-center justify-center animate-bounce">
                  <MapPin className="w-10 h-10 text-accent-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform makes it easy to report found items and help fellow students recover their belongings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-hover p-6 rounded-2xl bg-card border border-border"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Help?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Create an account to start reporting found items or search for your lost belongings.
          </p>
          <Link to="/auth">
            <Button size="lg" className="btn-accent-glow bg-primary hover:bg-primary/90">
              Join the Community
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Search className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Lost & Found Portal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 University Lost & Found. Helping reunite belongings with owners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
