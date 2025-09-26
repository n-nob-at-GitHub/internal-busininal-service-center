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
  Switch,
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
import { type Material } from '@/types/dbFunctions'
import useConfirmDialog  from '@/hooks/useConfirmDialog'

const Materials = () => {
  const [ validationErrors, setValidationErrors ] = useState<Record<string, string | undefined>>({})
  const [ manufacturers, setManufacturers ] = useState<any>([])
  useEffect(() => {
    (async function () {
      const res = await fetchManufacturers()
      setManufacturers(res.map((v: any, k: number) => { return { id: v.id, name: v.name } }))
    })()
  }, [])

  const columns = useMemo<MRT_ColumnDef<Material>[]>(
    () => [
        {
          accessorKey: 'id',
          header: 'No',
          enableEditing: false,
          maxSize: 30,
          Cell: ({ renderedCellValue, row }) => (
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
          header: 'メーカー',
          id: 'manufacturer',
          maxSize: 100,
          accessorFn: (row) => manufacturers.find((m: any) => m.id === Number(row.manufacturerId))?.name ?? '',
          Cell: ({ renderedCellValue }) => renderedCellValue,
          enableSorting: false,
          editVariant: 'select',
          editSelectOptions: manufacturers.map((v: any) => { return { label: v.name, value: v.id } }),
          muiEditTextFieldProps: {
            select: true,
            error: !!validationErrors?.manufacturerId,
            helperText: validationErrors?.manufacturerId,
          },
        },
        {
          accessorKey: 'code',
          header: '資材コード',
          maxSize: 30,
          muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.code,
            helperText: validationErrors?.code,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                code: undefined,
              }),
          },  
        },
        {
          accessorKey: 'category',
          header: 'カテゴリー',
          muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.category,
            helperText: validationErrors?.category,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                category: undefined,
              }),
          },  
        },
        {
          accessorKey: 'price',
          header: '単価',
          maxSize: 50,
          muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.price,
            helperText: validationErrors?.price,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                price: undefined,
              }),
          },  
        },
        {
          accessorKey: 'quantity',
          header: '個数',
          maxSize: 30,
          muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.quantity,
            helperText: validationErrors?.quantity,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                quantity: undefined,
              }),
          },  
        },
        {
          accessorKey: 'unit',
          header: '単位',
          maxSize: 30,
          muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.unit,
            helperText: validationErrors?.unit,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                unit: undefined,
              }),
          },  
        },
        {
          accessorKey: 'name',
          header: '製品名',
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
          accessorKey: 'fileName',
          header: '画像ファイル',
        },
        {
          accessorKey: 'isValid',
          header: '有効／無効',
          Cell: ({ row }) => (
            <Switch
              checked={ row.original.isValid }
              onChange={ async (e) => { await updateMaterial({ ...row.original, isValid: e.target.checked, })}}
              color='primary'
            />
          ),
        },
      ],
    [ manufacturers, validationErrors ],
  )
  
  // call READ hook
  const {
    data: fetchedMaterials = [],
    isError: isLoadingMaterialsError,
    isFetching: isFetchingMaterials,
    isLoading: isLoadingMaterials,
  } = useGetMaterials()

  // call CREATE hook
  const { mutateAsync: createMaterial, isPending: isCreatingMaterial } = useCreateMaterial()

  // call UPDATE hook
  const { mutateAsync: updateMaterial, isPending: isUpdatingMaterial } = useUpdateMaterial()

  // call DELETE hook
  const { mutateAsync: deleteMaterial, isPending: isDeletingMaterial } = useDeleteMaterial()

  // CREATE action
  const handleCreateMaterial: MRT_TableOptions<Material>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateMaterial(values)
    if (Object.values(newValidationErrors).some(error => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await createMaterial(values)
    table.setCreatingRow(null) // exit creating mode
  }
  
  // UPDATE action
  const handleEditMaterial: MRT_TableOptions<Material>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateMaterial(values)
    if (Object.values(newValidationErrors).some(error => error)) {
      setValidationErrors(newValidationErrors)
      return
    }
    setValidationErrors({})
    await updateMaterial(values)
    table.setEditingRow(null) // exit editing mode
  }

  // DELETE action
  // The self-made confirmation dialog was implemented using the following source as a reference. (2024/08/11).
  // https://codesandbox.io/p/devbox/my-project-7xy36j
  const { isOpen, openDialog, closeDialog, judge, ConfirmDialog } = useConfirmDialog()
  const [ targetRowId, setTargetRowId ] = useState('')
  const openDeleteConfirmModal = async (row: MRT_Row<Material>) => {
    /*
    if (window.confirm('削除しますか?')) {
      deleteMaterial(row.original)
    }
    */
    setTargetRowId(row.original.id.toString())
    const result = await openDialog()
    if (result === 'Yes') {
      deleteMaterial(row.original)
    }
  }

  const table = useMaterialReactTable({
    columns,
    // data, // data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    data: fetchedMaterials,
    positionToolbarDropZone: 'none',
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    enableGlobalFilter: true,
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
    muiTableBodyRowProps: ({ row }) => ({
      sx: row.original.isValid
      ? {}
      : {
          backgroundColor: '#f5f5f5',
          color: '#9e9e9e',
          '& .MuiTableCell-root': {
            color: '#9e9e9e',
          },
        },
    }),
    muiToolbarAlertBannerProps: isLoadingMaterialsError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateMaterial,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleEditMaterial,
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
          message={ `資材 ${row.original.name} を削除しますか？` }
        />
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
        <Typography variant='h4'>資材</Typography>
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
      isLoading: isLoadingMaterials,
      isSaving: isCreatingMaterial || isUpdatingMaterial || isDeletingMaterial,
      showAlertBanner: isLoadingMaterialsError,
      showProgressBars: isFetchingMaterials,
      density: 'compact',
    },
  })

  // using MRT_Table instead of MaterialReactTable if we do not need any of the toolbar components or features
  return <MaterialReactTable table={ table } />
}

// READ hook (get materials from api)
function useGetMaterials() {
  return useQuery<Material[]>({
    queryKey: [ 'materials' ],
    queryFn: async () => {
      const response = await axios.get('/api/material')
      return response.data
    },
    refetchOnWindowFocus: false,
  })
}

// CREATE hook (post new material to api)
function useCreateMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (material: Material): Promise<Material> => {
      // send api update request here
      const payload = {
        ...material,
        price: Number(material.price),
        quantity: Number(material.quantity),
      };
      const response = await axios.post('/api/material', payload)
      return response.data
    },
    // client side optimistic update
    onSuccess: (newMaterial: Material) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      queryClient.setQueryData(
        [ 'materials' ],
        (prevMaterial: any) => 
          [
            ...prevMaterial,
            {
              ...newMaterial, 
              id: newMaterial.id,
            },
          ] as Material[],
      )
    },
  })
}

// UPDATE hook (put material in api)
function useUpdateMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (material: Material): Promise<Material> => {
      // send api update request here
      const payload = {
        ...material,
        price: Number(material.price),
        quantity: Number(material.quantity),
      };
      const response = await axios.put('/api/material', payload)
      return response.data
    },
    // client side optimistic update
    onMutate: (newMaterial: Material) => {
      queryClient.setQueryData([ 'materials' ], (prevMaterials: any) =>
        prevMaterials?.map((prevMaterial: Material) =>
          prevMaterial.id === newMaterial.id ? newMaterial : prevMaterial,
        ),
      )
    },
  })
}

// DELETE hook (delete material in api)
function useDeleteMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (material: Material) => {
      // send api update request here
      await axios.delete(`/api/material/${material.id}`)
    },
    // client side optimistic update
    onMutate: (newMaterial: Material) => {
      queryClient.setQueryData([ 'materials' ], (prevMaterials: any) =>
        prevMaterials?.filter((material: Material) => material.id !== newMaterial.id),
      )
    },
  })
}

const fetchManufacturers: any = async () => {
  const res = await axios.get('/api/manufacturer')
  return res.data
}

const validateRequired = (value: string | number) => value !== undefined && value !== null && value !== ''

const validatePrice = (price: string) =>
  !!price?.length && 
  price
    .match(
      /^([1-9１-９]\d*|[0０])$/,
    )

const validateQuantity = (quantity: string) =>
  !!quantity?.length && 
  quantity
    .match(
      /^([1-9１-９]\d*)$/,
    )

function validateMaterial(material: Material) {
  return {
    manufacturerId: !validateRequired(material.manufacturerId) ? 'メーカーは必須です。' : '',
    code: !validateRequired(material.code) ? '資材コードは必須です。' : '',
    category: !validateRequired(material.category) ? 'カテゴリーは必須です。' : '',
    price: !validatePrice(material.price.toString()) ? '０円以上の単価を入力してください。' : '',
    quantity: !validateQuantity(material.quantity.toString()) ? '１以上の数量を入力してください。' : '',
    unit: !validateRequired(material.unit) ? '単位は必須です。' : '',
    name: !validateRequired(material.name) ? '名前は必須です。' : '',
  }
}

export default Materials