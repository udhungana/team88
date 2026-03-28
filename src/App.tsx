import { AppProvider, useApp } from "@/context/AppContext";
import { SignUpFlow } from "@/components/SignUpFlow";
import { MainShell } from "@/components/MainShell";

function Gate() {
  const { currentUser } = useApp();
  if (!currentUser) return <SignUpFlow />;
  return <MainShell />;
}

export default function App() {
  return (
    <AppProvider>
      <Gate />
    </AppProvider>
  );
}
