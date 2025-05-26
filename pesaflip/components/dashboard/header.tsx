"use client";

import { useState } from "react";
import { Topbar } from "@/components/common/Topbar";

export function Header() {
  // In a real app, this would come from your user authentication state
  const [user] = useState({
    name: "John Doe",
    email: "john@acmebusiness.co.ke",
    role: "Business Owner",
    avatar: "",
    businessName: "Acme Business Solutions",
    notifications: 3,
  });

  return <Topbar user={user} />;
} 