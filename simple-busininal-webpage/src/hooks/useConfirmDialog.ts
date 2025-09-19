import { useCallback, useMemo, useState } from 'react'
import ConfirmDialog from '@/app/ConfirmDialog'
import { YesOrNo } from '@/types/YesOrNo'

const useConfirmDialog = () => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false)
  const [ result, setResult ] = useState<
    ((value: YesOrNo) => void) | undefined
  >(undefined)

  const judge = useCallback(
    (value: YesOrNo) => {
      setIsOpen(false)
      if (result) {
        result(value)
      }
    },
    [ result ]
  )

  const openDialog = useCallback(() => {
    setIsOpen(true)
    return new Promise<YesOrNo>((resolve) => {
      setResult(() => {
        return resolve
      })
    })
  }, [])

  const closeDialog = useCallback(() => {
    return new Promise<unknown>((resolve) => {
      setIsOpen(false)
      resolve(null)
    })
  }, [])

  return useMemo(() => {
    return {
      isOpen,
      ConfirmDialog,
      judge,
      openDialog,
      closeDialog,
    }
  }, [ isOpen, judge, openDialog, closeDialog ])
}

export default useConfirmDialog
