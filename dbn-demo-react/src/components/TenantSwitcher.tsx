import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, Check } from "lucide-react";
import { Tenant, TENANTS } from '../types/user';

interface TenantSwitcherProps {
  currentTenantId: string;
  onTenantChange: (tenant: Tenant) => void;
}

const TenantSwitcher: React.FC<TenantSwitcherProps> = ({ currentTenantId, onTenantChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentTenant = TENANTS.find(t => t.id === currentTenantId) || TENANTS[0];

  const handleTenantSelect = (tenant: Tenant) => {
    onTenantChange(tenant);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-auto p-3 bg-white border-slate-300 hover:bg-slate-50"
        >
          <Building2 className="h-5 w-5 text-primary" />
          <div className="flex-1 text-left">
            <div className="font-semibold text-sm">{currentTenant.name}</div>
            <div className="text-xs text-slate-500">{currentTenant.description}</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 bg-white border border-slate-200 shadow-lg z-[9999]" align="start">
        <DropdownMenuLabel className="bg-slate-50">
          <div>
            <div className="font-medium text-slate-900">Switch Tenant</div>
            <div className="text-xs text-slate-600 font-normal">
              Change organization context
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200" />

        {TENANTS.map(tenant => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleTenantSelect(tenant)}
            className="p-3 cursor-pointer hover:bg-slate-100 focus:bg-slate-100"
          >
            <div className="flex items-center gap-3 w-full">
              <Building2 className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="font-medium text-sm">{tenant.name}</div>
                <div className="text-xs text-muted-foreground">{tenant.description}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {tenant.users.length} users • Client ID: {tenant.id}
                  </Badge>
                </div>
              </div>
              {tenant.id === currentTenantId && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-slate-200" />
        <DropdownMenuLabel className="bg-slate-50">
          <div className="text-xs text-slate-600 font-normal">
            Demo: Each tenant has isolated dashboards and users
          </div>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TenantSwitcher;
