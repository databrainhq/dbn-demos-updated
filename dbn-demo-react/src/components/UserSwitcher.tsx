import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { User, getUsersByTenant } from '../types/user';

interface UserSwitcherProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  tenantId: string;
}

const UserSwitcher: React.FC<UserSwitcherProps> = ({ currentUser, onUserChange, tenantId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const users = getUsersByTenant(tenantId);

  const handleUserSelect = (user: User) => {
    onUserChange(user);
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-auto p-3 bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {currentUser.avatar || getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left min-w-0">
            <div className="font-medium text-sm truncate">{currentUser.name}</div>
            <div className="text-xs text-slate-400 truncate">{currentUser.role}</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 bg-white border border-slate-200 shadow-lg z-[9999]" align="start">
        <DropdownMenuLabel className="bg-slate-50">
          <div>
            <div className="font-medium text-slate-900">Switch User (Demo)</div>
            <div className="text-xs text-slate-600 font-normal">
              Experience different permission levels
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200" />

        {users.map(user => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => handleUserSelect(user)}
            className="p-3 cursor-pointer hover:bg-slate-100 focus:bg-slate-100"
          >
            <div className="flex items-center gap-3 w-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                  {user.avatar || getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.role}</div>
                <div className="text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {user.permissions.filter(p => p.enabled).length} permissions
                  </Badge>
                </div>
              </div>
              {user.id === currentUser.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-slate-200" />
        <DropdownMenuLabel className="bg-slate-50">
          <div className="text-xs text-slate-600 font-normal">
            Demo: Switch between personas to see different capabilities
          </div>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserSwitcher;