import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getEnvUrl,
  getNewEnvUrl,
  getOrgSettingsUrl,
} from "@/lib/utils/navigation";
import { MoreHorizontal, Plus, Settings } from "lucide-react";
import Link from "next/link";

interface Environment {
  id: string;
  name: string;
  status: "active" | "inactive";
  lastUpdated: string;
  // Add other environment properties as needed
}

interface OrgDashboardProps {
  orgName: string;
}

export function OrgDashboard({ orgName }: OrgDashboardProps) {
  // This would typically come from an API
  const environments: Environment[] = [
    {
      id: "1",
      name: "production",
      status: "active",
      lastUpdated: "2024-03-14T12:00:00Z",
    },
    {
      id: "2",
      name: "staging",
      status: "active",
      lastUpdated: "2024-03-13T15:30:00Z",
    },
    // Add more environments as needed
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold">{orgName}</h2>
          <p className="text-muted-foreground">
            Manage your environments in {orgName}
          </p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Button asChild>
            <Link href={getOrgSettingsUrl(orgName)}>
              <Settings className="mr-2 h-4 w-4" />
              Organization Settings
            </Link>
          </Button>
          <Button asChild>
            <Link href={getNewEnvUrl(orgName)}>
              <Plus className="mr-2 h-4 w-4" />
              New Environment
            </Link>
          </Button>
        </div>
      </div>

      {/* Environments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {environments.map((env) => (
          <Link key={env.id} href={getEnvUrl(env.name, orgName)}>
            <Card className="text-text dark:text-darkText">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  {env.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={getEnvUrl(env.name, orgName)}>
                        View Environment
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`${getEnvUrl(env.name, orgName)}/edit`}>
                        Environment Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <span
                      className={`text-sm font-medium ${
                        env.status === "active"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {env.status.charAt(0).toUpperCase() + env.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-sm">
                      {new Date(env.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Add more environment details as needed */}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
