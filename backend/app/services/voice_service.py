"""LiveKit token generation for voice sessions."""

from livekit.api import AccessToken, VideoGrants

from app.core.config import settings


def create_voice_token(session_id: str, participant_name: str = "guest") -> tuple[str, str]:
    """Generate a LiveKit access token for a voice session.

    Returns (token_jwt, room_name).
    """
    room_name = f"mami-voice-{session_id}"

    token = (
        AccessToken(settings.LIVEKIT_API_KEY, settings.LIVEKIT_API_SECRET)
        .with_identity(f"guest-{session_id[:8]}")
        .with_name(participant_name)
        .with_grants(
            VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
            )
        )
        .to_jwt()
    )

    return token, room_name
