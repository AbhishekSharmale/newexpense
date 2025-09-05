'use client'

import { useCallback, useState } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  processing?: boolean
}

export default function FileUpload({ onFileSelect, processing }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-gray-500 transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="w-12 h-12 text-gray-400 mx-auto mb-4 text-4xl">📄</div>
            <h3 className="text-lg font-semibold mb-2">Upload Bank Statement</h3>
            <p className="text-gray-400 mb-4">
              Click to browse and select your PDF statement
            </p>
            <p className="text-sm text-gray-500">
              Supports SBI, HDFC, ICICI, Axis Bank statements
            </p>
          </label>
        </div>
      ) : (
        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-primary-400 text-2xl">📄</div>
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {!processing && (
            <button onClick={removeFile} className="text-gray-400 hover:text-red-400">
              ✕
            </button>
          )}
        </div>
      )}
      
      {processing && (
        <div className="mt-4 p-4 bg-primary-900/20 rounded-lg border border-primary-600">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-400"></div>
            <span className="text-primary-300">Processing your statement...</span>
          </div>
        </div>
      )}
    </div>
  )
}