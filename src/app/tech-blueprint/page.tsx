import LeelEAgentUI from "@/components/features/agent-ui/LeelEAgentUI";

export const metadata = {
  title: "Technical Blueprint Generator",
  description:
    "Transform high-level software concepts into detailed technical blueprints with best practices and considerations",
};

export default function TechBlueprintPage() {
  return (
    <LeelEAgentUI
      title="Technical Blueprint Generator"
      description="Transform your software concept into a detailed technical blueprint."
      apiUrl="/api/tech-blueprint"
    />
  );
}
