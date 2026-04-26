from fastapi import APIRouter
from app.api.v1 import invoices, batches

api_router = APIRouter()
api_router.include_router(invoices.router)
api_router.include_router(batches.router)