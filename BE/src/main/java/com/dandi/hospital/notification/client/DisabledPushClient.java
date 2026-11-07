package com.dandi.hospital.notification.client;

import com.dandi.hospital.notification.dto.PushMessage;
import com.dandi.hospital.notification.dto.PushSendResult;

public class DisabledPushClient implements PushClient {
    @Override
    public PushSendResult send(PushMessage message) {
        if (message == null)
            throw new PushClientException(PushClientException.Reason.INVALID_MESSAGE);
        return PushSendResult.disabled();
    }
}
