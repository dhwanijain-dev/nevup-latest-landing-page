'use client'
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { addToWaitlist, sendToGoogleSheets } from "@/lib/waitlistStore";

const Waitlist = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isTrader, setIsTrader] = useState(false);
  const [agreedToContact, setAgreedToContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Missing details",
        description: "Please enter your name and email.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = addToWaitlist({
        name: name.trim(),
        email: email.trim(),
        isTrader,
      });

      if (!saved) {
        toast({
          title: "Already joined",
          description: "This email is already on the waitlist.",
        });
        return;
      }

      const syncResult = await sendToGoogleSheets(saved);

      setName("");
      setEmail("");
      setIsTrader(false);
      setAgreedToContact(false);

      if (!syncResult.ok) {
        console.error("Waitlist sync failed", syncResult);
        if (syncResult.status === 409) {
          toast({
            title: "Already on waitlist",
            description: "This email is already registered in our system.",
          });
        } else {
          toast({
            title: "Synced locally",
            description:
              "We couldn't sync with Google Sheets right now, but your spot is saved locally. Please try again later.",
          });
        }
      } else {
        toast({
          title: "Joined waitlist",
          description: "You're on the list. We'll be in touch soon.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        background: "#000000",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "999px",
            padding: "4px 14px",
            fontSize: "0.72rem",
            color: "rgba(255, 255, 255, 0.6)",
            marginBottom: "1rem",
            letterSpacing: "0.04em",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
            }}
          />
          Early access — limited spots
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          style={{
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.4) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "0.75rem",
          }}
        >
          Join the NevUp Waitlist
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "1rem",
            lineHeight: 1.65,
            marginBottom: "2rem",
          }}
        >
          Share your details and be the first to hear and access when the NevUp is ready. 
        </motion.p>

        {/* Glass Card Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "2rem",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 64px rgba(0,0,0,0.45), 0 0 80px rgba(37,99,235,0.06)",
          }}
        >
          {/* Full Name */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              htmlFor="name"
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.5)",
                marginBottom: "0.5rem",
              }}
            >
              Full Name
            </label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#ffffff",
                padding: "12px 16px",
                fontSize: "0.95rem",
                outline: "none",
                width: "100%",
              }}
            />
          </div>

          {/* Email Address */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.5)",
                marginBottom: "0.5rem",
              }}
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#ffffff",
                padding: "12px 16px",
                fontSize: "0.95rem",
                outline: "none",
                width: "100%",
              }}
            />
          </div>

          {/* Trader Toggle */}
          <label
            htmlFor="isTrader"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.85rem 1rem",
              marginTop: "1.25rem",
              marginBottom: "1.25rem",
              borderRadius: "12px",
              cursor: "pointer",
              border: isTrader
                ? "1px solid rgba(99,102,241,0.45)"
                : "1px solid rgba(255,255,255,0.08)",
              background: isTrader
                ? "rgba(99,102,241,0.1)"
                : "rgba(255,255,255,0.04)",
              transition: "all 0.2s ease",
            }}
          >
            {/* Custom checkbox visual */}
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "6px",
                flexShrink: 0,
                border: isTrader
                  ? "1.5px solid transparent"
                  : "1.5px solid rgba(255,255,255,0.2)",
                background: isTrader
                  ? "linear-gradient(135deg, #2563eb, #7c3aed)"
                  : "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              aria-hidden="true"
            >
              <Checkbox
                id="isTrader"
                checked={isTrader}
                onCheckedChange={(value) => setIsTrader(value === true)}
                aria-label="I actively trade in financial markets"
                style={{
                  width: "12px",
                  height: "12px",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  boxShadow: "none",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color: "#ffffff",
                }}
              >
                I actively trade in financial markets
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.5)",
                  marginTop: "2px",
                }}
              >
                Stocks, crypto, forex, derivatives
              </div>
            </div>
          </label>

          {/* Contact Consent */}
          <label
            htmlFor="agreedToContact"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.85rem 1rem",
              marginBottom: "1.25rem",
              borderRadius: "12px",
              cursor: "pointer",
              border: agreedToContact
                ? "1px solid rgba(99,102,241,0.45)"
                : "1px solid rgba(255,255,255,0.08)",
              background: agreedToContact
                ? "rgba(99,102,241,0.1)"
                : "rgba(255,255,255,0.04)",
              transition: "all 0.2s ease",
            }}
          >
            {/* Custom checkbox visual */}
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "6px",
                flexShrink: 0,
                border: agreedToContact
                  ? "1.5px solid transparent"
                  : "1.5px solid rgba(255,255,255,0.2)",
                background: agreedToContact
                  ? "linear-gradient(135deg, #2563eb, #7c3aed)"
                  : "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              aria-hidden="true"
            >
              <Checkbox
                id="agreedToContact"
                checked={agreedToContact}
                onCheckedChange={(value) => setAgreedToContact(value === true)}
                aria-label="Agree to be contacted about NevUp AI product launch"
                style={{
                  width: "12px",
                  height: "12px",
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  boxShadow: "none",
                }}
              />
            </div>

            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: 1.45,
              }}
            >
              By submitting your email, you agree to be contacted about NevUp AI&apos;s product launch
            </div>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !agreedToContact}
            style={{
              width: "100%",
              padding: "13px 1.5rem",
              background: "#ffffff",
              border: "none",
              borderRadius: "10px",
              color: "#000000",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: isSubmitting || !agreedToContact ? "not-allowed" : "pointer",
              display: "block",
              boxShadow: "none",
              opacity: isSubmitting || !agreedToContact ? 0.6 : 1,
              position: "relative",
            }}
          >
            {isSubmitting ? "Joining..." : "Join Waitlist"}
          </button>

          {/* Footer note */}
          <div
            style={{
              textAlign: "center",
              marginTop: "1rem",
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            ✓ No spam &nbsp;·&nbsp; Unsubscribe anytime
          </div>
        </motion.form>
      </div>

      <Toaster />
    </section>
  );
};

export default Waitlist;