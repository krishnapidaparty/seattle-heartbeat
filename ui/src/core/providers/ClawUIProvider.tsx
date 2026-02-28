"use client";

import { type ReactNode, useMemo } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { ModeProvider } from "./ModeContext";
import { MentionContextProvider } from "./MentionContext";
import { AgentAttributionProvider } from "./AgentAttributionContext";
import { AGENTS } from "@/core/lib/agents";

interface ClawUIProviderProps {
  children: ReactNode;
}

export function ClawUIProvider({ children }: ClawUIProviderProps) {
  const agentRegistry = useMemo(() => {
    return Object.values(AGENTS).reduce<
      Record<string, { id: string; label: string; color: string }>
    >((acc, agent) => {
      acc[agent.id] = {
        id: agent.id,
        label: agent.label,
        color: agent.color,
      };
      return acc;
    }, {});
  }, []);

  return (
    <ModeProvider>
      <MentionContextProvider>
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agents__unsafe_dev_only={agentRegistry}
        >
          <AgentAttributionProvider>{children}</AgentAttributionProvider>
        </CopilotKit>
      </MentionContextProvider>
    </ModeProvider>
  );
}
