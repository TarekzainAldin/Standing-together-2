import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('@/context/auth-provider', () => ({ useAuthContext: vi.fn() }))
vi.mock('@/hooks/use-workspace-id', () => ({ default: vi.fn() }))

import { useAuthContext } from '@/context/auth-provider'
import useWorkspaceId from '@/hooks/use-workspace-id'
import withPermission from '../with-permission'

describe('withPermission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useWorkspaceId).mockReturnValue('workspace-123')
  })

  it("Cas 6 — bloque le rendu et navigue quand hasPermission retourne false (rôle MEMBER — Charlie)", () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: { _id: 'user-2', name: 'Charlie', email: 'charlie@example.com', profilePicture: null, isActive: true as const, lastLogin: null, createdAt: new Date(), updatedAt: new Date(), currentWorkspace: { _id: 'workspace-123', name: 'Test', owner: 'user-1', inviteCode: 'abc' } },
      hasPermission: () => false,
      isLoading: false,
      error: null,
      isFetching: false,
      workspaceLoading: false,
      refetchAuth: vi.fn(),
      refetchWorkspace: vi.fn(),
    } as ReturnType<typeof useAuthContext>)

    const PageProtegee = withPermission(
      () => <div>Page protégée</div>,
      'DELETE_TASK'
    )

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<PageProtegee />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByText('Page protégée')).not.toBeInTheDocument()
  })

  it("affiche le composant quand hasPermission retourne true (rôle OWNER — Alice)", () => {
    vi.mocked(useAuthContext).mockReturnValue({
      user: { _id: 'user-1', name: 'Alice', email: 'alice@example.com', profilePicture: null, isActive: true as const, lastLogin: null, createdAt: new Date(), updatedAt: new Date(), currentWorkspace: { _id: 'workspace-123', name: 'Test', owner: 'user-1', inviteCode: 'abc' } },
      hasPermission: () => true,
      isLoading: false,
      error: null,
      isFetching: false,
      workspaceLoading: false,
      refetchAuth: vi.fn(),
      refetchWorkspace: vi.fn(),
    } as ReturnType<typeof useAuthContext>)

    const PageProtegee = withPermission(
      () => <div>Page protégée</div>,
      'DELETE_TASK'
    )

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<PageProtegee />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Page protégée')).toBeInTheDocument()
  })
})
