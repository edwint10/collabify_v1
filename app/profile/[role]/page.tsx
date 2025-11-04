import { redirect } from "next/navigation"
import CreatorProfileForm from "@/components/profile/creator-profile-form"
import BrandProfileForm from "@/components/profile/brand-profile-form"

type Role = "creator" | "brand"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ role: string }> | { role: string }
}) {
  // Handle both Promise and direct params (Next.js 14 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params
  const role = resolvedParams.role as Role

  if (role !== "creator" && role !== "brand") {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Your {role === "creator" ? "Creator" : "Brand"} Profile
          </h1>
          <p className="text-lg text-gray-600">
            {role === "creator"
              ? "Set up your creator profile to connect with brands"
              : "Set up your brand profile to find creators"}
          </p>
        </div>
        {role === "creator" ? <CreatorProfileForm /> : <BrandProfileForm />}
      </div>
    </main>
  )
}


