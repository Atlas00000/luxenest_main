"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadFile, type UploadedFile } from "@/lib/api/upload"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  multiple?: boolean
  maxFiles?: number
  className?: string
}

export function ImageUpload({
  value = [],
  onChange,
  multiple = false,
  maxFiles = 5,
  className,
}: ImageUploadProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesToUpload = Array.from(files).slice(0, multiple ? maxFiles - value.length : 1)

    if (filesToUpload.length === 0) {
      toast({
        title: "Maximum files reached",
        description: `You can only upload up to ${maxFiles} images.`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = filesToUpload.map((file) => uploadFile(file))
      const uploadedFiles = await Promise.all(uploadPromises)
      
      // Get full URLs (API returns relative paths like /uploads/filename)
      const urls = uploadedFiles.map((file) => {
        // If URL is relative, construct full URL
        if (file.url.startsWith('/uploads/')) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
          const baseUrl = apiBaseUrl.replace('/api/v1', '')
          return `${baseUrl}${file.url}`
        }
        return file.url
      })

      onChange(multiple ? [...value, ...urls] : urls)
      
      toast({
        title: "Upload successful",
        description: `${uploadedFiles.length} image(s) uploaded successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index)
    onChange(newValue)
  }

  const canUploadMore = multiple ? value.length < maxFiles : value.length === 0

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview Images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg border overflow-hidden group">
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canUploadMore && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {value.length === 0 ? "Upload Image" : `Upload ${multiple ? "More" : "Another"} Image`}
              </>
            )}
          </Button>
          {multiple && (
            <p className="text-xs text-muted-foreground mt-2">
              {value.length} / {maxFiles} images uploaded
            </p>
          )}
        </div>
      )}

      {!canUploadMore && multiple && (
        <p className="text-sm text-muted-foreground">
          Maximum {maxFiles} images reached. Remove an image to upload more.
        </p>
      )}
    </div>
  )
}

