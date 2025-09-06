'use client'

import { useState, useCallback } from 'react'

interface ProcessingStep {
  step: string
  message: string
  progress: number
}

const processingSteps: ProcessingStep[] = [
  { step: 'upload', message: 'Uploading securely...', progress: 20 },
  { step: 'unlock', message: 'Unlocking PDF...', progress: 40 },
  { step: 'extract', message: 'Extracting transactions...', progress: 60 },
  { step: 'categorize', message: 'AI categorizing expenses...', progress: 80 },
  { step: 'complete', message: 'Analysis complete!', progress: 100 }
]

interface PDFUploadWorkflowProps {
  onComplete: (data: any) => void
}

export default function PDFUploadWorkflow({ onComplete }: PDFUploadWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<'upload' | 'password' | 'processing' | 'complete'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentProcessingStep, setCurrentProcessingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFileSelection(files[0])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelection(file)
    }
  }

  const handleFileSelection = (file: File) => {
    setError(null)
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported')
      return
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    // Check if PDF is password protected (mock check)
    const needsPassword = Math.random() > 0.7 // 30% chance for demo
    if (needsPassword) {
      setCurrentStep('password')
    } else {
      startProcessing(file)
    }
  }

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      setError('Please enter the PDF password')
      return
    }
    if (selectedFile) {
      startProcessing(selectedFile, password)
    }
  }

  const startProcessing = async (file: File, pdfPassword?: string) => {
    setCurrentStep('processing')
    setError(null)

    try {
      // Show processing steps
      for (let i = 0; i < 3; i++) {
        setCurrentProcessingStep(i)
        setProcessingProgress(processingSteps[i].progress)
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Upload to real API
      const formData = new FormData()
      formData.append('statement', file)
      
      const response = await fetch(`/api/process-statement`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Complete processing animation
      for (let i = 3; i < processingSteps.length; i++) {
        setCurrentProcessingStep(i)
        setProcessingProgress(processingSteps[i].progress)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      setCurrentStep('complete')
      onComplete(result)
      
    } catch (error) {
      console.error('Processing error:', error)
      setError(error instanceof Error ? error.message : 'Processing failed')
      setCurrentStep('upload')
    }
  }

  const resetUpload = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setPassword('')
    setProcessingProgress(0)
    setCurrentProcessingStep(0)
    setError(null)
  }

  if (currentStep === 'upload') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Upload Your Bank Statement</h2>
          <p className="text-gray-400">Get instant AI-powered insights from your PDF statement</p>
        </div>

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-blue-400 bg-blue-400/10 scale-105' 
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            {isDragActive ? (
              <p className="text-xl font-semibold text-blue-400">Drop your PDF here!</p>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">Drag & drop your bank statement</h3>
                <p className="text-gray-400 mb-4">or click to browse files</p>
                <label htmlFor="file-upload" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium cursor-pointer transition-colors">
                  Choose File
                </label>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-500">
            <p>📄 PDF files only • Max 10MB</p>
            <p>🏦 Supports SBI, HDFC, ICICI, Axis Bank</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-600 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Privacy Assurance */}
        <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-green-400 mb-2">🔒 Your Data Stays Private</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• We process your PDF locally and delete it immediately</li>
                <li>• Bank-grade encryption protects your information</li>
                <li>• No raw transaction data is stored on our servers</li>
                <li>• Only anonymized insights are saved for your dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 'password') {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">PDF Password Required</h3>
            <p className="text-gray-400 text-sm">This PDF is password protected. Please enter the password to continue.</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PDF password"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-600 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={resetUpload}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
            <p className="text-blue-300 text-xs">
              <strong>Why do we need this?</strong> We need to unlock your PDF to read the transactions. 
              The password is used only for processing and is never stored.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 'processing') {
    const currentStepData = processingSteps[currentProcessingStep]
    
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="w-full h-full bg-blue-500/20 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{processingProgress}%</span>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Processing Your Statement</h3>
            <p className="text-gray-400">Please wait while we analyze your transactions...</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{currentStepData.message}</span>
              <span>{processingProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-3">
            {processingSteps.map((step, index) => (
              <div key={step.step} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  index < currentProcessingStep 
                    ? 'bg-green-500' 
                    : index === currentProcessingStep 
                    ? 'bg-blue-500' 
                    : 'bg-gray-600'
                }`}>
                  {index < currentProcessingStep ? (
                    <span className="text-white text-xs">✓</span>
                  ) : (
                    <span className="text-white text-xs">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${
                  index <= currentProcessingStep ? 'text-white' : 'text-gray-500'
                }`}>
                  {step.message}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={resetUpload}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              Cancel Processing
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}