from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1)
    sku: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    quantity: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    class Config:
        from_attributes = True

# --- Order Schemas ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_time: float
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]
    class Config:
        from_attributes = True

# --- Auth Schemas ---
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

