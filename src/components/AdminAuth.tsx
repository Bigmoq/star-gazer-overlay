import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ADMIN_PASSWORD = "star2024";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

const AdminAuth = ({ onAuthenticated }: AdminAuthProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      onAuthenticated();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-2xl p-8 w-full max-w-sm text-center space-y-6"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <Star className="w-7 h-7 text-star-glow fill-star-glow star-icon-glow" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground">لوحة الإدارة</h1>
          <p className="text-sm text-muted-foreground font-body">أدخل كلمة المرور للوصول</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className={`bg-secondary/50 border-glass-border/40 text-center text-lg h-12 ${error ? "border-destructive animate-shake" : ""}`}
              autoFocus
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive font-body">
              كلمة المرور غير صحيحة
            </motion.p>
          )}
          <Button type="submit" className="w-full h-11 font-display" disabled={!password}>
            دخول
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminAuth;
