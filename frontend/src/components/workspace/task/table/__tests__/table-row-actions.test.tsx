import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('@/context/auth-provider', () => ({ useAuthContext: vi.fn() }))
vi.mock('@/hooks/use-workspace-id', () => ({ default: () => 'workspace-123' }))
vi.mock('@/lib/api', () => ({ deleteTaskMutationFn: vi.fn() }))
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}))
vi.mock('../edit-task-dialog', () => ({ default: () => null }))
vi.mock('@/components/resuable/confirm-dialog', () => ({
  ConfirmDialog: () => null,
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <div role="menuitem" onClick={onClick} className={className}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuShortcut: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}))

import { useAuthContext } from '@/context/auth-provider'
import { DataTableRowActions } from '../table-row-actions'
import { Row } from '@tanstack/react-table'
import { TaskType } from '@/types/api.type'

const mockRow = {
  original: {
    _id: 'task-1',
    taskCode: 'TASK-001',
    title: 'Tâche de test',
    status: 'TODO',
    priority: 'MEDIUM',
    project: 'project-1',
    workspace: 'workspace-123',
    assignedTo: null,
    createdBy: 'user-1',
    dueDate: null,
    createdAt: new Date().toISOString(),
  },
} as unknown as Row<TaskType>

describe('DataTableRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("Cas 6 — le bouton supprimer n'est pas affiché pour Charlie (rôle MEMBER, DELETE_TASK refusé)", () => {
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

    render(<DataTableRowActions row={mockRow} />)

    expect(screen.queryByText('taskForm.deleteTask')).not.toBeInTheDocument()
  })

  it("le bouton supprimer est affiché pour Alice (rôle OWNER, DELETE_TASK autorisé)", () => {
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

    render(<DataTableRowActions row={mockRow} />)

    expect(screen.getByText('taskForm.deleteTask')).toBeInTheDocument()
  })
})
