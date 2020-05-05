from .models import Notification, NotificationType
from .exceptions import NotificationException
from channels.layers import get_channel_layer
from .consumers import NOTIFICATION_GROUP_NAME
from asgiref.sync import async_to_sync
from .serializers import NotificationSerializer
from rest_framework.renderers import JSONRenderer

def get_notification_by_id(notification_id: str) -> Notification:
    try:
        incident = Notification.objects.get(id=notification_id)
        if incident is None:
            raise NotificationException("Invalid incident id")
    except:
        raise NotificationException("Invalid incident id")

    return incident

def read_notification(notification: Notification):
    notification.is_read = True
    notification.save()

def add_notification(notification_type: NotificationType, actioned_by, send_to, incident=None):
    notification = Notification(
        notification_type=notification_type.name,
        send_to=send_to,
        actioned_by=actioned_by,
        incident=incident
    )
    notification.save()

    serializer = NotificationSerializer(notification)

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        NOTIFICATION_GROUP_NAME,
        {
            'type': 'notify',
            'payload': serializer.data,
            'send_to': send_to.id
        }
    )
