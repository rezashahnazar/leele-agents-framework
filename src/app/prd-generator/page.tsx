import { type FC } from "react";
import { type Metadata } from "next";
import { LeelEAgentUI } from "@/components/features/agent-ui";

export const metadata: Metadata = {
  title: "PRD Generator | LeelE Agent",
  description: "LeelE Agent Interface",
};

const Home: FC = () => {
  return (
    <main className="min-h-screen w-full">
      <LeelEAgentUI
        apiUrl="/api/prd-generator"
        title="PRD Generator"
        description="Transform high-level product requirements into detailed PRDs!"
      />
    </main>
  );
};

export default Home;
