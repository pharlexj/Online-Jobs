import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";

// Public pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Gallery from "@/pages/Gallery";
import FAQs from "@/pages/FAQs";
import Notices from "@/pages/Notices";
import Jobs from "@/pages/Jobs";

// Applicant pages
import ApplicantDashboard from "@/pages/applicant/Dashboard";
import ApplicantProfile from "@/pages/applicant/Profile";
import ApplicantApplications from "@/pages/applicant/Applications";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminJobManagement from "@/pages/admin/JobManagement";
import AdminApplications from "@/pages/admin/Applications";

// Board pages
import BoardDashboard from "@/pages/board/Dashboard";
import BoardShortlisting from "@/pages/board/Shortlisting";
import BoardInterviews from "@/pages/board/Interviews";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/faqs" component={FAQs} />
      <Route path="/notices" component={Notices} />
      <Route path="/jobs" component={Jobs} />

      {/* Protected routes - will handle auth check within each component */}
      <Route path="/dashboard" component={ApplicantDashboard} />
      <Route path="/profile" component={ApplicantProfile} />
      <Route path="/applications" component={ApplicantApplications} />

      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/jobs" component={AdminJobManagement} />
      <Route path="/admin/applications" component={AdminApplications} />

      <Route path="/board" component={BoardDashboard} />
      <Route path="/board/shortlisting" component={BoardShortlisting} />
      <Route path="/board/interviews" component={BoardInterviews} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
