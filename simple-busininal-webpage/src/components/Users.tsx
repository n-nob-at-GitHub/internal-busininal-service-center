'use client'
import axios from 'axios'
import {
  useEffect,
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
import { type User } from '@/types/dbFunctions'
import useConfirmDialog  from '@/hooks/useConfirmDialog'
import { getAccessToken } from '@/lib/utils'

const roleBaseURL = process.env.NODE_ENV === 'production'
  ? 'https://aoby2arsjj.execute-api.ap-northeast-1.amazonaws.com'
  : '/api'

const userBaseURL = process.env.NODE_ENV === 'production'
  ? 'https://4skj5hqozf.execute-api.ap-northeast-1.amazonaws.com'
  : '/api'

const Users = () => {
  const [ validationErrors, setValidationErrors ] = useState<Record<string, string | undefined>>({})
  const [ roles, setRoles ] = useState<any>([])
  useEffect(() => {
    (async function () {
      const res = await fetchRoles()
      setRoles(res.map((v: any, k: number) => { return { id: v.id, name: v.name } }))
    })()
  }, [])

  const columns = useMemo<MRT_ColumnDef<User>[]>(
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
          accessorKey: 'mail',
          header: 'メール',
          muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.mail,
            helperText: validationErrors?.mail,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                mail: undefined,
              }),
          },  
        },
        {
          accessorKey: 'name',
          header: '名前',
        },
        {
          accessorKey: 'roleId',
          header: 'ロール',
          Cell: ({ cell }) => {
            const roleId = cell.getValue<string>()
            const role = roles.find((r: any) => String(r.id) === String(roleId))
            return role?.name ?? ''
          },
          enableSorting: false,
          editVariant: 'select',
          editSelectOptions: roles.map((r: any) => ({ label: r.name, value: r.id })),
          muiEditTextFieldProps: {
            select: true,
            error: !!validationErrors?.roleId,
            helperText: validationErrors?.roleId,
          }
        },
    ],
    [ roles, validationErrors ],
  )
  
  // call READ hook
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers()

  // call CREATE hook
  const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser()

  // call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUpdateUser()

  // call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } = useDeleteUser()

  // CREATE action
  const handleCreateUser: MRT_TableOptions<User>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const selectedRole = roles.find((r: any) => String(r.id) === String(values.roleId))
    if (!selectedRole) {
      setValidationErrors({ ...validationErrors, role: 'ロールは必須です。' });
      return;
    }
    const payload: User = {
      id: values.id,
      name: values.name,
      mail: values.mail,
      role: {
        id: String(selectedRole.id),
        name: selectedRole.name,
      }
    }
    const newValidationErrors = validateUser(payload)
    if (Object.values(newValidationErrors).some(e => e)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await createUser(payload)
    table.setCreatingRow(null) // exit creating mode
  }
  
  // UPDATE action
  const handleEditUser: MRT_TableOptions<User>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const selectedRole = roles.find((r: any) => String(r.id) === String(values.roleId));
    if (!selectedRole) {
      setValidationErrors({ ...validationErrors, role: 'ロールは必須です。' });
      return;
    }
    const payload: User = {
      id: values.id,
      name: values.name,
      mail: values.mail,
      role: {
        id: String(selectedRole.id),
        name: selectedRole.name,
      }
    }
    const newValidationErrors = validateUser(payload)
    if (Object.values(newValidationErrors).some(error => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await updateUser(payload)
    table.setEditingRow(null) // exit editing mode
  }

  // DELETE action
  // The self-made confirmation dialog was implemented using the following source as a reference. (2024/08/11).
  // https://codesandbox.io/p/devbox/my-project-7xy36j
  const { isOpen, openDialog, closeDialog, judge, ConfirmDialog } = useConfirmDialog()
  const [ targetRowId, setTargetRowId ] = useState('')
  const openDeleteConfirmModal = async (row: MRT_Row<User>) => {
    /*
    if (window.confirm('削除しますか?')) {
      deleteUser(row.original)
    }
    */
    setTargetRowId(row.original.id.toString())
    const result = await openDialog()
    if (result === 'Yes') {
      deleteUser(row.original)
    }
  }

  const table = useMaterialReactTable({
    columns,
    // data, // data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    data: fetchedUsers,
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
    muiToolbarAlertBannerProps: isLoadingUsersError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleEditUser,
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
          message={ `ユーザー ${row.original.mail} を削除しますか？` }
        />
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Typography variant='h4'>ユーザー</Typography>
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
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
      density: 'compact',
    },
  })

  // using MRT_Table instead of MaterialReactTable if we do not need any of the toolbar components or features
  return <MaterialReactTable table={ table } />
}

// READ hook (get users from api)
function useGetUsers() {
  return useQuery<User[]>({
    queryKey: [ 'users' ],
    queryFn: async () => {
      const accessToken = getAccessToken()
      const response = await axios.get(`${ userBaseURL }/user`,
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

// CREATE hook (post new user to api)
function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (user: User): Promise<User> => {
      // send api update request here
      const accessToken = getAccessToken()
      const response = await axios.post(`${ userBaseURL }/user`, user,
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
    onSuccess: (newUser: User) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.setQueryData(
        [ 'users' ],
        (prevUser: any) => 
          [
            ...prevUser,
            {
              ...newUser, 
              id: newUser.id,
            },
          ] as User[],
      )
    },
  })
}

// UPDATE hook (put user in api)
function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (user: User): Promise<User> => {
      // send api update request here
      const accessToken = getAccessToken()
      const response = await axios.put(`${ userBaseURL }/user`, user,
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
    onMutate: (newUser: User) => {
      queryClient.setQueryData([ 'users' ], (prevUsers: any) =>
        prevUsers?.map((prevUser: User) =>
          prevUser.id === newUser.id ? newUser : prevUser,
        ),
      )
    },
  })
}

// DELETE hook (delete user in api)
function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (user: User) => {
      // send api update request here
      const accessToken = getAccessToken()
      await axios.delete(`${ userBaseURL }/user/${ user.id }`,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${ accessToken }` : '',
            'Content-Type': 'application/json',
          },
        }
      )
    },
    // client side optimistic update
    onMutate: (newUser: User) => {
      queryClient.setQueryData([ 'users' ], (prevUsers: any) =>
        prevUsers?.filter((user: User) => user.id !== newUser.id),
      )
    },
  })
}

const fetchRoles: any = async () => {
  const accessToken = getAccessToken()
  const res = await axios.get(`${ roleBaseURL }/role`,
    {
      headers: {
        Authorization: accessToken ? `Bearer ${ accessToken }` : '',
        'Content-Type': 'application/json',
      },
    }
  )
  return res.data
}

const validateRequired = (value: string | number) => value !== undefined && value !== null && value !== ''

function validateUser(user: User) {
  return {
    mail: !validateRequired(user.mail) ? 'メールアドレスは必須です。' : '',
    roleId: !user.role || !validateRequired(user.role.id) ? 'ロールは必須です。' : '',
  }
}

export default Users