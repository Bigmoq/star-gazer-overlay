import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon, Star, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { findByCode } from "@/lib/starStore";
import { toast } from "@/hooks/use-toast";

const Search = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!code.trim()) return;
    setLoading(true);
    
    // Simulate brief loading
    setTimeout(() => {
      const star = findByCode(code.trim());
      if (star) {
        navigate(`/star/${encodeURIComponent(star.code)}`);
      } else {
        toast({
          title: "لم يتم العثور على النجم",
          description: "تأكد من الرمز وحاول مرة أخرى",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background stars effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-foreground/20"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md text-center z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-8"
        >
          <Star className="w-16 h-16 mx-auto text-star-glow star-icon-glow fill-star-glow" />
        </motion.div>

        <h1 className="text-4xl font-display font-bold text-foreground mb-2">
          سجل النجوم
        </h1>
        <p className="text-muted-foreground font-body mb-8">
          أدخل الرمز الخاص بك لعرض نجمتك
        </p>

        {/* Search box */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="relative">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="أدخل رمز النجم مثل HD12323"
              className="pr-10 text-center font-body text-lg h-12 bg-secondary/50 border-glass-border/40"
              dir="ltr"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !code.trim()}
            className="w-full h-12 text-lg font-display gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {loading ? "جاري البحث..." : "ابحث عن نجمتك"}
          </Button>
        </div>

        {/* Sample hint */}
        <p className="text-xs text-muted-foreground/60 mt-4 font-body">
          جرب الرمز: HD12323
        </p>
      </motion.div>
    </div>
  );
};

export default Search;
