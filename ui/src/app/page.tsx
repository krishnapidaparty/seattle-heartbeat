"use client";

import { SplitLayout } from "@/core/components/layout/SplitLayout";
import { ChatSidebar } from "@/core/components/chat/ChatSidebar";
import { NeighborhoodDashboard } from "@/core/components/relay/NeighborhoodDashboard";

export default function Home() {
  return (
    <SplitLayout main={<NeighborhoodDashboard />} sidebar={<ChatSidebar />} />
  );
}
