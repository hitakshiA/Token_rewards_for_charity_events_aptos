// src/pages/Login.tsx

import React, { useEffect } from 'react'; // <-- Import useEffect
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Wallet, ArrowLeft, Loader2 } from 'lucide-react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useToast } from '../hooks/use-toast';

const Login = () => {
  const { connect, isLoading, connected } = useWallet(); // <-- Get the 'connected' status
  const { toast } = useToast();
  const navigate = useNavigate();

  // This is the core logic for redirection.
  // This hook will run whenever the 'connected' status changes.
  useEffect(() => {
    // If the wallet is connected, redirect to the dashboard.
    if (connected) {
      console.log("Wallet already connected. Redirecting to dashboard...");
      // Using { replace: true } prevents the user from clicking the "back" button
      // and returning to the login page.
      navigate('/dashboard', { replace: true });
    }
  }, [connected, navigate]); // The effect depends on the connection status

  const handleWalletLogin = async () => {
    // This function remains the same. It's for users who are NOT yet connected.
    if (isLoading || connected) return; // Prevent multiple connection attempts
    try {
      await connect("Petra"); // Use your desired wallet adapter name
      toast({
        title: "Success!",
        description: "Wallet connected successfully.",
      });
      // The useEffect will handle the navigation automatically after connection.
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect wallet. Please ensure Petra wallet is installed and unlocked.",
        variant: "destructive",
      });
    }
  };

  // While the wallet adapter is initializing or if we are already connected and about to redirect,
  // show a loading spinner. This prevents the login card from flashing on the screen for connected users.
  if (isLoading || connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 flex items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // This UI will only be shown to users who are truly disconnected.
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="w-full">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to continue to the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="premium"
              size="lg"
              className="w-full"
              onClick={handleWalletLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Wallet className="w-5 h-5 mr-3" />
              )}
              Connect Petra Wallet
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;