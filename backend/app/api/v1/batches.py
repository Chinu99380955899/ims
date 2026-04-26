"""API endpoints for managing Invoice Upload Batches."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any

from app.api.deps import CurrentUser, DBSession
from app.db.models.batch import Batch
from app.db.models.invoice import Invoice

router = APIRouter(prefix="/batches", tags=["batches"])

# Input Schema
class BatchCreate(BaseModel):
    total_invoices: int

@router.post("", summary="Create a new upload batch")
def create_batch(
    req: BatchCreate, 
    db: DBSession, 
    _user: CurrentUser
) -> Any:
    """Creates a new batch session to group multiple invoice uploads together."""
    new_batch = Batch(expected_invoice_count=req.total_invoices)
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    
    return {
        "id": str(new_batch.id),
        "timestamp": new_batch.created_at,
        "totalInvoices": new_batch.expected_invoice_count,
        "invoices": []
    }

@router.get("", summary="Get all batches with their invoices")
def get_batches(
    db: DBSession, 
    _user: CurrentUser
) -> Any:
    """Retrieves all historical batches and the invoices inside them."""
    # Fetch batches ordered by newest first
    batches = db.query(Batch).order_by(Batch.created_at.desc()).limit(50).all()
    
    result = []
    for b in batches:
        # Get all invoices linked to this batch
        invoices = db.query(Invoice).filter(Invoice.batch_id == b.id).all()
        result.append({
            "id": str(b.id),
            "timestamp": b.created_at,
            "totalInvoices": b.expected_invoice_count,
            "invoices": invoices
        })
        
    return result