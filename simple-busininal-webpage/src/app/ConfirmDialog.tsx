'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'
import { YesOrNo } from '@/types/YesOrNo'

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  judge,
  onClose,
}: {
  isOpen: boolean
  title: string
  message: string
  judge: (result: YesOrNo) => void
  onClose: () => Promise<unknown>
}) => {
  return (
    <Dialog open={ isOpen } onClose={ onClose }>
      <DialogTitle>{ title }</DialogTitle>
      <DialogContent>
        <DialogContentText>{ message }</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={ () => judge('No') } variant='outlined'>キャンセル</Button>
        <Button onClick={ () => judge('Yes') } autoFocus>実行</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog
