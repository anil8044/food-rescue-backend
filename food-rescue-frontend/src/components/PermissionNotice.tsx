import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
export default function PermissionNotice() {
  const location = useLocation()
  const navigate = useNavigate()
  const denied = (location.state as { denied?: boolean } | null)?.denied === true
  const close = () => navigate(location.pathname + location.search + location.hash, { replace: true, state: null })
  return (
    <Dialog open={denied} onClose={close} aria-describedby="permission-notice">
      <DialogContent><DialogContentText id="permission-notice">无权限</DialogContentText></DialogContent>
      <DialogActions><Button onClick={close} autoFocus>确定</Button></DialogActions>
    </Dialog>
  )
}

