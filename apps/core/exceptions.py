from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'success': False,
            'error': {
                'code': exc.__class__.__name__,
                'message': str(exc),
                'details': response.data
            }
        }
        response.data = custom_data
    else:
        logger.exception("Unhandled server exception: %s", exc)
        response = Response({
            'success': False,
            'error': {
                'code': 'InternalServerError',
                'message': 'An unexpected server error occurred.',
                'details': str(exc)
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
