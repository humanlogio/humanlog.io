"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAPIURL } from "@/lib/envs";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("new") === "true";
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [suggestedUsername, setSuggestedUsername] = useState("");
  const [plan, setPlan] = useState("free");
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingUsername, setIsGettingUsername] = useState(true);

  useEffect(() => {
    const fetchGitHubUsername = async () => {
      try {
        const response = await fetch(
          `${getAPIURL()}/api/v1/auth/github/username`,
          {
            credentials: "include",
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.username) {
            setSuggestedUsername(data.username);
            setUsername(data.username);
          }
        }
      } catch (error) {
        console.error("Error fetching GitHub username:", error);
      } finally {
        setIsGettingUsername(false);
      }
    };

    if (isNewUser) {
      fetchGitHubUsername();
    } else {
      setIsGettingUsername(false);
    }
  }, [isNewUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${getAPIURL()}/api/v1/user/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          plan,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      toast({
        title: "Setup complete!",
        description: "Your Humanlog account is ready to use.",
      });

      router.push("/localhost/query");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Something went wrong",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isNewUser) {
    router.push("/");
    return null;
  }

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Humanlog!</CardTitle>
          <CardDescription>
            Let's set up your account to get the most out of Humanlog.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Choose a username</Label>
              {isGettingUsername ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    Getting suggestion...
                  </span>
                </div>
              ) : (
                <>
                  <Input
                    id="username"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  {suggestedUsername && (
                    <p className="text-muted-foreground text-xs">
                      Suggested from your GitHub account: {suggestedUsername}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label>Choose your plan</Label>
              <RadioGroup
                value={plan}
                onValueChange={setPlan}
                className="space-y-2"
              >
                <div className="flex items-start space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="free" id="free" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="free" className="font-medium">
                      Free Plan
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Perfect for personal use and exploring Humanlog's
                      features.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="pro" id="pro" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="pro" className="font-medium">
                      Pro Plan
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      For commercial use with advanced features and priority
                      support.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isGettingUsername}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
