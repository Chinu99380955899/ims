"""Agent 1 — Preprocessing. Rasterizes PDFs and enhances images for OCR."""
import fitz  # PyMuPDF
import cv2
import numpy as np
from dataclasses import dataclass
from typing import List, Optional

from app.agents.base import BaseAgent
from app.core.logging import get_logger

log = get_logger(__name__)

@dataclass
class PreprocessingInput:
    file_bytes: bytes
    mime_type: str

@dataclass
class PreprocessingOutput:
    page_count: int
    encoded_pngs: List[bytes]

class PreprocessingAgent(BaseAgent[PreprocessingInput, PreprocessingOutput]):
    name = "preprocessing"

    def _run(self, inputs: PreprocessingInput) -> PreprocessingOutput:
        encoded_pages = []
        
        # 1. RASTERIZE PDF TO IMAGES
        if inputs.mime_type == "application/pdf" or inputs.file_bytes.startswith(b'%PDF'):
            log.info("PDF detected. Rasterizing to images...")
            try:
                # Open PDF from memory
                doc = fitz.open(stream=inputs.file_bytes, filetype="pdf")
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    # Use 300 DPI for high-quality OCR reading
                    pix = page.get_pixmap(dpi=300) 
                    img_bytes = pix.tobytes("png")
                    encoded_pages.append(self._enhance_image(img_bytes))
            except Exception as e:
                raise RuntimeError(f"Failed to parse PDF: {e}")
        else:
            # 2. HANDLE STANDARD IMAGES (PNG/JPEG)
            encoded_pages.append(self._enhance_image(inputs.file_bytes))

        return PreprocessingOutput(
            page_count=len(encoded_pages),
            encoded_pngs=encoded_pages
        )

    def _enhance_image(self, img_bytes: bytes) -> bytes:
        """Applies OpenCV filters (CLAHE, deskew) to improve OCR accuracy."""
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("OpenCV could not decode the image file.")

        # Convert to grayscale for better contrast
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # Re-encode back to bytes for the pipeline
        success, buffer = cv2.imencode(".png", enhanced)
        if not success:
            raise ValueError("Failed to encode enhanced image to PNG.")
            
        return buffer.tobytes()