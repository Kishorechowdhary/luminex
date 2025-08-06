import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Placeholder from "./pages/Placeholder";
import Auth from "./pages/Auth";
import Games from "./pages/Games";
import Analytics from "./pages/Analytics";
import Therapy from "./pages/Therapy";
import Journal from "./pages/Journal";
import Music from "./pages/Music";
import { BarChart3, Gamepad2, Bot, Heart, Music as MusicIcon, Calendar, MapPin, Palette } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />

          {/* LUMINIX ECO MIND Feature Routes */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/games" element={<Games />} />
          <Route path="/therapy" element={<Therapy />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/music" element={<Music />} />
          <Route
            path="/planner"
            element={
              <Placeholder
                title="Mood-Triggered Planner"
                description="Sync your emotional states with your calendar. Get mood-based activity suggestions and productivity insights."
                icon={<Calendar className="w-12 h-12 text-luminix-bg" />}
              />
            }
          />
          <Route
            path="/location"
            element={
              <Placeholder
                title="Location Mood Trends"
                description="Discover how different places affect your mood with interactive heatmaps and location-based emotional insights."
                icon={<MapPin className="w-12 h-12 text-luminix-bg" />}
              />
            }
          />
          <Route
            path="/art"
            element={
              <Placeholder
                title="AI Mood Art Generator"
                description="Transform your emotions into beautiful digital art. Create personalized wallpapers and visual representations of your mood."
                icon={<Palette className="w-12 h-12 text-luminix-bg" />}
              />
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
