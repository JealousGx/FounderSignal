"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckIcon,
  Loader2,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppearanceSettingsProps {
  userId: string;
  settings: any;
}

export default function AppearanceSettings({
  userId,
  settings,
}: AppearanceSettingsProps) {
  const [theme, setTheme] = useState(settings?.appearance?.theme || "system");
  const [densityMode, setDensityMode] = useState(
    settings?.appearance?.densityMode || "comfortable"
  );
  const [isLoading, setIsLoading] = useState(false);

  const saveSettings = async () => {
    setIsLoading(true);

    try {
      // In a real app, this would save to the backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Appearance settings updated");
    } catch (error) {
      toast.error("Failed to update appearance settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the application looks and feels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Theme</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select your preferred theme for the application interface.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <ThemeOption
              value="light"
              icon={<SunIcon className="h-5 w-5" />}
              title="Light"
              selected={theme === "light"}
              onClick={() => setTheme("light")}
            />

            <ThemeOption
              value="dark"
              icon={<MoonIcon className="h-5 w-5" />}
              title="Dark"
              selected={theme === "dark"}
              onClick={() => setTheme("dark")}
            />

            <ThemeOption
              value="system"
              icon={<MonitorIcon className="h-5 w-5" />}
              title="System"
              selected={theme === "system"}
              onClick={() => setTheme("system")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Density</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adjust the compactness of the user interface.
          </p>

          <RadioGroup value={densityMode} onValueChange={setDensityMode}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="comfortable" id="comfortable" />
              <Label htmlFor="comfortable" className="font-normal">
                Comfortable
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact" className="font-normal">
                Compact
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ThemeOptionProps {
  value: string;
  icon: React.ReactNode;
  title: string;
  selected: boolean;
  onClick: () => void;
}

function ThemeOption({ icon, title, selected, onClick }: ThemeOptionProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-md border border-border p-3 cursor-pointer",
        selected ? "border-primary bg-primary-foreground" : "hover:bg-accent"
      )}
      onClick={onClick}
    >
      {selected && (
        <span className="absolute top-2 right-2 h-4 w-4 text-primary">
          <CheckIcon className="h-4 w-4" />
        </span>
      )}
      <span
        className={cn(
          "p-2 rounded-full",
          selected ? "bg-primary/10" : "bg-muted"
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}
