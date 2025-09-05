'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  processing?: boolean
}

export default function FileUpload({ onFileSelect, processing }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  })

  const removeFile = () => {
    setSelectedFile(null)
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Bank Statement</h3>
          <p className="text-gray-400 mb-4">
            Drag & drop your PDF statement or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supports SBI, HDFC, ICICI, Axis Bank statements
          </p>
        </div>
      ) : (
        <div className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary-400" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {!processing && (
            <button onClick={removeFile} className="text-gray-400 hover:text-red-400">
              <X size={20} />
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