# models/errors.py
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    message: str


class ValidationErrorResponse(BaseModel):
    detail: list[dict]  # matches flask-openapi3's 422 shape


class NotFoundResponse(BaseModel):
    detail: str
