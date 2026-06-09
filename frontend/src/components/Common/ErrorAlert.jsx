import React from 'react'
import { XCircleIcon } from '@heroicons/react/24/outline'

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <XCircleIcon className="h-5 w-5 text-red-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-red-400 hover:text-red-600">
            <XCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorAlert