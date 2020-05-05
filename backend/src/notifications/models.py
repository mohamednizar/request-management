from django.db import models
from django.contrib.auth.models import User
import enum
import uuid

class NotificationType(enum.Enum):
    INCIDENT_ASSIGNED="Incident assigned"
    INCIDENT_CLOSED="Incident closed"
    OTHER = "Custom notification type"

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    notification_type = models.CharField(max_length=50, choices=[(tag.name, tag.value) for tag in NotificationType])

    is_read = models.BooleanField(default=False)

    send_to = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='notifications', null=True, blank=True)

    actioned_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name='actioned_notifications', 
                                        null=True, blank=True)

    incident = models.ForeignKey("incidents.Incident", on_delete=models.DO_NOTHING, null=True, blank=True)

    custom_messsage = models.TextField(null=True, blank=True)

    created_date = models.DateTimeField(auto_now_add=True)

    