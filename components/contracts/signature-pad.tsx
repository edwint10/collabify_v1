"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

interface SignaturePadProps {
  onSign: (signature: string) => void
  disabled?: boolean
}

export default function SignaturePad({ onSign, disabled = false }: SignaturePadProps) {
  const canvasRef = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear()
      setIsEmpty(true)
    }
  }

  const handleSave = () => {
    if (canvasRef.current && !isEmpty) {
      const dataURL = canvasRef.current.toDataURL()
      onSign(dataURL)
    }
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="border-2 border-gray-300 rounded-lg bg-white">
          <SignatureCanvas
            ref={canvasRef}
            canvasProps={{
              width: 500,
              height: 200,
              className: "signature-canvas w-full"
            }}
            onBegin={handleBegin}
            backgroundColor="rgb(255, 255, 255)"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={disabled || isEmpty}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={disabled || isEmpty}
            className="flex-1"
          >
            Save Signature
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}



