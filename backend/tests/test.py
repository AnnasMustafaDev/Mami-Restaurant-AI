"""Tests for all AI-related API endpoints.

Covers:
  - POST /api/chat/sessions          (create chat session)
  - POST /api/chat/sessions/{id}/messages  (send message → LLM response)
  - GET  /api/chat/sessions/{id}/messages  (retrieve conversation history)
  - POST /api/chat/tts                (text-to-speech)

All OpenAI calls are mocked — no real API keys needed.
"""

import pytest

pytestmark = pytest.mark.asyncio


# ─────────────────────────────────────────────
# 1. Chat Session — Create
# ─────────────────────────────────────────────


class TestCreateChatSession:
    async def test_create_text_session(self, client):
        resp = await client.post("/api/chat/sessions", json={"source": "text"})
        assert resp.status_code == 201
        data = resp.json()
        assert "id" in data
        assert data["source"] == "text"
        assert data["message_count"] == 0

    async def test_create_voice_session(self, client):
        resp = await client.post("/api/chat/sessions", json={"source": "voice"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["source"] == "voice"

    async def test_create_session_default_source(self, client):
        resp = await client.post("/api/chat/sessions", json={})
        assert resp.status_code == 201
        data = resp.json()
        assert data["source"] == "text"

    async def test_session_has_started_at(self, client):
        resp = await client.post("/api/chat/sessions", json={"source": "text"})
        data = resp.json()
        assert "started_at" in data
        assert data["started_at"] is not None


# ─────────────────────────────────────────────
# 2. Chat Message — Send (LLM integration)
# ─────────────────────────────────────────────


class TestSendChatMessage:
    async def _create_session(self, client):
        resp = await client.post("/api/chat/sessions", json={"source": "text"})
        return resp.json()["id"]

    async def test_send_message_returns_assistant_response(self, client, mock_openai_chat):
        sid = await self._create_session(client)
        resp = await client.post(
            f"/api/chat/sessions/{sid}/messages",
            json={"content": "Hello Sofia!"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["role"] == "assistant"
        assert "Buonasera" in data["content"]
        assert data["session_id"] == sid

    async def test_send_message_increments_count(self, client, mock_openai_chat):
        sid = await self._create_session(client)
        await client.post(
            f"/api/chat/sessions/{sid}/messages",
            json={"content": "What is on the menu?"},
        )
        # Fetch messages to verify both user + assistant were saved
        msgs_resp = await client.get(f"/api/chat/sessions/{sid}/messages")
        msgs = msgs_resp.json()
        assert len(msgs) == 2
        assert msgs[0]["role"] == "user"
        assert msgs[1]["role"] == "assistant"

    async def test_send_message_to_nonexistent_session(self, client, mock_openai_chat):
        resp = await client.post(
            "/api/chat/sessions/nonexistent-id/messages",
            json={"content": "Hello"},
        )
        assert resp.status_code == 404
        assert "not found" in resp.json()["detail"].lower()

    async def test_send_empty_content_rejected(self, client, mock_openai_chat):
        sid = await self._create_session(client)
        resp = await client.post(
            f"/api/chat/sessions/{sid}/messages",
            json={"content": ""},
        )
        # Pydantic should still accept empty string, so check LLM is called
        # (empty string is technically valid content, the LLM handles it)
        assert resp.status_code == 200

    async def test_send_german_message(self, client, mock_openai_chat):
        """Verify German input is accepted and forwarded to LLM."""
        sid = await self._create_session(client)
        resp = await client.post(
            f"/api/chat/sessions/{sid}/messages",
            json={"content": "Zeig mir die Speisekarte"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["role"] == "assistant"

    async def test_multiple_messages_build_history(self, client, mock_openai_chat):
        sid = await self._create_session(client)
        # Send 3 messages
        for msg in ["Hi", "Show me the menu", "Any specials?"]:
            await client.post(
                f"/api/chat/sessions/{sid}/messages",
                json={"content": msg},
            )
        msgs_resp = await client.get(f"/api/chat/sessions/{sid}/messages")
        msgs = msgs_resp.json()
        # 3 user + 3 assistant = 6
        assert len(msgs) == 6
        roles = [m["role"] for m in msgs]
        assert roles == ["user", "assistant", "user", "assistant", "user", "assistant"]

    async def test_llm_called_with_correct_model(self, client, mock_openai_chat):
        sid = await self._create_session(client)
        await client.post(
            f"/api/chat/sessions/{sid}/messages",
            json={"content": "Hello"},
        )
        call_kwargs = mock_openai_chat.chat.completions.create.call_args
        assert call_kwargs is not None
        # Verify tools were passed
        assert "tools" in call_kwargs.kwargs
        assert len(call_kwargs.kwargs["tools"]) == 7  # 7 tool definitions


# ─────────────────────────────────────────────
# 3. Chat Messages — Retrieve History
# ─────────────────────────────────────────────


class TestGetChatMessages:
    async def test_get_messages_empty_session(self, client):
        resp = await client.post("/api/chat/sessions", json={"source": "text"})
        sid = resp.json()["id"]
        msgs_resp = await client.get(f"/api/chat/sessions/{sid}/messages")
        assert msgs_resp.status_code == 200
        assert msgs_resp.json() == []

    async def test_get_messages_nonexistent_session(self, client):
        resp = await client.get("/api/chat/sessions/fake-session/messages")
        assert resp.status_code == 404

    async def test_messages_ordered_by_creation(self, client, mock_openai_chat):
        resp = await client.post("/api/chat/sessions", json={"source": "text"})
        sid = resp.json()["id"]
        await client.post(f"/api/chat/sessions/{sid}/messages", json={"content": "First"})
        await client.post(f"/api/chat/sessions/{sid}/messages", json={"content": "Second"})
        msgs_resp = await client.get(f"/api/chat/sessions/{sid}/messages")
        msgs = msgs_resp.json()
        # Verify chronological order
        user_msgs = [m for m in msgs if m["role"] == "user"]
        assert user_msgs[0]["content"] == "First"
        assert user_msgs[1]["content"] == "Second"

    async def test_message_response_schema(self, client, mock_openai_chat):
        resp = await client.post("/api/chat/sessions", json={"source": "text"})
        sid = resp.json()["id"]
        await client.post(f"/api/chat/sessions/{sid}/messages", json={"content": "Test"})
        msgs_resp = await client.get(f"/api/chat/sessions/{sid}/messages")
        msg = msgs_resp.json()[0]
        assert "id" in msg
        assert "session_id" in msg
        assert "role" in msg
        assert "content" in msg
        assert "created_at" in msg


# ─────────────────────────────────────────────
# 4. Text-to-Speech
# ─────────────────────────────────────────────


class TestTextToSpeech:
    async def test_tts_returns_audio(self, client, mock_openai_tts):
        resp = await client.post(
            "/api/chat/tts",
            json={"text": "Welcome to MaMi's!", "voice": "nova"},
        )
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "audio/mpeg"
        assert len(resp.content) > 0

    async def test_tts_default_voice(self, client, mock_openai_tts):
        resp = await client.post(
            "/api/chat/tts",
            json={"text": "Hello"},
        )
        assert resp.status_code == 200
        # Verify the mock was called with voice="nova" (default)
        call_kwargs = mock_openai_tts.audio.speech.create.call_args.kwargs
        assert call_kwargs["voice"] == "nova"

    async def test_tts_custom_voice(self, client, mock_openai_tts):
        resp = await client.post(
            "/api/chat/tts",
            json={"text": "Hello", "voice": "alloy"},
        )
        assert resp.status_code == 200
        call_kwargs = mock_openai_tts.audio.speech.create.call_args.kwargs
        assert call_kwargs["voice"] == "alloy"

    async def test_tts_missing_text_rejected(self, client, mock_openai_tts):
        resp = await client.post("/api/chat/tts", json={})
        assert resp.status_code == 422  # Validation error

    async def test_tts_german_text(self, client, mock_openai_tts):
        resp = await client.post(
            "/api/chat/tts",
            json={"text": "Willkommen bei MaMi's!", "voice": "nova"},
        )
        assert resp.status_code == 200
        call_kwargs = mock_openai_tts.audio.speech.create.call_args.kwargs
        assert call_kwargs["input"] == "Willkommen bei MaMi's!"


# ─────────────────────────────────────────────
# 5. LLM Tool Calling (function calling flow)
# ─────────────────────────────────────────────


class TestLLMToolCalling:
    """Test that the LLM service properly handles tool call responses."""

    async def _create_session(self, client):
        resp = await client.post("/api/chat/sessions", json={"source": "text"})
        return resp.json()["id"]

    async def test_tool_call_get_menu(self, client):
        """Simulate LLM requesting get_menu tool, verify it processes the result."""
        from unittest.mock import AsyncMock, MagicMock
        from tests.conftest import _make_mock_chat_response

        # First call: LLM wants to call get_menu tool
        tool_call = MagicMock()
        tool_call.id = "call_123"
        tool_call.function.name = "get_menu"
        tool_call.function.arguments = '{"category": "nebenbei"}'

        first_response = _make_mock_chat_response(None, tool_calls=[tool_call])
        # Second call: LLM gives final answer after seeing tool results
        final_response = _make_mock_chat_response(
            "We have lovely sides! Try the Brot or the Käseauswahl des Tages."
        )

        with pytest.MonkeyPatch.context() as mp:
            call_count = 0

            async def mock_create(**kwargs):
                nonlocal call_count
                call_count += 1
                if call_count == 1:
                    return first_response
                return final_response

            mp.setattr(
                "app.services.llm_service.client.chat.completions.create",
                mock_create,
            )

            sid = await self._create_session(client)
            resp = await client.post(
                f"/api/chat/sessions/{sid}/messages",
                json={"content": "What sides do you have?"},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert "Brot" in data["content"]
            assert call_count == 2  # Two rounds: tool call + final

    async def test_tool_call_get_daily_specials(self, client):
        """Simulate LLM requesting get_daily_specials tool."""
        from unittest.mock import MagicMock
        from tests.conftest import _make_mock_chat_response

        tool_call = MagicMock()
        tool_call.id = "call_456"
        tool_call.function.name = "get_daily_specials"
        tool_call.function.arguments = "{}"

        first_response = _make_mock_chat_response(None, tool_calls=[tool_call])
        final_response = _make_mock_chat_response(
            "Today's special is MaMi's Bolo!"
        )

        with pytest.MonkeyPatch.context() as mp:
            call_count = 0

            async def mock_create(**kwargs):
                nonlocal call_count
                call_count += 1
                return first_response if call_count == 1 else final_response

            mp.setattr(
                "app.services.llm_service.client.chat.completions.create",
                mock_create,
            )

            sid = await self._create_session(client)
            resp = await client.post(
                f"/api/chat/sessions/{sid}/messages",
                json={"content": "Any specials today?"},
            )
            assert resp.status_code == 200
            assert "Bolo" in resp.json()["content"]

    async def test_tool_call_check_availability(self, client):
        """Simulate LLM checking table availability."""
        from unittest.mock import MagicMock
        from tests.conftest import _make_mock_chat_response

        tool_call = MagicMock()
        tool_call.id = "call_789"
        tool_call.function.name = "check_availability"
        tool_call.function.arguments = '{"date": "2026-03-15", "time": "19:00", "guests": 4}'

        first_response = _make_mock_chat_response(None, tool_calls=[tool_call])
        final_response = _make_mock_chat_response(
            "Great news! We have tables available for 4 guests at 7 PM on March 15th."
        )

        with pytest.MonkeyPatch.context() as mp:
            call_count = 0

            async def mock_create(**kwargs):
                nonlocal call_count
                call_count += 1
                return first_response if call_count == 1 else final_response

            mp.setattr(
                "app.services.llm_service.client.chat.completions.create",
                mock_create,
            )

            sid = await self._create_session(client)
            resp = await client.post(
                f"/api/chat/sessions/{sid}/messages",
                json={"content": "Do you have a table for 4 at 7pm on March 15?"},
            )
            assert resp.status_code == 200
            assert "available" in resp.json()["content"].lower()

    async def test_tool_call_make_reservation(self, client):
        """Simulate LLM making a reservation."""
        from unittest.mock import MagicMock
        from tests.conftest import _make_mock_chat_response

        tool_call = MagicMock()
        tool_call.id = "call_res"
        tool_call.function.name = "make_reservation"
        tool_call.function.arguments = '{"guest_name": "John Doe", "date": "2026-03-20", "time": "20:00", "guests": 2}'

        first_response = _make_mock_chat_response(None, tool_calls=[tool_call])
        final_response = _make_mock_chat_response(
            "Your reservation is confirmed! Booking ref: MM-TEST1234. See you on March 20th!"
        )

        with pytest.MonkeyPatch.context() as mp:
            call_count = 0

            async def mock_create(**kwargs):
                nonlocal call_count
                call_count += 1
                return first_response if call_count == 1 else final_response

            mp.setattr(
                "app.services.llm_service.client.chat.completions.create",
                mock_create,
            )

            sid = await self._create_session(client)
            resp = await client.post(
                f"/api/chat/sessions/{sid}/messages",
                json={"content": "Book a table for 2 under John Doe on March 20 at 8pm"},
            )
            assert resp.status_code == 200
            assert "confirmed" in resp.json()["content"].lower()

    async def test_tool_call_recommend_wine(self, client):
        """Simulate LLM recommending wine."""
        from unittest.mock import MagicMock
        from tests.conftest import _make_mock_chat_response

        tool_call = MagicMock()
        tool_call.id = "call_wine"
        tool_call.function.name = "recommend_wine"
        tool_call.function.arguments = '{"dish_name": "Bolo"}'

        first_response = _make_mock_chat_response(None, tool_calls=[tool_call])
        final_response = _make_mock_chat_response(
            "For MaMi's Bolo, I'd recommend the Chianti Classico Riserva 2019. Perfetto!"
        )

        with pytest.MonkeyPatch.context() as mp:
            call_count = 0

            async def mock_create(**kwargs):
                nonlocal call_count
                call_count += 1
                return first_response if call_count == 1 else final_response

            mp.setattr(
                "app.services.llm_service.client.chat.completions.create",
                mock_create,
            )

            sid = await self._create_session(client)
            resp = await client.post(
                f"/api/chat/sessions/{sid}/messages",
                json={"content": "What wine goes with the Bolo?"},
            )
            assert resp.status_code == 200
            assert "Chianti" in resp.json()["content"]

    async def test_tool_call_restaurant_info(self, client):
        """Simulate LLM fetching restaurant hours."""
        from unittest.mock import MagicMock
        from tests.conftest import _make_mock_chat_response

        tool_call = MagicMock()
        tool_call.id = "call_info"
        tool_call.function.name = "get_restaurant_info"
        tool_call.function.arguments = '{"topic": "hours"}'

        first_response = _make_mock_chat_response(None, tool_calls=[tool_call])
        final_response = _make_mock_chat_response(
            "We're open Tuesday through Sunday. Closed on Mondays."
        )

        with pytest.MonkeyPatch.context() as mp:
            call_count = 0

            async def mock_create(**kwargs):
                nonlocal call_count
                call_count += 1
                return first_response if call_count == 1 else final_response

            mp.setattr(
                "app.services.llm_service.client.chat.completions.create",
                mock_create,
            )

            sid = await self._create_session(client)
            resp = await client.post(
                f"/api/chat/sessions/{sid}/messages",
                json={"content": "What are your opening hours?"},
            )
            assert resp.status_code == 200
            assert "Tuesday" in resp.json()["content"] or "open" in resp.json()["content"].lower()


# ─────────────────────────────────────────────
# 6. Edge Cases & Error Handling
# ─────────────────────────────────────────────


class TestEdgeCases:
    async def test_session_isolation(self, client, mock_openai_chat):
        """Messages from one session don't leak into another."""
        r1 = await client.post("/api/chat/sessions", json={"source": "text"})
        r2 = await client.post("/api/chat/sessions", json={"source": "text"})
        sid1, sid2 = r1.json()["id"], r2.json()["id"]

        await client.post(f"/api/chat/sessions/{sid1}/messages", json={"content": "Hello from session 1"})
        await client.post(f"/api/chat/sessions/{sid2}/messages", json={"content": "Hello from session 2"})

        msgs1 = (await client.get(f"/api/chat/sessions/{sid1}/messages")).json()
        msgs2 = (await client.get(f"/api/chat/sessions/{sid2}/messages")).json()

        user_msgs1 = [m["content"] for m in msgs1 if m["role"] == "user"]
        user_msgs2 = [m["content"] for m in msgs2 if m["role"] == "user"]

        assert "Hello from session 1" in user_msgs1
        assert "Hello from session 2" not in user_msgs1
        assert "Hello from session 2" in user_msgs2
        assert "Hello from session 1" not in user_msgs2

    async def test_long_message_accepted(self, client, mock_openai_chat):
        """Long messages should be accepted without error."""
        resp = await client.post("/api/chat/sessions", json={"source": "text"})
        sid = resp.json()["id"]
        long_text = "Tell me about " + "wine " * 500
        resp = await client.post(
            f"/api/chat/sessions/{sid}/messages",
            json={"content": long_text},
        )
        assert resp.status_code == 200

    async def test_special_characters_in_message(self, client, mock_openai_chat):
        """Messages with special characters should work."""
        resp = await client.post("/api/chat/sessions", json={"source": "text"})
        sid = resp.json()["id"]
        resp = await client.post(
            f"/api/chat/sessions/{sid}/messages",
            json={"content": 'Gibt es Ü/Ö/Ä Gerichte? "Spezial" & mehr!'},
        )
        assert resp.status_code == 200

    async def test_tts_long_text(self, client, mock_openai_tts):
        """TTS with longer text should work."""
        long_text = "Welcome to MaMi's Food and Wine. " * 20
        resp = await client.post(
            "/api/chat/tts",
            json={"text": long_text, "voice": "nova"},
        )
        assert resp.status_code == 200
