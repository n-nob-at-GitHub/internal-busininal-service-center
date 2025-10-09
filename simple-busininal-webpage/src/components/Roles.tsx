'use client'
import axios from 'axios'
import {
  useMemo, 
  useState,
} from 'react'
import {
  MaterialReactTable, 
  MRT_ToggleGlobalFilterButton,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table'
import {
  Box,
  IconButton,
  Typography,
} from '@mui/material'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { type Role } from '@/types/dbFunctions'
import useConfirmDialog  from '@/hooks/useConfirmDialog'
import { getAccessToken } from '@/lib/utils'

const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://aoby2arsjj.execute-api.ap-northeast-1.amazonaws.com'
  : '/api'

const Roles = () => {
  const [ validationErrors, setValidationErrors ] = useState<Record<string, string | undefined>>({})

  const columns = useMemo<MRT_ColumnDef<Role>[]>(
    () => [
        {
          accessorKey: 'id',
          header: 'No',
          enableEditing: false,
          maxSize: 30,
          Cell: ({ row }) => (
            <Box
              sx={{
                display: 'flex',
                gap: '0.5rem',
              }}
              >
              { row.index + 1 }
            </Box>
          ),
        },
        {
          accessorKey: 'name',
          header: 'ロール名',
          muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.name,
            helperText: validationErrors?.name,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                name: undefined,
              }),
          },  
        },
        {
          accessorKey: 'description',
          header: '説明',
        },
      ],
    [ validationErrors ],
  )
  
  // call READ hook
  const {
    data: fetchedRoles = [],
    isError: isLoadingRolesError,
    isFetching: isFetchingRoles,
    isLoading: isLoadingRoles,
  } = useGetRoles()

  // call CREATE hook
  const { mutateAsync: createRole, isPending: isCreatingRole } = useCreateRole()

  // call UPDATE hook
  const { mutateAsync: updateRole, isPending: isUpdatingRole } = useUpdateRole()

  // call DELETE hook
  const { mutateAsync: deleteRole, isPending: isDeletingRole } = useDeleteRole()

  // CREATE action
  const handleCreateRole: MRT_TableOptions<Role>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateRole(values)
    if (Object.values(newValidationErrors).some(error => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await createRole(values)
    table.setCreatingRow(null) // exit creating mode
  }
  
  // UPDATE action
  const handleEditRole: MRT_TableOptions<Role>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateRole(values)
    if (Object.values(newValidationErrors).some(error => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await updateRole(values)
    table.setEditingRow(null) // exit editing mode
  }

  // DELETE action
  // The self-made confirmation dialog was implemented using the following source as a reference. (2024/08/11).
  // https://codesandbox.io/p/devbox/my-project-7xy36j
  const { isOpen, openDialog, closeDialog, judge, ConfirmDialog } = useConfirmDialog()
  const [ targetRowId, setTargetRowId ] = useState('')
  const openDeleteConfirmModal = async (row: MRT_Row<Role>) => {
    /*
    if (window.confirm('削除しますか?')) {
      deleteRole(row.original)
    }
    */
    setTargetRowId(row.original.id.toString())
    const result = await openDialog()
    if (result === 'Yes') {
      deleteRole(row.original)
    }
  }

  const table = useMaterialReactTable({
    columns,
    // data, // data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    data: fetchedRoles,
    positionToolbarDropZone: 'none',
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableEditing: true,
    enableRowActions: true,
    // enableRowNumbers: true,
    enableColumnActions: false,
    enableStickyHeader: true,
    // localization: MRT_Localization_JA,
    localization: {
      actions: '',
      cancel: '',
      clearSearch: '',
      noRecordsToDisplay: '表示するレコードがありません',
      noResultsFound: '結果なし',
      rowsPerPage: '表示件数',
      save: '',
      search: '検索',
      showHideSearch: '',
      sortByColumnAsc: '',
      sortByColumnDesc: '',
      sortedByColumnAsc: '',
      sortedByColumnDesc: '',
    },
    positionActionsColumn: 'last',
    paginationDisplayMode: 'pages',
    muiPaginationProps: {
      shape: 'circular',
      variant: 'outlined',
      rowsPerPageOptions: [5, 10, 20],
    },
    getRowId: (row) => row.id?.toString(),
    muiToolbarAlertBannerProps: isLoadingRolesError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateRole,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleEditRole,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <IconButton onClick={ () => {
            table.setEditingRow(row)
          }}>
          <EditIcon />
        </IconButton>
        <IconButton color='warning' onClick={ () => openDeleteConfirmModal(row) }>
          <DeleteIcon />
        </IconButton>
        <ConfirmDialog
          isOpen={ isOpen && (targetRowId === row.original.id.toString()) }
          onClose={ closeDialog }
          judge={ judge }
          title='削除確認'
          message={ `ロール ${row.original.name} を削除しますか？` }
        />
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Typography variant='h4'>ロール</Typography>
        <IconButton color='primary' onClick={ () => table.setCreatingRow(true) }>
          <AddCircleOutline />
        </IconButton>
      </Box>
    ),
    renderToolbarInternalActions: ({ table }) => (
      <Box>
        <MRT_ToggleGlobalFilterButton table={ table } />
      </Box>
    ),
    state: {
      isLoading: isLoadingRoles,
      isSaving: isCreatingRole || isUpdatingRole || isDeletingRole,
      showAlertBanner: isLoadingRolesError,
      showProgressBars: isFetchingRoles,
      density: 'compact',
    },
  })

  // using MRT_Table instead of MaterialReactTable if we do not need any of the toolbar components or features
  return <MaterialReactTable table={ table } />
}

// READ hook (get roles from api)
function useGetRoles() {
  return useQuery<Role[]>({
    queryKey: [ 'roles' ],
    queryFn: async () => {
      const accessToken = getAccessToken()
      const response = await axios.get(`${ baseURL }/role`,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${ accessToken }` : '',
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// CREATE hook (post new role to api)
function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (role: Role): Promise<Role> => {
      // send api update request here
      const accessToken = getAccessToken()
      const response = await axios.post(`${ baseURL }/role`, role,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${ accessToken }` : '',
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    },
    // client side optimistic update
    onSuccess: (newRole: Role) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.setQueryData(
        [ 'roles' ],
        (prevRole: any) => 
          [
            ...prevRole,
            {
              ...newRole, 
              id: newRole.id,
            },
          ] as Role[],
      )
    },
  })
}

// UPDATE hook (put role in api)
function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (role: Role): Promise<Role> => {
      // send api update request here
      const accessToken = getAccessToken()
      const response = await axios.put(`${ baseURL }/role`, role,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${ accessToken }` : '',
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    },
    // client side optimistic update
    onMutate: (newRole: Role) => {
      queryClient.setQueryData([ 'roles' ], (prevRoles: any) =>
        prevRoles?.map((prevRole: Role) =>
          prevRole.id === newRole.id ? newRole : prevRole,
        ),
      )
    },
  })
}

// DELETE hook (delete role in api)
function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (role: Role) => {
      // send api update request here
      const accessToken = getAccessToken()
      await axios.delete(`${ baseURL }/role/${ role.id }`,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${ accessToken }` : '',
            'Content-Type': 'application/json',
          },
        }
      )
    },
    // client side optimistic update
    onMutate: (newRole: Role) => {
      queryClient.setQueryData([ 'roles' ], (prevRoles: any) =>
        prevRoles?.filter((role: Role) => role.id !== newRole.id),
      )
    },
  })
}

const validateRequired = (value: string | number) => value !== undefined && value !== null && value !== ''

function validateRole(role: Role) {
  return {
    name: !validateRequired(role.name) ? 'ロールは必須です。' : '',
  }
}

export default Roles