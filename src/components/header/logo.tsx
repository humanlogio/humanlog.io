import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export const Logo = () => {
  return (
    <NavigationMenuItem className="px-1 text-sm">
      <NavigationMenuLink href={"/"}>Humanlog</NavigationMenuLink>
    </NavigationMenuItem>
  );
};
