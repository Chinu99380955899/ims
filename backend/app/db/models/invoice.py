"""Database model for Invoices and Invoice Items."""
import enum
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, JSON
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

# The correct import from your user.py!
from app.db.base import Base, TimestampMixin, UUIDPrimaryKey

class InvoiceStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    AUTO_APPROVED = "AUTO_APPROVED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    APPROVED = "APPROVED"
    POSTED = "POSTED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"

class Invoice(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "invoices"

    original_filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    file_hash = Column(String, nullable=False, index=True)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String, nullable=False)
    
    uploaded_by_id = Column(UUID(as_uuid=True), nullable=True) 
    
    # The new Batch relationship
    batch_id = Column(UUID(as_uuid=True), ForeignKey("batches.id", ondelete="SET NULL"), nullable=True)
    batch = relationship("Batch", back_populates="invoices")
    
    status = Column(SAEnum(InvoiceStatus, name="invoice_status"), default=InvoiceStatus.UPLOADED, nullable=False, index=True)
    vendor_name = Column(String, nullable=True)
    invoice_number = Column(String, nullable=True)
    invoice_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    currency = Column(String, default="USD")
    subtotal = Column(Float, nullable=True)
    tax_amount = Column(Float, nullable=True)
    total_amount = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    
    raw_data = Column(JSON, nullable=True)
    
    # Restored relationship to InvoiceItem
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")

# 🌟 Restored InvoiceItem class! 🌟
class InvoiceItem(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "invoice_items"

    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(String, nullable=False)
    quantity = Column(Float, nullable=True)
    unit_price = Column(Float, nullable=True)
    amount = Column(Float, nullable=True)
    
    invoice = relationship("Invoice", back_populates="items")