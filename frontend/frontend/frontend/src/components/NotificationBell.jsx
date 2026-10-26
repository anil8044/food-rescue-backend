import { useCallback, useEffect, useState } from 'react';
import { Badge, Box, Button, Divider, IconButton, Popover, Stack, Typography } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api';
import { timeAgo } from '../utils/format';

// Bell with an unread count. The backend creates the notifications automatically
// (reservations, collections, incidents, approvals); this only reads and marks them.
export default function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [anchor, setAnchor] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await notificationsApi.unread(user.id));
    } catch {
      /* the bell is not critical, so ignore failures */
    }
  }, [user.id]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  async function markRead(notification) {
    try {
      await notificationsApi.markRead(notification.id);
      setItems((previous) => previous.filter((n) => n.id !== notification.id));
    } catch {
      /* ignore */
    }
  }

  async function markAllRead() {
    try {
      await notificationsApi.markAllRead(user.id);
      setItems([]);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <IconButton
        aria-label="Notifications"
        onClick={(event) => {
          setAnchor(event.currentTarget);
          load();
        }}
        sx={{ border: '1px solid rgba(31,42,36,0.15)', borderRadius: 3 }}
      >
        <Badge badgeContent={items.length} color="secondary" max={99}>
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 340, maxHeight: 420, overflow: 'auto' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: 600 }}>Notifications</Typography>
            {items.length > 0 && (
              <Button size="small" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
          </Stack>
          <Divider />
          {items.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>
              You're all caught up.
            </Typography>
          ) : (
            items.slice(0, 10).map((n) => (
              <Box
                key={n.id}
                onClick={() => markRead(n)}
                sx={{ px: 2, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(31,42,36,0.05)' } }}
              >
                <Typography variant="body2">{n.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {timeAgo(n.createdAt)} - click to dismiss
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Popover>
    </>
  );
}
