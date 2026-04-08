import { Suspense } from 'react'
import PropertiesPage from './properties-page'

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">
      <p className="text-2xl text-gray-500">Loading properties...</p>
    </div>}>
      <PropertiesPage />
    </Suspense>
  )
}