import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationBadgeProps {
  verified?: boolean
  className?: string
  showText?: boolean
}

export default function VerificationBadge({ 
  verified = false, 
  className,
  showText = true 
}: VerificationBadgeProps) {
  if (!verified) return null

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium",
      className
    )}>
      <CheckCircle2 className="h-3.5 w-3.5" />
      {showText && <span>Verified</span>}
    </div>
  )
}

