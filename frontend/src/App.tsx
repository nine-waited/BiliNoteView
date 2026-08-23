import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useCloudNotes } from '@/hooks/useCloudNotes.ts'
import Index from '@/pages/Index.tsx'
import { HomePage } from './pages/HomePage/Home.tsx'
import { resolveRouterBasename } from '@/utils/basePath'

function App() {
  useCloudNotes(30000)

  return (
    <BrowserRouter basename={resolveRouterBasename()}>
      <Routes>
        <Route path="/" element={<Index />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
