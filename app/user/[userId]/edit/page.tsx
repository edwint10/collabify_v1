import { notFound, redirect } from 'next/navigation'
import CreatorProfileFormEdit from '@/components/profile/creator-profile-form-edit'
import BrandProfileFormEdit from '@/components/profile/brand-profile-form-edit'

async function getProfile(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profiles/${userId}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export default async function UserProfileEditPage({
  params,
}: {
  params: { userId: string }
}) {
  const data = await getProfile(params.userId)

  if (!data || !data.user) {
    notFound()
  }

  const { user, profile } = data

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {user.role === 'creator' ? (
          <CreatorProfileFormEdit 
            userId={user.id} 
            initialData={profile || undefined}
          />
        ) : user.role === 'brand' ? (
          <BrandProfileFormEdit 
            userId={user.id} 
            initialData={profile || undefined}
          />
        ) : (
          notFound()
        )}
      </div>
    </main>
  )
}

