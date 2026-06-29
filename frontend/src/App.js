import { Toaster } from "sonner";
import PredictPage from "@/pages/PredictPage";

function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <PredictPage />
      <Toaster position="top-right" theme="light" />
    </div>
  );
}

export default App;
