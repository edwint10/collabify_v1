import RoleSelection from "@/components/role-selection"

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join Hyperbrandz
          </h1>
          <p className="text-lg text-gray-600">
            Create your account and start collaborating
          </p>
        </div>
        <RoleSelection />
      </div>
    </main>
  )
}
