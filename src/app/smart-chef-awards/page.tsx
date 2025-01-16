import { type FC } from "react";
import { type Metadata } from "next";
import { LeelEAgentUI } from "@/components/features/agent-ui";

export const metadata: Metadata = {
  title: "Smart Chef Awards | LeelE Agent",
  description: "LeelE Agent Interface",
};

const Home: FC = () => {
  return (
    <main className="min-h-screen w-full">
      <LeelEAgentUI
        apiUrl="/api/smart-chef-awards"
        title="Smart Chef Awards"
        description="Chefs guess a dish from a single ingredient of the dish you name!"
      />
    </main>
  );
};

export default Home;
