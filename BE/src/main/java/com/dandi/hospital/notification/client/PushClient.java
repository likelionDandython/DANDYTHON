package com.dandi.hospital.notification.client;

import com.dandi.hospital.notification.dto.PushMessage;
import com.dandi.hospital.notification.dto.PushSendResult;

public interface PushClient {
    PushSendResult send(PushMessage message);
}
