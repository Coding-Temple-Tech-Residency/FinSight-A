"""
Shared rate limiter instance.

Separated from main.py to avoid circular imports when endpoint
modules (e.g. auth.py) need to apply @limiter.limit() decorators.
See API-A1 security finding.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
