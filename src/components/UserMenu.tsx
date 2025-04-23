
import { useState } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const UserMenu = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <span className="hidden md:inline-block">
              {user.fullName || user.username}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user.fullName && <p className="font-medium">{user.fullName}</p>}
              {user.emailAddresses.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {user.emailAddresses[0].emailAddress}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/dashboard" className="cursor-pointer">
              Dashboard
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/account" className="cursor-pointer">
              Account Settings
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

export default UserMenu;
