package com.dandi.hospital.notification.client;

import com.dandi.hospital.notification.dto.PushMessage;
import com.dandi.hospital.notification.dto.PushSendResult;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

import java.util.Objects;

public class FcmPushClient implements PushClient {
    private final FirebaseMessaging messaging;

    public FcmPushClient(FirebaseMessaging messaging) {
        this.messaging = Objects.requireNonNull(messaging);
    }

    @Override
    @SuppressWarnings("deprecation")
    public PushSendResult send(PushMessage message) {
        if (message == null)
            throw new PushClientException(PushClientException.Reason.INVALID_MESSAGE);
        try {
            Message.Builder builder = Message.builder()
                    .setNotification(Notification.builder().setTitle(message.title()).setBody(message.body()).build())
                    .putAllData(message.data());
            switch (message.target().type()) {
                case TOKEN -> builder.setToken(message.target().value());
                case FID -> builder.setFid(message.target().value());
            }
            String messageId = messaging.send(builder.build());
            if (messageId == null || messageId.isBlank())
                throw new PushClientException(PushClientException.Reason.PROVIDER_ERROR);
            return PushSendResult.accepted(messageId);
        } catch (FirebaseMessagingException e) {
            throw new PushClientException(reason(e));
        } catch (IllegalArgumentException e) {
            throw new PushClientException(PushClientException.Reason.INVALID_MESSAGE);
        }
    }

    private PushClientException.Reason reason(FirebaseMessagingException exception) {
        if (exception.getMessagingErrorCode() == null)
            return PushClientException.Reason.PROVIDER_ERROR;
        return switch (exception.getMessagingErrorCode()) {
            case INVALID_ARGUMENT -> PushClientException.Reason.INVALID_ARGUMENT;
            case UNREGISTERED -> PushClientException.Reason.UNREGISTERED;
            case SENDER_ID_MISMATCH -> PushClientException.Reason.SENDER_ID_MISMATCH;
            case QUOTA_EXCEEDED -> PushClientException.Reason.QUOTA_EXCEEDED;
            case UNAVAILABLE -> PushClientException.Reason.UNAVAILABLE;
            case INTERNAL -> PushClientException.Reason.INTERNAL;
            case THIRD_PARTY_AUTH_ERROR -> PushClientException.Reason.THIRD_PARTY_AUTH_ERROR;
            default -> PushClientException.Reason.PROVIDER_ERROR;
        };
    }
}
