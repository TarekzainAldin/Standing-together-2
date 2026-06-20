import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('@/hooks/api/use-auth', () => ({ default: vi.fn() }))
vi.mock('@/components/skeleton-loaders/dashboard-skeleton', () => ({
  DashboardSkeleton: () => <div>Chargement...</div>,
}))

import useAuth from '@/hooks/api/use-auth'
import ProtectedRoute from '../protected.route'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirige vers '/' quand l'utilisateur n'est pas authentifié", () => {
    vi.mocked(useAuth).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useAuth>)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<div>Page d'accueil</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText("Page d'accueil")).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it("affiche <Outlet/> quand l'utilisateur est authentifié", () => {
    vi.mocked(useAuth).mockReturnValue({
      data: { user: { _id: 'user-1', name: 'Alice', email: 'alice@example.com' } },
      isLoading: false,
    } as ReturnType<typeof useAuth>)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<div>Page d'accueil</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByText("Page d'accueil")).not.toBeInTheDocument()
  })
})
