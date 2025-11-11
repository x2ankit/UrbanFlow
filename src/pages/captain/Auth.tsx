import { AuthForm } from "@/components/auth/AuthForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CaptainAuth = () => {
  const handleAuth = (data: any) => {
    console.log("Captain auth data:", data);
    // Navigate to captain dashboard after auth
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-6 left-6">
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <AuthForm role="captain" onSubmit={handleAuth} />
    </div>
  );
};

export default CaptainAuth;