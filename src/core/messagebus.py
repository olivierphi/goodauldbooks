import logging
import typing as t

from pymessagebus import CommandBus
from pymessagebus.middleware.logger import (
    get_logger_middleware,
    LoggingMiddlewareConfig,
)

_MESSAGE_BUSES_LOGGER = logging.getLogger("message_bus")
_logging_middleware_config = LoggingMiddlewareConfig(
    mgs_received_level=logging.INFO,
    mgs_succeeded_level=logging.INFO,
    mgs_failed_level=logging.CRITICAL,
)
_MESSAGE_BUSES_LOGGING_MIDDLEWARE = get_logger_middleware(
    _MESSAGE_BUSES_LOGGER, _logging_middleware_config
)


_QUERY_BUS = CommandBus(middlewares=[_MESSAGE_BUSES_LOGGING_MIDDLEWARE], locking=False)

# Public API:
# This is our handy decorator:
def register_query_handler(message_class: type):
    def decorator(handler: t.Callable):
        _QUERY_BUS.add_handler(message_class, handler)
        return handler

    return decorator


# And those are aliases to our "default" singleton instance:
# pylint: disable=invalid-name
handle_query = _QUERY_BUS.handle
