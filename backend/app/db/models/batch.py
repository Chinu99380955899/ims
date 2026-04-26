"""Database model for Invoice Upload Batches."""
from sqlalchemy import Column, Integer
from sqlalchemy.orm import relationship

# Here is the correct import from your user.py!
from app.db.base import Base, TimestampMixin, UUIDPrimaryKey

class Batch(Base, UUIDPrimaryKey, TimestampMixin):
    __tablename__ = "batches"

    expected_invoice_count = Column(Integer, nullable=False)
    invoices = relationship("Invoice", back_populates="batch")