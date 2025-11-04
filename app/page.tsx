import { redirect } from "next/navigation";
import RoleSelection from "@/components/role-selection";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Collabify
          </h1>
          <p className="text-lg text-gray-600">
            Where marketers and brands click, trust, and collaborate
          </p>
        </div>
        <RoleSelection />
      </div>
    </main>
  );
}


