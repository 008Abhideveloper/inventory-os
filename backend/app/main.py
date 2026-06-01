from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

from . import crud, models, schemas, auth
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management System API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Inventory & Order Management System API"}

# --- Auth ---
@app.post("/auth/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    return crud.create_user(db=db, user=user, hashed_password=hashed_password)

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Products ---
@app.post("/products", response_model=schemas.ProductResponse, status_code=201)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_product = crud.get_product_by_sku(db, sku=product.sku)
    if db_product:
        raise HTTPException(status_code=400, detail="SKU already registered")
    return crud.create_product(db=db, product=product)

@app.get("/products", response_model=List[schemas.ProductResponse])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    products = crud.get_products(db, skip=skip, limit=limit)
    return products

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_product = crud.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # If updating sku, check for uniqueness
    if product.sku:
        existing = crud.get_product_by_sku(db, sku=product.sku)
        if existing and existing.id != product_id:
            raise HTTPException(status_code=400, detail="SKU already registered by another product")
    
    db_product = crud.update_product(db, product_id=product_id, product_update=product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not crud.delete_product(db, product_id=product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# --- Customers ---
@app.post("/customers", response_model=schemas.CustomerResponse, status_code=201)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_customer = crud.get_customer_by_email(db, email=customer.email)
    if db_customer:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_customer(db=db, customer=customer)

@app.get("/customers", response_model=List[schemas.CustomerResponse])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    customers = crud.get_customers(db, skip=skip, limit=limit)
    return customers

@app.get("/customers/{customer_id}", response_model=schemas.CustomerResponse)
def read_customer(customer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_customer = crud.get_customer(db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not crud.delete_customer(db, customer_id=customer_id):
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}

# --- Orders ---
@app.post("/orders", response_model=schemas.OrderResponse, status_code=201)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.create_order(db=db, order=order)

@app.get("/orders", response_model=List[schemas.OrderResponse])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    orders = crud.get_orders(db, skip=skip, limit=limit)
    return orders

@app.get("/orders/{order_id}", response_model=schemas.OrderResponse)
def read_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if not crud.delete_order(db, order_id=order_id):
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

# --- Dashboard ---
@app.get("/dashboard-summary")
def get_dashboard_summary(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_dashboard_summary(db)
