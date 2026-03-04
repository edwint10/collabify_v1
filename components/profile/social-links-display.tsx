import { Instagram, Video, Globe, Linkedin, ExternalLink } from "lucide-react"

interface SocialLinks {
  instagram?: string
  tiktok?: string
  youtube?: string
  twitter?: string
  linkedin?: string
  website?: string
}

interface SocialLinksDisplayProps {
  socialLinks: SocialLinks | null | undefined
}

const platforms = [
  {
    key: "instagram" as const,
    label: "Instagram",
    icon: Instagram,
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
    hoverColor: "hover:bg-pink-100 dark:hover:bg-pink-900/30",
  },
  {
    key: "tiktok" as const,
    label: "TikTok",
    icon: Video,
    color: "text-gray-900 dark:text-white",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    hoverColor: "hover:bg-gray-200 dark:hover:bg-gray-700",
  },
  {
    key: "youtube" as const,
    label: "YouTube",
    icon: Video,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    hoverColor: "hover:bg-red-100 dark:hover:bg-red-900/30",
  },
  {
    key: "twitter" as const,
    label: "X / Twitter",
    icon: Globe,
    color: "text-gray-900 dark:text-white",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    hoverColor: "hover:bg-gray-200 dark:hover:bg-gray-700",
  },
  {
    key: "linkedin" as const,
    label: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-700",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    hoverColor: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
  },
  {
    key: "website" as const,
    label: "Website",
    icon: Globe,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    hoverColor: "hover:bg-gray-200 dark:hover:bg-gray-700",
  },
]

function extractUsername(url: string, platform: string): string {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.replace(/^\//, "").replace(/\/$/, "")
    if (platform === "website") return parsed.hostname
    // Remove common prefixes like "in/" for LinkedIn
    const cleaned = path.replace(/^(in|company|channel)\//i, "")
    return cleaned.startsWith("@") ? cleaned : `@${cleaned}`
  } catch {
    return url
  }
}

export default function SocialLinksDisplay({ socialLinks }: SocialLinksDisplayProps) {
  if (!socialLinks) return null

  const activeLinks = platforms.filter((p) => socialLinks[p.key])

  if (activeLinks.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Social Media
      </h3>
      <div className="flex flex-wrap gap-2">
        {activeLinks.map((platform) => {
          const Icon = platform.icon
          const url = socialLinks[platform.key]!
          const username = extractUsername(url, platform.key)

          return (
            <a
              key={platform.key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${platform.bgColor} ${platform.hoverColor}`}
            >
              <Icon className={`h-4 w-4 ${platform.color}`} />
              <span className="text-gray-900 dark:text-gray-100">{username}</span>
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </a>
          )
        })}
      </div>
    </div>
  )
}
