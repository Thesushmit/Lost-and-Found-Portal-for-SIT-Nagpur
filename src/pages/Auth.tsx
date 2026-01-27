import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Search, User, GraduationCap, Briefcase, Mail, Lock, IdCard, BookOpen, Building } from "lucide-react";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["student", "staff"]),
  studentIdNumber: z.string().optional(),
  semester: z.string().optional(),
  department: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "staff">("student");
  const [studentIdNumber, setStudentIdNumber] = useState("");
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: err.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      signUpSchema.parse({
        email,
        password,
        fullName,
        role,
        studentIdNumber: role === "student" ? studentIdNumber : undefined,
        semester: role === "student" ? semester : undefined,
        department: role === "staff" ? department : undefined,
      });

      if (role === "student" && (!studentIdNumber || !semester)) {
        throw new Error("Student ID and semester are required for students");
      }
      if (role === "staff" && !department) {
        throw new Error("Department is required for staff");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: err.errors[0].message,
          variant: "destructive",
        });
      } else if (err instanceof Error) {
        toast({
          title: "Validation Error",
          description: err.message,
          variant: "destructive",
        });
      }
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, {
      fullName,
      role,
      studentIdNumber: role === "student" ? studentIdNumber : undefined,
      semester: role === "student" ? semester : undefined,
      department: role === "staff" ? department : undefined,
    });

    if (error) {
      let message = error.message;
      if (error.message?.includes("already registered")) {
        message = "This email is already registered. Please login instead.";
      }
      toast({
        title: "Sign Up Failed",
        description: message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Welcome to the Lost & Found Portal.",
      });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
            <Search className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground">Lost & Found Portal</h1>
          <p className="text-primary-foreground/70 mt-2">Help reunite belongings with their owners</p>
        </div>

        {/* Auth Card */}
        <div className="auth-card animate-slide-up">
          {/* Toggle Buttons */}
          <div className="flex rounded-lg bg-secondary p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 input-focus"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 input-focus"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>I am a</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as "student" | "staff")}
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    htmlFor="student"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      role === "student"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="student" id="student" />
                    <GraduationCap className="w-5 h-5" />
                    <span>Student</span>
                  </Label>
                  <Label
                    htmlFor="staff"
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      role === "staff"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="staff" id="staff" />
                    <Briefcase className="w-5 h-5" />
                    <span>Staff</span>
                  </Label>
                </RadioGroup>
              </div>

              {/* Common Fields */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 input-focus"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 input-focus"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupPassword">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 input-focus"
                    required
                  />
                </div>
              </div>

              {/* Student-specific Fields */}
              {role === "student" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID Number</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="STU123456"
                        value={studentIdNumber}
                        onChange={(e) => setStudentIdNumber(e.target.value)}
                        className="pl-10 input-focus"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester">Current Semester</Label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger className="input-focus">
                        <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={`Semester ${sem}`}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Staff-specific Fields */}
              {role === "staff" && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="department"
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="pl-10 input-focus"
                      required
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
