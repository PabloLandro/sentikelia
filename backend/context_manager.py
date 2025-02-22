from collections import defaultdict

current_chats = defaultdict(str)
WORD_LIMIT = 1000 

def append_context(username, new_contexto):
    """Appends new context while ensuring the total word count stays within the limit."""
    current_chats[username] += " " + new_contexto  # Append new context

    # Split words and enforce the limit
    words = current_chats[username].split()
    if len(words) > WORD_LIMIT:
        current_chats[username] = " ".join(words[-WORD_LIMIT:])  # Keep last 1000 words

def close_chat(username):
    """Removes the chat context for a user."""
    current_chats.pop(username, None)
