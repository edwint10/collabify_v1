"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Instagram, Video, Globe, Linkedin } from "lucide-react"

export interface SocialLinks {
  instagram?: string
  tiktok?: string
  youtube?: string
  twitter?: string
  linkedin?: string
  website?: string
}

interface SocialLinksEditorProps {
  value: SocialLinks
  onChange: (links: SocialLinks) => void
  disabled?: boolean
}

const platforms = [
  {
    key: "instagram" as const,
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/yourhandle",
    color: "text-pink-600",
  },
  {
    key: "tiktok" as const,
    label: "TikTok",
    icon: Video,
    placeholder: "https://tiktok.com/@yourhandle",
    color: "text-gray-900 dark:text-white",
  },
  {
    key: "youtube" as const,
    label: "YouTube",
    icon: Video,
    placeholder: "https://youtube.com/@yourchannel",
    color: "text-red-600",
  },
  {
    key: "twitter" as const,
    label: "X / Twitter",
    icon: Globe,
    placeholder: "https://x.com/yourhandle",
    color: "text-gray-900 dark:text-white",
  },
  {
    key: "linkedin" as const,
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/in/yourprofile",
    color: "text-blue-700",
  },
  {
    key: "website" as const,
    label: "Website",
    icon: Globe,
    placeholder: "https://yourwebsite.com",
    color: "text-gray-600 dark:text-gray-400",
  },
]

export default function SocialLinksEditor({ value, onChange, disabled }: SocialLinksEditorProps) {
  const handleChange = (key: keyof SocialLinks, url: string) => {
    onChange({ ...value, [key]: url || undefined })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Social Media Links</Label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Add your social media profile URLs
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const Icon = platform.icon
          return (
            <div key={platform.key} className="space-y-1.5">
              <Label htmlFor={`social-${platform.key}`} className="flex items-center gap-2 text-sm">
                <Icon className={`h-4 w-4 ${platform.color}`} />
                {platform.label}
              </Label>
              <Input
                id={`social-${platform.key}`}
                type="url"
                placeholder={platform.placeholder}
                value={value[platform.key] || ""}
                onChange={(e) => handleChange(platform.key, e.target.value)}
                disabled={disabled}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
